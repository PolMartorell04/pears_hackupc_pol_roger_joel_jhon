import { validateBid } from './validation.js'
import { EventTypes } from './events.js'

export function handleBidRequest(state, bidRequest, sequence) {
  const { sessionId, lotId, bidderId, amount } = bidRequest

  const validation = validateBid(state, bidRequest)

  if (!validation.ok) {
    return {
      type: EventTypes.BID_REJECTED,
      sessionId,
      sequence,
      createdAt: Date.now(),
      payload: {
        bidderId,
        lotId,
        amount,
        reason: validation.reason
      }
    }
  }

  return {
    type: EventTypes.BID_ACCEPTED,
    sessionId,
    sequence,
    createdAt: Date.now(),
    payload: {
      bidderId,
      lotId,
      amount
    }
  }
}

export function handleBidRequestEvents(state, bidRequest, sequence) {
  return [handleBidRequest(state, bidRequest, sequence)]
}
