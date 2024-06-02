# create-xmtp-bot

create-xmtp-bot is a command-line interface tool designed to help developers create and manage their custom build configurations easily.

To install it run the following command:

```bash
npx create-xmtp-bot@latest bot-name
# enter the recently created folder
cd bot-name
```

**Set the variables**

```bash
KEY= # 0x... the private key of the bot (with the 0x prefix)
XMTP_ENV=production # or `dev`
```

> ⚠️ Bot kit is not compatible with `bun` yet. Use `npm` or `yarn`

```bash
# to run with hot-reload
yarn build:watch
yarn start:watch
```

## Examples

By default the `create-xmtp-bot` starter comes with a conversational bot but without using a DB. Here are other examples you can use:

- [Gm](./examples/gm): Get started with a simple gm bot.
- [Conversational](./examples/conversational): Drive retention with conversations and subscriptions with redisDb.
- [GPT](./examples/gpt): Relay messages through Open AI APIs.
- [Group](./examples/group): Group bot example.

See more examples in the [Awesome XMTP ⭐️](https://github.com/xmtp/awesome-xmtp) repo
