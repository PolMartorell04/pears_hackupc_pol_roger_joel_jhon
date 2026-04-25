import type { AuctionState } from './types'
import type { AuctionEvent } from './events'

type EventMeta = { sessionId: string; sequence: number }

function baseEvent(meta: EventMeta) {
  return { sessionId: meta.sessionId, sequence: meta.sequence, createdAt: Date.now() }
}

export function createLotClosedEvent(state: AuctionState, lotId: string, meta: EventMeta): AuctionEvent {
  const lot = state.lots.find(l => l.id === lotId)
  if (!lot) throw new Error('Lot not found')
  if (lot.status !== 'live') throw new Error('Only live lots can be closed')

  return { ...baseEvent(meta), type: 'LOT_CLOSED', payload: { lotId } }
}

export function resolveClosedLot(state: AuctionState, lotId: string, meta: EventMeta): AuctionEvent {
  const lot = state.lots.find(l => l.id === lotId)
  if (!lot) throw new Error('Lot not found')

  const base = baseEvent(meta)

  if (lot.currentBidderId) {
    return {
      ...base,
      type: 'LOT_SOLD',
      payload: { lotId, winnerId: lot.currentBidderId, amount: lot.currentPrice }
    }
  }

  return { ...base, type: 'LOT_UNSOLD', payload: { lotId } }
}

export function closeLotEvents(state: AuctionState, lotId: string, firstMeta: EventMeta): AuctionEvent[] {
  const closedEvent = createLotClosedEvent(state, lotId, firstMeta)
  const closingState = {
    ...state,
    lots: state.lots.map(lot => lot.id === lotId ? { ...lot, status: 'closing' as const } : lot)
  }

  return [
    closedEvent,
    resolveClosedLot(closingState, lotId, { ...firstMeta, sequence: firstMeta.sequence + 1 })
  ]
}

// Backwards-compatible helper for the previous demo flow.
export function closeLot(state: AuctionState, lotId: string, meta: EventMeta): AuctionEvent {
  return resolveClosedLot(state, lotId, meta)
}
