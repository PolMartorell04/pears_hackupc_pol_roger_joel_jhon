// renderer/engine/receipts.ts
function simpleHash(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}
function generateReceipt(state, lotId) {
  const lot = state.lots.find((l) => l.id === lotId);
  if (!lot) {
    throw new Error("Lot not found");
  }
  if (lot.status !== "sold" && lot.status !== "unsold") {
    throw new Error("Receipt can only be generated for sold or unsold lots");
  }
  const lotEvents = state.officialEvents.filter(
    (event) => "lotId" in event.payload && event.payload.lotId === lotId
  );
  const logHash = simpleHash(JSON.stringify(lotEvents));
  return {
    sessionId: state.session.id,
    lotId,
    winnerId: lot.winnerId,
    finalAmount: lot.status === "sold" ? lot.currentPrice : void 0,
    status: lot.status,
    eventCount: lotEvents.length,
    logHash,
    createdAt: Date.now(),
    signedBy: state.session.hostId
  };
}
export {
  generateReceipt
};
