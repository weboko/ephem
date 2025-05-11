## Abstract
Privacy-conscious users often sacrifice simplicity to achieve strong security and privacy guarantees.
This application delivers seamless end-to-end encryption and robust privacy via Waku protocols (LightPush, Filter, Relay) for 1-1 chat.
All messages are stored only on the device and exist ephemerally,
ensuring that temporary communications are discarded when the app is closed.

## Identity
Application provides different identities depending on the context of usage.

### Root Identity
Root Identity serves as their persistent cryptographic identity for all messaging sessions.
We recommend implementing this identity using passkeys (per the [WebAuthn Level 3 specification](https://passkeys.dev/docs/reference/specs/)), as they offer:
- Strong security guarantees via device-bound key pairs stored in secure or trusted execution environments;
- Seamless user experience with passwordless authentication;

To discard a Root Identity, the user simply deletes the associated passkey from their device or browser authenticator,
irrevocably removing their ability to create new communication sessions.

### Contact Identity
A Contact Identity is a session-specific cryptographic identity derived from the user’s Root Identity and a unique key exchanged during Contact Exchange.

This identity enables:
- Maintains an online-state TTL to limit how long presence information is valid;
- Authenticates participants;
- Establishes session keys for end-to-end encryption;

Properties of Contact Identity:
- Ephemeral: Regenerated on each app launch to minimize memory footprint;
- Discarded: Removed when the chat is closed;
- Single-Device: No support for multi-device identity; each user operates from one active device;

## Contact Exchange
This application does not support automatic contact discovery.
To connect, users must perform a Contact Exchange,
where one user generates an invite (QR code or special link) and shares it out-of-band.

### Invite Creation
When generating an invite, the system creates:
1. A unique invite ID (nonce);
2. An invite-specific public key, derived from the user’s Root Identity and the invite ID;

The invite is encoded as a QR code or URL containing both values.

### Contact Exchange Flow
1. Send Invite
- User A shares the QR code or link with User B via any external channel (e.g., email, messaging).
2. Accept Invite
- User B opens the invite in the app, which retrieves the invite ID and public key.
- User B encrypts their contact information (newly created public key based on their Root Identity) with the invite public key.
- User B broadcasts the encrypted payload over Waku.
3. Complete Exchange
- User A listens for Waku messages tagged with the invite ID.
- Upon receiving User B’s encrypted info, User A decrypts it using the corresponding private key.
- Both users now have each other’s Contact Identity public keys.

### Post-Exchange Capabilities
With each other’s identities, users can:
- Subscribe to presence updates (online/offline, last-seen TTL)
- Initiate new chat sessions

### Cleanup & Privacy
- To revoke a contact, simply delete their stored identity.
- After deletion, no further messaging or metadata exchange is possible, preventing any additional leakage.

## Chat

### Initiating a Chat
Both participants must be online and have completed the Contact Exchange.
To advertise availability, each client periodically publishes an encrypted “online” presence message over Waku. Encryption of it should be with the public key of each successfully exchanged contact.
When a user wants to start a chat, they send an encrypted “start chat” payload to the peer, using that contact’s Chat Identity.

### Message Exchange
Once the first message is accepted, all subsequent messages use the Double Ratchet algorithm for forward secrecy and post-compromise security.
Each outgoing message is encrypted with the current ratchet state and delivered via Waku; incoming messages advance the ratchet and update local state.

### Termination & Cleanup
On termination or app closure, the client securely wipes all ephemeral chat data—messages, session keys, and ratchet state.
Upon relaunch, if the peer is still online, the client publishes a “chat-deleted” system message so both sides know the previous session cannot be resumed.