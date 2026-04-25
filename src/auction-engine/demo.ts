console.log('DEMO START')

import type { AuctionState, BidRequest } from './types'
import type { AuctionEvent } from './events'
import { applyEvent } from './reducer'
import { handleBidRequest } from './bidFlow'
import { closeLot } from './lotActions'
import { generateReceipt } from './receipts'

let state: AuctionState = {
  session: {
    id: 'session-1',
    title: 'Demo Auction',
    hostId: 'host-1',
    status: 'live',
    createdAt: Date.now()
  },
  lots: [
    {
      id: 'lot-1',
      title: 'Teclat mecànic',
      status: 'draft',
      startingPrice: 20,
      currentPrice: 20,
      minIncrement: 5
    }
  ],
  participants: [
    {
      id: 'host-1',
      name: 'Host',
      role: 'host',
      status: 'approved',
      createdAt: Date.now()
    },
    {
      id: 'bidder-1',
      name: 'Roger',
      role: 'bidder',
      status: 'approved',
      createdAt: Date.now()
    }
  ],
  currentLotId: null,
  officialEvents: []
}

function nextSequence() {
  return state.officialEvents.length + 1
}

function dispatch(event: AuctionEvent) {
  state = applyEvent(state, event)
  console.log('EVENT:', event.type, event.payload)
}

// Start lot
dispatch({
  type: 'LOT_STARTED',
  sessionId: state.session.id,
  sequence: nextSequence(),
  createdAt: Date.now(),
  payload: {
    lotId: 'lot-1'
  }
})

// Bid
const bid: BidRequest = {
  type: 'BID_REQUEST',
  sessionId: state.session.id,
  lotId: 'lot-1',
  amount: 25,
  bidderId: 'bidder-1',
  createdAt: Date.now()
}

const bidEvent = handleBidRequest(state, bid, nextSequence())
dispatch(bidEvent)

// Close lot
const soldEvent = closeLot(state, 'lot-1', {
  sessionId: state.session.id,
  sequence: nextSequence()
})

dispatch(soldEvent)

// Receipt
const receipt = generateReceipt(state, 'lot-1')

console.log('FINAL STATE:', state)
console.log('RECEIPT:', receipt)