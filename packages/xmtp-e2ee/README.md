# XMTP

> See [xmtp e2ee](https://message-kit.org/plugins/xmtp) plugin

### Installation

Install the `xmtp-e2ee` package for using in the users devices.

```bash [cmd]
bun install xmtp-e2ee
```

### Usage

This is how you can use the `xmtp-e2ee` package to create a client and handle messages.

> It will always create an anonimous identity by default.

```tsx
import { XMTP } from "xmtp-e2ee";

const xmtp = new XMTP(onMessage);

await xmtp.init();

const onMessage = async (message, user) => {
  console.log(`Decoded message: ${message.content.text} by ${user.address}`);
  // Your AI model response
  await xmtp.send({ message: response, originalMessage: message });
};
```
