# BOTKIT

This is the official repository for the XMTP bot kit and examples, powered by [Turborepo](https://turbo.build/repo).

To learn more about the contents of this repository, see this README and the READMEs provided for [packages](https://github.com/xmtp-labs/botkit/tree/main/packages) and [examples](https://github.com/xmtp-labs/botkit/tree/main/examples).

## What's inside?

### Packages

- [`botkit`](/packages/botkit): A kit for quickly building bots on the XMTP network
- [`create-xmtp-bot`](/packages/create-xmtp-bot): A CLI for creating new XMTP bot projects
- [`playground`](https://github.com/fabriguespe/playground): A visual playground for creating groups
- [`docs`](/packages/docs): Documentation for botkit

### Templates

- [`subscription`](/examples/subscription): A simple, customizable, and powerful conversational framework
- [`gpt`](/examples/gpt): A bot that relays incoming messages to OpenAI's ChatGPT
- [`group`](/examples/group): Group bot example.

See more examples in the [Awesome XMTP ⭐️](https://github.com/xmtp/awesome-xmtp) repo

#### Run the example bots locally

> **Note**  
> Before starting the bots locally, install the necessary dependencies by running `yarn` first. Update yarn with `yarn set version stable`

- `yarn start:gm`: Start the GM bot
- `yarn start:conversational`: Start the conversational bot
- `yarn start:group`: Start the Group bot

## Contributing

See our [contribution guide](./CONTRIBUTING.md) to learn more about contributing to this project.
