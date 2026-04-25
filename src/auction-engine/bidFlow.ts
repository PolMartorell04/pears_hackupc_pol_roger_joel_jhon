import type { AuctionState, BidRequest } from './types'
import type { AuctionEvent } from './events'
import { validateBid } from './validation'

function bidBase(bid: BidRequest, sequence: number) {
  return { sessionId: bid.sessionId, sequence, createdAt: Date.now() }
}

export function createBidRequestedEvent(bid: BidRequest, sequence: number): AuctionEvent {
  return {
    ...bidBase(bid, sequence),
    type: 'BID_REQUESTED',
    payload: { ...bid, type: 'BID_REQUESTED' }
  }
}

export function resolveBidRequest(state: AuctionState, bid: BidRequest, sequence: number): AuctionEvent {
  const validation = validateBid(state, bid)
  const base = bidBase(bid, sequence)

  if (!validation.ok) {
    return {
      ...base,
      type: 'BID_REJECTED',
      payload: { lotId: bid.lotId, bidderId: bid.bidderId, amount: bid.amount, reason: validation.reason }
    }
  }

  return {
    ...base,
    type: 'BID_ACCEPTED',
    payload: { lotId: bid.lotId, bidderId: bid.bidderId, amount: bid.amount }
  }
}

export function handleBidRequestEvents(state: AuctionState, bid: BidRequest, firstSequence: number): AuctionEvent[] {
  return [
    createBidRequestedEvent(bid, firstSequence),
    resolveBidRequest(state, bid, firstSequence + 1)
  ]
}

// Backwards-compatible helper for the previous demo flow.
export function handleBidRequest(state: AuctionState, bid: BidRequest, sequence: number): AuctionEvent {
  return resolveBidRequest(state, bid, sequence)
}
