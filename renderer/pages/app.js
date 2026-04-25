// renderer/pages/app.js

const bridge = window.bridge
const WORKER = '/workers/main.js'
const decoder = new TextDecoder('utf-8')

const messageListeners = []

function emit(msg) {
  for (const l of messageListeners) l(msg)
}

const workerReady = (async () => {
  console.log('Starting worker:', WORKER)

  await bridge.startWorker(WORKER)

  console.log('Worker started:', WORKER)

  bridge.onWorkerStdout(WORKER, (data) => {
    console.log('worker stdout:', decoder.decode(data))
  })

  bridge.onWorkerStderr(WORKER, (data) => {
    console.error('worker stderr:', decoder.decode(data))
  })

  bridge.onWorkerIPC(WORKER, (data) => {
    const raw = decoder.decode(data)
    console.log('WORKER RAW →', raw)

    for (const chunk of raw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)) {
      try {
        const msg = JSON.parse(chunk)
        console.log('WORKER →', msg)
        emit(msg)
      } catch (err) {
        console.error('Invalid worker message:', chunk, err)
      }
    }
  })

  bridge.onWorkerExit(WORKER, (code) => {
    console.error('Worker exited:', code)
  })
})()

async function sendToWorker(msg) {
  await workerReady

  bridge.writeWorkerIPC(WORKER, JSON.stringify(msg))
}

export function onNetworkMessage(cb) {
  messageListeners.push(cb)
}

export async function startHostSession(state) {
  await sendToWorker({
    type: 'START_HOST',
    sessionId: state.session.id,
    hostId: state.session.hostId
  })
}

export async function joinSession(joinCode, participant) {
  await sendToWorker({
    type: 'JOIN_SESSION',
    joinCode,
    participant
  })
}

export async function sendBidRequest(bid) {
  await sendToWorker({
    type: 'SEND_BID',
    bid
  })
}

export async function publishOfficialEvent(event) {
  await sendToWorker({
    type: 'PUBLISH_EVENT',
    event
  })
}

window.startHost = async (state) => startHostSession(state)
window.join = async (joinCode, participant) => joinSession(joinCode, participant)
window.bid = async (bid) => sendBidRequest(bid)
window.onNetworkMessage = onNetworkMessage
