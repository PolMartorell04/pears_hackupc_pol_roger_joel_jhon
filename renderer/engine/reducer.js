// renderer/engine/reducer.ts

const OFFICIAL_EVENT_TYPES = new Set([
  "SESSION_CREATED",
  "PARTICIPANT_APPROVED",
  "LOT_STARTED",
  "BID_ACCEPTED",
  "BID_REJECTED",
  "LOT_CLOSED",
  "LOT_SOLD",
  "LOT_UNSOLD",
  "SESSION_CLOSED",
  "RECEIPT_ISSUED"
])

function applyEvent(state, event) {
  const nextState = (() => {
    switch (event.type) {
      case "SESSION_CREATED":
        return {
          ...state,
          session: event.payload.session
        }

      case "PARTICIPANT_APPROVED": {
        const approvedParticipant = event.payload.participant
          ? { ...event.payload.participant, status: "approved" }
          : null

        const participantId = event.payload.participantId || approvedParticipant?.id
        const exists = state.participants.some((participant) => participant.id === participantId)

        return {
          ...state,
          participants: exists
            ? state.participants.map((participant) =>
                participant.id === participantId
                  ? { ...participant, ...approvedParticipant, status: "approved" }
                  : participant
              )
            : [...state.participants, approvedParticipant]
        }
      }

      case "LOT_STARTED":
        return {
          ...state,
          currentLotId: event.payload.lotId,
          lots: state.lots.map(
            (lot) =>
              lot.id === event.payload.lotId
                ? { ...lot, status: "live" }
                : lot
          )
        }

      case "BID_ACCEPTED":
        return {
          ...state,
          lots: state.lots.map((lot) =>
            lot.id === event.payload.lotId
              ? {
                  ...lot,
                  currentPrice: event.payload.amount,
                  currentBidderId: event.payload.bidderId
                }
              : lot
          )
        }

      case "BID_REJECTED":
        return state

      case "LOT_CLOSED":
        return {
          ...state,
          lots: state.lots.map((lot) =>
            lot.id === event.payload.lotId
              ? { ...lot, status: "closing" }
              : lot
          )
        }

      case "LOT_SOLD":
        return {
          ...state,
          currentLotId: null,
          lots: state.lots.map((lot) =>
            lot.id === event.payload.lotId
              ? {
                  ...lot,
                  status: "sold",
                  winnerId: event.payload.winnerId,
                  currentPrice: event.payload.amount
                }
              : lot
          )
        }

      case "LOT_UNSOLD":
        return {
          ...state,
          currentLotId: null,
          lots: state.lots.map((lot) =>
            lot.id === event.payload.lotId
              ? { ...lot, status: "unsold" }
              : lot
          )
        }

      case "SESSION_CLOSED":
        return {
          ...state,
          currentLotId: null,
          session: {
            ...state.session,
            status: "closed"
          }
        }

      case "RECEIPT_ISSUED":
        return {
          ...state,
          receipts: [...(state.receipts || []), event.payload]
        }

      default:
        return state
    }
  })()

  // 👇 SOLO eventos oficiales se guardan
  const officialEvents = OFFICIAL_EVENT_TYPES.has(event.type)
    ? [...nextState.officialEvents, event]
    : nextState.officialEvents

  return {
    ...nextState,
    officialEvents
  }
}

export { applyEvent }