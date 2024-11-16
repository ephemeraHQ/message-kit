# Contributing

Thank you for considering contributing to this repo! Community contributions like yours are key to the development and adoption of XMTP. Your questions, feedback, suggestions, and code contributions are welcome!

## How to contribute

### ✨ Feature requests

Request a feature using [GitHub Issues](https://github.com/ephemeraHQ/message-kit/issues).

### 🐞 Bugs

Report a bug using [GitHub Issues](https://github.com/ephemeraHQ/message-kit/issues).

### Pull requests

PRs are encouraged, but consider starting with a feature request to temperature-check first.

---

## Developing

#### Node

Please make sure you have a compatible version as specified in `package.json`. We recommend using a Node version manager such as [nvm](https://github.com/nvm-sh/nvm) or [nodenv](https://github.com/nodenv/nodenv).

#### Yarn

This repository uses the [Yarn package manager](https://yarnpkg.com/). To use it, enable [Corepack](https://yarnpkg.com/corepack), if it isn't already, by running `corepack enable`.

Useful scripts:

- `yarn`: Installs all dependencies
- `yarn build`: Builds templates and `packages/message-kit`
- `yarn clean`: Remove all `node_modules`, `.turbo`, and build folders, clears Yarn cache
- `yarn format`: Run prettier format and write changes on all packages
- `yarn format:check`: Run prettier format check on all packages
- `yarn typecheck`: Typecheck all packages

---

Have a question about how to build with XMTP? Ask your question and learn with the community in the [XMTP Community Forums](https://community.xmtp.org/).
