# XMTP

> See [XMTP AI](https://message-kit.org/plugins/xmtp) plugin

### Installation

Install the `xmtp-web` package for using in the users devices.

```bash [cmd]
bun install xmtp-web
```

### Usage

This is how you can use the `xmtp-web` package to create a client and handle messages.

> It will always create an anonimous identity by default.

```tsx
import { XMTP } from "xmtp-web";

const xmtp = await XMTP(onMessage);

const onMessage = async (message, user) => {
  console.log(`Decoded message: ${message.content.text} by ${user.address}`);
  // Your AI model response
  await xmtp.sendMessage(response);
};
```
