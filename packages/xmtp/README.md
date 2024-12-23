# XMTP

> See [XMTP AI](https://message-kit.org/plugins/xmtp) plugin

### Installation

Install the `xmtp` package

```bash [cmd]
bun install xmtp
```

### Usage

This is how you can use the `xmtp` package to create a client and handle messages.

```tsx
import { XMTP } from "xmtp";

const xmtp = new XMTP(onMessage, {
  encryptionKey: process.env.WALLET_PRIVATE_KEY,
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
