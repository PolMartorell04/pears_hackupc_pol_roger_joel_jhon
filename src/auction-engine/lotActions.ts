import type { AuctionState } from './types'
import type { AuctionEvent } from './events'

export function closeLot(
  state: AuctionState,
  lotId: string,
  meta: { sessionId: string; sequence: number }
): AuctionEvent {
  const lot = state.lots.find(l => l.id === lotId)

  if (!lot) {
    throw new Error('Lot not found')
  }

  const base = {
    sessionId: meta.sessionId,
    sequence: meta.sequence,
    createdAt: Date.now()
  }

  if (lot.currentBidderId) {
    return {
      ...base,
      type: 'LOT_SOLD',
      payload: {
        lotId,
        winnerId: lot.currentBidderId,
        amount: lot.currentPrice
      }
    }
  }

  return {
    ...base,
    type: 'LOT_UNSOLD',
    payload: {
      lotId
    }
  }
}