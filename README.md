*Team Structure*

The project was divided into three main areas:

Students 1 & 4 → UI and navigation (HTML, CSS and JS).
Student 2 → Core logic (events, rules, reducers and validation).
Student 3 → P2P networking (Hyperswarm, Autopass and channels).

*Overview*

Our app is a fully peer-to-peer real-time auction platform built with:

Electron + Pear
Hyperswarm & Hypercore
Autopass

No backend and no servers, everything with peer to peer.

*Dynamics*

1. A host creates an auction session
2. A join code / QR is generated
3. Bidders connect using that code
4. A join request is given and approval flow is executed
5. All participants receive real-time updates
6. Only the host can validate bids and publish official events
7. State is synchronized across peers via P2P replication

*User Flow*

The host creates a session
The bidder joins using join code
The bidder sends a JOIN_REQUEST
The host approves and the participant is approved (PARTICIPANT_APPROVED)
The bidder sends a bid request (BID_REQUEST)
The host validates and emits a BID_ACCEPTED or BID_REJECTED
All clients update state via replicated events

*Architecture*

The system uses a dual P2P model:

1. Official State (source of truth): stored in a Hypercore log, replicated via Hyperswarm where only the host writes.

2. User Inputs (requests): handled through two channels:

	a. Autopass (persistent input channel, used for JOIN and BID requests)
	b. Direct swarm sockets (real-time responsiveness)

*Authority model*

The host is authoritative
Clients never modify state directly
All changes must go through a request, followed by a validation and ending in an official event. This prevents conflicts

*Key features*

Real-time bidding and no backend required
Deterministic state via event sourcing

*Future Work*

We explored extending this architecture into a real-time meeting platform

The same P2P structure could support a participant join/approval, real-time events
and shared state synchronization.

*Summary documentation*

We use Hyperswarm for decentralized peer discovery via shared topics embedded in a joinCode.
Write authorization follows a host-authoritative model where only the host writes to the shared log, while clients send requests through Autopass and sockets.
This is reflected in the UX as a request-validation-confirmation flow.
