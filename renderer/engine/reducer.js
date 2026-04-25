// renderer/engine/reducer.ts
function applyEvent(state, event) {
  const nextState = (() => {
    switch (event.type) {
      case "SESSION_CREATED":
        return {
          ...state,
          session: event.payload.session
        };
      case "PARTICIPANT_JOIN_REQUESTED":
        return {
          ...state,
          participants: [...state.participants, event.payload.participant]
        };
      case "PARTICIPANT_APPROVED":
        return {
          ...state,
          participants: state.participants.map(
            (participant) => participant.id === event.payload.participantId ? { ...participant, status: "approved" } : participant
          )
        };
      case "LOT_STARTED":
        return {
          ...state,
          currentLotId: event.payload.lotId,
          lots: state.lots.map(
            (lot) => lot.id === event.payload.lotId ? { ...lot, status: "live" } : lot
          )
        };
      case "BID_REQUESTED":
        return state;
      case "BID_ACCEPTED":
        return {
          ...state,
          lots: state.lots.map(
            (lot) => lot.id === event.payload.lotId ? {
              ...lot,
              currentPrice: event.payload.amount,
              currentBidderId: event.payload.bidderId
            } : lot
          )
        };
      case "BID_REJECTED":
        return state;
      case "LOT_CLOSED":
        return {
          ...state,
          lots: state.lots.map(
            (lot) => lot.id === event.payload.lotId ? { ...lot, status: "closing" } : lot
          )
        };
      case "LOT_SOLD":
        return {
          ...state,
          currentLotId: null,
          lots: state.lots.map(
            (lot) => lot.id === event.payload.lotId ? {
              ...lot,
              status: "sold",
              winnerId: event.payload.winnerId,
              currentPrice: event.payload.amount
            } : lot
          )
        };
      case "LOT_UNSOLD":
        return {
          ...state,
          currentLotId: null,
          lots: state.lots.map(
            (lot) => lot.id === event.payload.lotId ? { ...lot, status: "unsold" } : lot
          )
        };
      case "SESSION_CLOSED":
        return {
          ...state,
          currentLotId: null,
          session: {
            ...state.session,
            status: "closed"
          }
        };
      default:
        return state;
    }
  })();
  return {
    ...nextState,
    officialEvents: [...nextState.officialEvents, event]
  };
}
export {
  applyEvent
};
