import type { AuctionState, BidRequest } from './types'

export function validateBid(
  state: AuctionState,
  bid: BidRequest
): { ok: true } | { ok: false; reason: string } {
  if (bid.sessionId !== state.session.id) {
    return { ok: false, reason: 'Invalid session' }
  }

  if (state.currentLotId !== bid.lotId) {
    return { ok: false, reason: 'Not current lot' }
  }

  const lot = state.lots.find(l => l.id === bid.lotId)

  if (!lot) {
    return { ok: false, reason: 'Lot not found' }
  }

  if (lot.status !== 'live') {
    return { ok: false, reason: 'Lot is not live' }
  }

  const participant = state.participants.find(p => p.id === bid.bidderId)

  if (!participant) {
    return { ok: false, reason: 'Participant not found' }
  }

  if (participant.status !== 'approved') {
    return { ok: false, reason: 'Participant not approved' }
  }

  if (participant.role !== 'bidder') {
    return { ok: false, reason: 'Only bidders can bid' }
  }

  const minimumValidBid = lot.currentPrice + lot.minIncrement

  if (bid.amount < minimumValidBid) {
    return {
      ok: false,
      reason: `Bid must be at least ${minimumValidBid}`
    }
  }

  return { ok: true }
}