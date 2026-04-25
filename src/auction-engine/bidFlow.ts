import type { AuctionState, BidRequest } from './types'
import type { AuctionEvent } from './events'
import { validateBid } from './validation'

export function handleBidRequest(
  state: AuctionState,
  bid: BidRequest,
  sequence: number
): AuctionEvent {
  const base = {
    sessionId: bid.sessionId,
    sequence,
    createdAt: Date.now()
  }

  const validation = validateBid(state, bid)

  if (!validation.ok) {
    return {
      ...base,
      type: 'BID_REJECTED',
      payload: {
        lotId: bid.lotId,
        bidderId: bid.bidderId,
        amount: bid.amount,
        reason: validation.reason
      }
    }
  }

  return {
    ...base,
    type: 'BID_ACCEPTED',
    payload: {
      lotId: bid.lotId,
      bidderId: bid.bidderId,
      amount: bid.amount
    }
  }
}