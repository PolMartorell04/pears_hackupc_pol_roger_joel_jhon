import type { AuctionEvent } from './events'

export type LotStatus =
  | 'draft'
  | 'live'
  | 'closing'
  | 'sold'
  | 'unsold'

export type ParticipantRole =
  | 'host'
  | 'bidder'
  | 'spectator'

export type ParticipantStatus =
  | 'pending'
  | 'approved'
  | 'rejected'

export type Session = {
  id: string
  title: string
  hostId: string
  status: 'draft' | 'live' | 'closed'
  createdAt: number
}

export type Lot = {
  id: string
  title: string
  description?: string
  status: LotStatus
  startingPrice: number
  currentPrice: number
  minIncrement: number
  currentBidderId?: string
  winnerId?: string
}

export type Participant = {
  id: string
  name: string
  role: ParticipantRole
  status: ParticipantStatus
  createdAt: number
}

export type BidRequest = {
  type: 'BID_REQUEST'
  sessionId: string
  lotId: string
  amount: number
  bidderId: string
  createdAt: number
  signature?: string
}

export type AuctionState = {
  session: Session
  lots: Lot[]
  participants: Participant[]
  currentLotId: string | null
  officialEvents: AuctionEvent[]
}