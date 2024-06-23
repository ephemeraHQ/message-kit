# Gm Example

To learn more about MessageKit go to the [docs][https://message-kit.vercel.app]

## Running locally

Follow the steps below to run the app

### Setup

```bash [cmd]
# Clone the repo
git clone https://github.com/xmtp-labs/message-kit
# Go to the example folder
cd examples/gm
# Install the dependencies
yarn install
# Run the app
yarn build:watch
yarn start:watch
```

### Variables

Set up this variables in your app to connect to redis and xmtp

```bash [cmd]
KEY= # 0x... the private key of the app (with the 0x prefix)
XMTP_ENV=production # or `dev`
```
