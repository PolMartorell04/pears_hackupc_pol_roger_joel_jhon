// workers/main.js

const b4a = require('b4a')
const { createHostNetwork, createBidderNetwork } = require('../src/p2p/auctionNetwork.js')

const ipc = Bare.IPC

let network = null
let role = null

function send(message) {
  ipc.write(b4a.from(JSON.stringify(message)))
}

async function handleMessage(message) {
  if (message.type === 'START_HOST') {
    role = 'host'

    network = await createHostNetwork({
      sessionId: message.sessionId,
      hostId: message.hostId
    })

    network.onMessage(send)

    send({
      type: 'HOST_READY',
      joinCode: network.joinCode
    })

    return
  }

  if (message.type === 'JOIN_SESSION') {
    role = 'bidder'

    network = await createBidderNetwork(message.joinCode, message.participant)
    network.onMessage(send)

    await network.sendJoinRequest()

    send({
      type: 'JOIN_READY',
      participant: message.participant
    })

    return
  }

  if (message.type === 'SEND_BID') {
    if (!network || role !== 'bidder') {
      throw new Error('Bidder network is not ready')
    }

    await network.sendBidRequest(message.bid)

    send({
      type: 'BID_SENT',
      bid: message.bid
    })

    return
  }

  if (message.type === 'PUBLISH_EVENT') {
    if (!network || role !== 'host') {
      throw new Error('Host network is not ready')
    }

    await network.appendOfficialEvent(message.event)
  }
}

ipc.on('data', (data) => {
  try {
    const text = b4a.toString(data)
    const message = JSON.parse(text)

    handleMessage(message).catch((err) => {
      send({
        type: 'WORKER_ERROR',
        message: err.message
      })
    })
  } catch (err) {
    send({
      type: 'WORKER_ERROR',
      message: err.message
    })
  }
})
