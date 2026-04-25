import type { Session, Participant } from './types'

type BaseEvent = {
  sessionId: string
  sequence: number
  createdAt: number
}

export type AuctionEvent =
  | (BaseEvent & { type: 'SESSION_CREATED'; payload: { session: Session } })
  | (BaseEvent & { type: 'PARTICIPANT_JOIN_REQUESTED'; payload: { participant: Participant } })
  | (BaseEvent & { type: 'PARTICIPANT_APPROVED'; payload: { participantId: string } })
  | (BaseEvent & { type: 'LOT_STARTED'; payload: { lotId: string } })
  | (BaseEvent & { type: 'BID_ACCEPTED'; payload: { lotId: string; bidderId: string; amount: number } })
  | (BaseEvent & { type: 'BID_REJECTED'; payload: { lotId: string; bidderId: string; amount: number; reason: string } })
  | (BaseEvent & { type: 'LOT_CLOSED'; payload: { lotId: string } })
  | (BaseEvent & { type: 'LOT_SOLD'; payload: { lotId: string; winnerId: string; amount: number } })
  | (BaseEvent & { type: 'LOT_UNSOLD'; payload: { lotId: string } })
  | (BaseEvent & { type: 'SESSION_CLOSED'; payload: Record<string, never> })