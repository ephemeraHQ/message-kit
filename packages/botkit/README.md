# @xmtp/botkit

Minimal viable package for creating bots.

## CLI Quickstart

For a streamlined setup process, you can use the `create-xmtp-bot` CLI tool, which simplifies the creation and configuration of new XMTP bots.

```bash
npx init xmtp-bot
```

## Overview

Here's a basic example of the code with a bot that responds with a gm:

```tsx
import { run, HandlerContext } from "@xmtp/botkit";

run(async (context: HandlerContext) => {
  // Get the message and the address from the sender
  const { content, senderAddress } = context.message;

  // To reply, just call `reply` on the HandlerContext.
  await context.reply(`gm`);
});
```

## Examples

- [Subscription](/examples/subscription): Drive retention with conversations and subscriptions with redisDb.
- [Group](/examples/group): Group bot example.

See more examples in the [Awesome XMTP ⭐️](https://github.com/xmtp/awesome-xmtp) repo

## Deployment

Here’s how to easily deploy this bot:

- Sign up at [Railway](https://railway.app/).
- Click 'New Project' and select 'Node.js'.
- Create a Redis DB or other (Optional)
- Connect your GitHub repository
- Set your environment variables
- Deploy your application.
- Register an [ENS domain](https://ens.domains/) and share your bot!

_Head to the [tutorial on how to deploy an XMTP bot](https://junk-range-possible-git-farhack-xmtp-labs.vercel.app/docs/tutorials/bots) on Railway_

## Development

To develop on this repo clone the repository containing the bot code:

```bash
git clone https://github.com/xmtp-labs/botkit
cd botkit
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

## Messaging apps 💬

Test the bots in messaging apps

- [Converse](https://getconverse.app/): Own your conversations. Works with Frames (Transactions TBA) (prod)
- [Coinbase Wallet](https://www.coinbase.com/wallet): Your key to the world of crypto. (Frame support TBA) (prod)
- [dev-inbox](https://github.com/xmtp/dev-inbox/): Dev focused messaging client that renders Frames (Transactions TBA) (prod & dev)

## Identities

![](https://github.com/xmtp/awesome-xmtp/assets/1447073/9bb4f8c2-321e-4b6d-b52e-2105d69c4d47)

Learn about the nearly 2 million identities part of XMTP by visiting this [Dune dashboard](https://dune.com/xmtp_team/dash).
