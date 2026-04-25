import type { AuctionState } from './types'
import type { AuctionEvent } from './events'

export function applyEvent(
  state: AuctionState,
  event: AuctionEvent
): AuctionState {
  const nextState: AuctionState = (() => {
    switch (event.type) {
      case 'SESSION_CREATED':
        return {
          ...state,
          session: event.payload.session
        }

      case 'PARTICIPANT_JOIN_REQUESTED':
        return {
          ...state,
          participants: [...state.participants, event.payload.participant]
        }

      case 'PARTICIPANT_APPROVED':
        return {
          ...state,
          participants: state.participants.map(participant =>
            participant.id === event.payload.participantId
              ? { ...participant, status: 'approved' as const }
              : participant
          )
        }

      case 'LOT_STARTED':
        return {
          ...state,
          currentLotId: event.payload.lotId,
          lots: state.lots.map(lot =>
            lot.id === event.payload.lotId
              ? { ...lot, status: 'live' as const }
              : lot
          )
        }

      case 'BID_REQUESTED':
        return state

      case 'BID_ACCEPTED':
        return {
          ...state,
          lots: state.lots.map(lot =>
            lot.id === event.payload.lotId
              ? {
                  ...lot,
                  currentPrice: event.payload.amount,
                  currentBidderId: event.payload.bidderId
                }
              : lot
          )
        }

      case 'BID_REJECTED':
        return state

      case 'LOT_CLOSED':
        return {
          ...state,
          lots: state.lots.map(lot =>
            lot.id === event.payload.lotId
              ? { ...lot, status: 'closing' as const }
              : lot
          )
        }

      case 'LOT_SOLD':
        return {
          ...state,
          currentLotId: null,
          lots: state.lots.map(lot =>
            lot.id === event.payload.lotId
              ? {
                  ...lot,
                  status: 'sold' as const,
                  winnerId: event.payload.winnerId,
                  currentPrice: event.payload.amount
                }
              : lot
          )
        }

      case 'LOT_UNSOLD':
        return {
          ...state,
          currentLotId: null,
          lots: state.lots.map(lot =>
            lot.id === event.payload.lotId
              ? { ...lot, status: 'unsold' as const }
              : lot
          )
        }

      case 'SESSION_CLOSED':
        return {
          ...state,
          currentLotId: null,
          session: {
            ...state.session,
            status: 'closed'
          }
        }

      default:
        return state
    }
  })()

  return {
    ...nextState,
    officialEvents: [...nextState.officialEvents, event]
  }
}