// renderer/engine/receipts.ts

import crypto from 'crypto'

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function canonicalJson(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort())
}

function generateReceipt(state, lotId) {
  const lot = state.lots.find((l) => l.id === lotId)
  if (!lot) throw new Error("Lot not found")

  if (lot.status !== "sold" && lot.status !== "unsold") {
    throw new Error("Receipt can only be generated for sold or unsold lots")
  }

  const lotEvents = state.officialEvents.filter(
    (event) =>
      event.payload &&
      event.payload.lotId === lotId
  )

  const canonical = canonicalJson({
    sessionId: state.session.id,
    lotId,
    events: lotEvents
  })

  const resultHash = sha256(canonical)

  return {
    sessionId: state.session.id,
    lotId,
    winnerId: lot.winnerId,
    finalAmount: lot.status === "sold" ? lot.currentPrice : undefined,
    status: lot.status,
    eventCount: lotEvents.length,
    resultHash,
    createdAt: Date.now(),
    signedBy: state.session.hostId
  }
}

export {
  generateReceipt
}
