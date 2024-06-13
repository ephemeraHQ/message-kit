# Gm

Simple Gm app

## Usage

```jsx
import "dotenv/config";
import { xmtpClient, run, HandlerContext } from "@xmtp/message-kit";

run(async (context: HandlerContext) => {
  const { content, senderAddress } = context.message;

  await context.reply(`gm`);
});
```

## Running the app

> ⚠️ Bot kit is not compatible with `bun`. Use `npm` or `yarn`

```bash
# install dependencies
yarn install

# running the app
yarn build
yarn start

# to run with hot-reload
yarn build:watch
yarn start:watch
```

## Variables

```bash
KEY= # 0x... the private key of the app (with the 0x prefix)
XMTP_ENV=production # or `dev`
```
