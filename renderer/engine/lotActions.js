// renderer/engine/lotActions.ts
function baseEvent(meta) {
  return { sessionId: meta.sessionId, sequence: meta.sequence, createdAt: Date.now() }
}
function createLotClosedEvent(state, lotId, meta) {
  const lot = state.lots.find((l) => l.id === lotId)
  if (!lot) throw new Error('Lot not found')
  if (lot.status !== 'live') throw new Error('Only live lots can be closed')
  return { ...baseEvent(meta), type: 'LOT_CLOSED', payload: { lotId } }
}
function resolveClosedLot(state, lotId, meta) {
  const lot = state.lots.find((l) => l.id === lotId)
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
function closeLotEvents(state, lotId, firstMeta) {
  const closedEvent = createLotClosedEvent(state, lotId, firstMeta)
  const closingState = {
    ...state,
    lots: state.lots.map((lot) => (lot.id === lotId ? { ...lot, status: 'closing' } : lot))
  }
  return [
    closedEvent,
    resolveClosedLot(closingState, lotId, { ...firstMeta, sequence: firstMeta.sequence + 1 })
  ]
}
function closeLot(state, lotId, meta) {
  return resolveClosedLot(state, lotId, meta)
}
export { closeLot, closeLotEvents, createLotClosedEvent, resolveClosedLot }
