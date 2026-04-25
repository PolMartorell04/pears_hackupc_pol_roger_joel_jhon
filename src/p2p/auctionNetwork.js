// src/p2p/auctionNetwork.js

const Hyperswarm = require('hyperswarm')
const Corestore = require('corestore')
const b4a = require('b4a')
const Autopass = require('autopass')
const crypto = require('hypercore-crypto')

function topicFromKey(key) {
  return crypto.discoveryKey(key)
}

function createId() {
  return b4a.toString(crypto.randomBytes(16), 'hex')
}

function encode(obj) {
  return b4a.from(JSON.stringify(obj))
}

function decode(buf) {
  try {
    return JSON.parse(b4a.toString(buf))
  } catch {
    return null
  }
}

/* =========================================================
   HOST
========================================================= */

async function createHostNetwork({ sessionId, hostId }) {
  const store = new Corestore('./auction-db-' + sessionId)
  await store.ready()

  const swarm = new Hyperswarm()

  const inputSwarm = new Hyperswarm()
  const inputTopic = crypto.randomBytes(32)

  const officialLog = store.get({ name: 'official-log' })
  await officialLog.ready()

  const autopass = new Autopass(store)
  await autopass.ready()

  const invite = await autopass.createInvite({ readOnly: false })
  const topic = topicFromKey(officialLog.key)

  swarm.join(topic, { server: true, client: true })

  swarm.on('connection', (socket) => {
    const replication = store.replicate(socket)
    socket.on('error', () => {})
    replication.on('error', () => {})
  })

  inputSwarm.join(inputTopic, { server: true, client: true })

  inputSwarm.on('connection', (socket) => {
    socket.on('data', (data) => {
      const lines = b4a.toString(data).split('\n').filter(Boolean)

      for (const line of lines) {
        const msg = decode(b4a.from(line))
        if (!msg || !msg.id) continue
        if (seen.has(msg.id)) continue

        seen.add(msg.id)

        if (msg.type === 'BID_REQUEST' || msg.type === 'JOIN_REQUEST') {
          emit({
            type: 'autopass-input',
            payload: msg
          })
        }
      }
    })

    socket.on('error', () => {})
  })

  const messageListeners = []

  function emit(msg) {
    for (const listener of messageListeners) {
      listener(msg)
    }
  }

  const seen = new Set()

  autopass.on('update', async () => {
    try {
      const stream = autopass.list()

      for await (const entry of stream) {
        if (!entry || !entry.value) continue

        const data = decode(entry.value)
        if (!data || !data.id) continue

        if (seen.has(data.id)) continue
        seen.add(data.id)

        if (data.type === 'BID_REQUEST' || data.type === 'JOIN_REQUEST') {
          emit({
            type: 'autopass-input',
            payload: data
          })
        }
      }
    } catch (err) {
      emit({
        type: 'network-error',
        payload: {
          message: err.message
        }
      })
    }
  })

  let officialLastIndex = 0

  officialLog.on('append', async () => {
    const length = officialLog.length

    for (let i = officialLastIndex; i < length; i++) {
      const block = await officialLog.get(i)
      const data = decode(block)

      if (!data || !data.id) continue
      if (seen.has(data.id)) continue
      seen.add(data.id)

      if (data.type === 'BID_REQUEST' || data.type === 'JOIN_REQUEST') {
        emit({
          type: 'autopass-input',
          payload: data
        })
      }
    }

    officialLastIndex = length
  })

  async function appendOfficialEvent(event) {
    await officialLog.append(encode(event))

    emit({
      type: 'official-event',
      payload: event
    })

    return true
  }

  function onMessage(cb) {
    messageListeners.push(cb)
  }

  const joinCode = {
    sessionId,
    hostId,
    officialLogKey: b4a.toString(officialLog.key, 'hex'),
    autopassInvite: invite,
    discoveryTopic: b4a.toString(topic, 'hex'),
    inputTopic: b4a.toString(inputTopic, 'hex')
  }

  return {
    joinCode,
    onMessage,
    appendOfficialEvent
  }
}

/* =========================================================
   BIDDER
========================================================= */

async function createBidderNetwork(joinCode, participant) {
  const store = new Corestore('./auction-db-client-' + joinCode.sessionId)
  await store.ready()

  const swarm = new Hyperswarm()

  const inputSwarm = new Hyperswarm()
  const inputSockets = new Set()
  let inputReady = false
  const pendingInputs = []

  const officialLogKey = b4a.from(joinCode.officialLogKey, 'hex')
  const officialLog = store.get({ key: officialLogKey })
  await officialLog.ready()

  const autopass = new Autopass(store)
  await autopass.ready()

  const topic = b4a.from(joinCode.discoveryTopic, 'hex')

  swarm.join(topic, { server: false, client: true })

  const inputTopic = b4a.from(joinCode.inputTopic, 'hex')

  inputSwarm.join(inputTopic, { server: false, client: true })

  inputSwarm.on('connection', (socket) => {
    inputSockets.add(socket)
    inputReady = true

    socket.on('close', () => inputSockets.delete(socket))
    socket.on('error', () => inputSockets.delete(socket))

    while (pendingInputs.length > 0) {
      socket.write(pendingInputs.shift())
    }
  })

  function sendInput(msg) {
    const encoded = b4a.from(JSON.stringify(msg) + '\n')

    if (!inputReady || inputSockets.size === 0) {
      pendingInputs.push(encoded)
      return
    }

    for (const socket of inputSockets) {
      socket.write(encoded)
    }
  }

  swarm.on('connection', (socket) => {
    const replication = store.replicate(socket)
    socket.on('error', () => {})
    replication.on('error', () => {})
  })

  const messageListeners = []

  function emit(msg) {
    for (const listener of messageListeners) {
      listener(msg)
    }
  }

  let lastIndex = 0

  officialLog.on('append', async () => {
    const length = officialLog.length

    for (let i = lastIndex; i < length; i++) {
      const block = await officialLog.get(i)
      const event = decode(block)
      if (!event) continue

      emit({
        type: 'official-event',
        payload: event
      })
    }

    lastIndex = length
  })

  async function sendBidRequest(bidRequest) {
    const msg = {
      type: 'BID_REQUEST',
      ...bidRequest,
      createdAt: Date.now(),
      id: createId()
    }

    sendInput(msg)
    return true
  }

  async function sendJoinRequest() {
    const msg = {
      type: 'JOIN_REQUEST',
      participant,
      createdAt: Date.now(),
      id: createId()
    }

    sendInput(msg)

    return true
  }

  function onMessage(cb) {
    messageListeners.push(cb)
  }

  return {
    onMessage,
    sendBidRequest,
    sendJoinRequest
  }
}

module.exports = {
  createHostNetwork,
  createBidderNetwork
}
