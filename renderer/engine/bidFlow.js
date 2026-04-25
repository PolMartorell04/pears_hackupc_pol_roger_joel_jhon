// renderer/engine/validation.ts
function validateBid(state, bid) {
  if (bid.sessionId !== state.session.id) return { ok: false, reason: "Invalid session" };
  if (state.session.status !== "live") return { ok: false, reason: "Session is not live" };
  if (state.currentLotId !== bid.lotId) return { ok: false, reason: "Not current lot" };
  const lot = state.lots.find((l) => l.id === bid.lotId);
  if (!lot) return { ok: false, reason: "Lot not found" };
  if (lot.status !== "live") return { ok: false, reason: "Lot is not live" };
  if (lot.minIncrement <= 0) return { ok: false, reason: "Invalid minimum increment" };
  const participant = state.participants.find((p) => p.id === bid.bidderId);
  if (!participant) return { ok: false, reason: "Participant not found" };
  if (participant.status !== "approved") return { ok: false, reason: "Participant not approved" };
  if (participant.role !== "bidder") return { ok: false, reason: "Only bidders can bid" };
  if (bid.amount <= lot.currentPrice) return { ok: false, reason: `Bid must be greater than ${lot.currentPrice}` };
  const minimumValidBid = lot.currentPrice + lot.minIncrement;
  if (bid.amount < minimumValidBid) return { ok: false, reason: `Bid must be at least ${minimumValidBid}` };
  return { ok: true };
}

// renderer/engine/bidFlow.ts
function bidBase(bid, sequence) {
  return { sessionId: bid.sessionId, sequence, createdAt: Date.now() };
}
function createBidRequestedEvent(bid, sequence) {
  return {
    ...bidBase(bid, sequence),
    type: "BID_REQUESTED",
    payload: {
      lotId: bid.lotId,
      bidderId: bid.bidderId,
      amount: bid.amount
    }
  };
}
function resolveBidRequest(state, bid, sequence) {
  const validation = validateBid(state, bid);
  const base = bidBase(bid, sequence);
  if (!validation.ok) {
    return {
      ...base,
      type: "BID_REJECTED",
      payload: { lotId: bid.lotId, bidderId: bid.bidderId, amount: bid.amount, reason: validation.reason }
    };
  }
  return {
    ...base,
    type: "BID_ACCEPTED",
    payload: { lotId: bid.lotId, bidderId: bid.bidderId, amount: bid.amount }
  };
}
function handleBidRequestEvents(state, bid, firstSequence) {
  return [
    createBidRequestedEvent(bid, firstSequence),
    resolveBidRequest(state, bid, firstSequence + 1)
  ];
}
function handleBidRequest(state, bid, sequence) {
  return resolveBidRequest(state, bid, sequence);
}
export {
  createBidRequestedEvent,
  handleBidRequest,
  handleBidRequestEvents,
  resolveBidRequest
};
