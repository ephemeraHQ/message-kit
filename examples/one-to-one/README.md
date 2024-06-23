# Subscription Example

> To learn more about MessageKit go to the [docs](https://message-kit.vercel.app)

## Running locally

Follow the steps below to run the app

### Set up

```bash [cmd]
# Clone the repo
git clone https://github.com/xmtp-labs/message-kit
# Go to the example folder
cd examples/one-to-one
# Install the dependencies
yarn install
# Run the app
yarn build:watch
yarn start:watch
```

### Variables

Set up these variables in your app to connect to redis and xmtp

```bash [cmd]
KEY= # 0x... the private key of the app (with the 0x prefix)
XMTP_ENV=production # or dev
REDIS_CONNECTION_STRING= # redis db connection string
```
