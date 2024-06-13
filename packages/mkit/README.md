# @xmtp/mkit

Minimal viable package for creating bots.

## CLI Quickstart

For a streamlined setup process, you can use the `create-mkit` CLI tool, which simplifies the creation and configuration of new XMTP bots.

```bash
npx init mkit
```

## Overview

Here's a basic example of the code with a bot that responds with a gm:

```tsx
import { run, HandlerContext } from "@xmtp/mkit";

run(async (context: HandlerContext) => {
  // Get the message and the address from the sender
  const { content, senderAddress } = context.message;

  // To reply, just call `reply` on the HandlerContext.
  await context.reply(`gm`);
});
```

## Development

To develop on this repo clone the repository containing the bot code:

```bash
git clone https://github.com/xmtp-labs/messagekit
cd messagekit
# copy env variables template
cp .env.example .env
```

**Set the variables**

```bash
KEY= # 0x... the private key of the bot (with the 0x prefix)
XMTP_ENV=production # or `dev`
```

> ⚠️ Bot kit is not compatible with `bun` yet. Use `npm` or `yarn`

```bash
# install dependencies
yarn install

# running the bot
yarn build
yarn start

# to run with hot-reload
yarn build:watch
yarn start:watch

# run the gm example
yarn build:watch
yarn start:gm
```
