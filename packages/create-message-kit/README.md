# create-message-kit

create-message-kit is a command-line interface tool designed to help developers create and manage their custom build configurations easily.

To install it run the following command:

```bash
npm init message-kit
```

**Set the variables**

```bash
KEY= # 0x... the private key of the app (with the 0x prefix)
XMTP_ENV=production # or `dev`
```

> ⚠️ Bot kit is not compatible with `bun` yet. Use `npm` or `yarn`

```bash
# to run with hot-reload
yarn build:watch
yarn start:watch
```

## Examples

By default the `create-message-kit` starter comes with a subscription app but without using a DB. Here are other examples you can use:

- [Subscription](/examples/subscription): Drive retention with conversations and subscriptions with redisDb.
- [GPT](/examples/gpt): Relay messages through Open AI APIs.
- [Group](/examples/group): Group bot example.

See more examples in the [Awesome XMTP ⭐️](https://github.com/xmtp/awesome-xmtp) repo
