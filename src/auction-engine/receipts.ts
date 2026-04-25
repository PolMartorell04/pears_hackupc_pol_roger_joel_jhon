import type { AuctionState } from './types'

export type Receipt = {
  sessionId: string
  lotId: string
  winnerId?: string
  finalAmount?: number
  status: 'sold' | 'unsold'
  eventCount: number
  logHash: string
  createdAt: number
  signedBy: string
  signature?: string
}

function simpleHash(value: string): string {
  let hash = 0

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }

  return Math.abs(hash).toString(16)
}

export function generateReceipt(
  state: AuctionState,
  lotId: string
): Receipt {
  const lot = state.lots.find(l => l.id === lotId)

  if (!lot) {
    throw new Error('Lot not found')
  }

  const lotEvents = state.officialEvents.filter(event =>
    'lotId' in event.payload && event.payload.lotId === lotId
  )

  const logHash = simpleHash(JSON.stringify(lotEvents))

  return {
    sessionId: state.session.id,
    lotId,
    winnerId: lot.winnerId,
    finalAmount: lot.winnerId ? lot.currentPrice : undefined,
    status: lot.winnerId ? 'sold' : 'unsold',
    eventCount: lotEvents.length,
    logHash,
    createdAt: Date.now(),
    signedBy: state.session.hostId
  }
}