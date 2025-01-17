# XMTP agent wrapper sdk for Node js

This package provides the XMTP agent wrapper around [SDK for Node](https://github.com/xmtp/xmtp-js/tree/main/sdks/node-sdk).

To keep up with the latest SDK developments, see the [Issues tab](https://github.com/xmtp/xmtp-js/issues) in this repo.

To learn more about XMTP and get answers to frequently asked questions, see the [XMTP documentation](https://xmtp.org/docs).

> [!CAUTION]
> This SDK is currently in alpha. The API is subject to change and it is not yet recommended for production use.

## Requirements

- Node.js 20+
- `glibc` 3.28+ (i.e. Ubuntu 24.04 or later)

## Install

**NPM**

```bash
npm install xmtp
```

**PNPM**

```bash
pnpm install xmtp
```

**Yarn**

```bash
yarn add xmtp
```

## Usage

This is how you can use the `xmtp` package to create a client and handle messages.

```tsx
import { XMTP } from "@xmtp/agent-starter";

const xmtp = new XMTP(onMessage, {
  encryptionKey: process.env.ENCRYPTION_KERY,
});

await xmtp.init();

const onMessage = async (message, user) => {
  console.log(`Decoded message: ${message.content.text} by ${user.address}`);
  // Your AI model response
  await xmtp.send({
    message: response,
    originalMessage: message,
  });
};
```

## Identity

Each message comes with a sender object that contains the address, name, and avatar of the sender.

- `inboxId`: A unique identifier for the user's message inbox. This remains consistent across different installations.
- `address`: The primary blockchain address associated with the sender. This is typically an Ethereum address.
- `accountAddresses`: An array of all blockchain addresses linked to this identity. Users can have multiple addresses associated with their XMTP identity.
- `installationIds`: Array of unique identifiers for each installation/device where the user has XMTP enabled.

### Address availability

Returns `true` if an address has XMTP enabled

```typescript
const isOnXMTP = await xmtp.canMessage(address);
```

## Groups

To learn more about groups, read the [XMTP documentation](https://docs.xmtp.org/inboxes/group-permissions).

:::info
You need to **add the agent to the group as a member**.
:::

To create a group from your agent, you can use the following code:

```tsx
const group = await xmtp?.conversations.newGroup([address1, address2]);
```

As an admin you can add members to the group.

```tsx
// get the group
await group.sync();
//By address
await group.addMembers([userAddresses]);
//By inboxId
await group.addMembersByInboxId([addedInboxes]);
```

## Receive messages

```tsx
const onMessage = async (message, user) => {
  console.log(`Decoded message: ${message.content.text} by ${user.address}`);

  if (typeId === "text") {
    // Do something with the text
  } else if (typeId === "reaction") {
    // Do something with the reaction
  } else if (typeId === "reply") {
    // Do something with the `reply`
  } else if (typeId === "attachment") {
    // Do something with the attachment data url
  } else if (typeId === "agent_message") {
    // Do something with the agent message
  } else if (typeId === "group_updated") {
    // Do something with the group updated metadata
  }
};
```

## Send messages

App messages are messages that are sent when you send a reply to a message and are highlighted differently by the apps.

```tsx [Text]
let textMessage: userMessage = {
  message: "Your message.",
  receivers: [message.sender.address],
  originalMessage: message,
};
await xmtp.send(textMessage);
```

## XMTP network environments

XMTP provides `production`, `dev`, and `local` network environments to support the development phases of your project. To learn more about these environments, see our [official documentation](https://xmtp.org/docs/build/authentication#environments).

## Developing

Run `yarn dev` to build the SDK and watch for changes, which will trigger a rebuild.

### Useful commands

- `yarn build`: Builds the SDK
- `yarn clean`: Removes `node_modules`, `dist`, and `.turbo` folders
- `yarn test`: Runs all tests
- `yarn typecheck`: Runs `tsc`
