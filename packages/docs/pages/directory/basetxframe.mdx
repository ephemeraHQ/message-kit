# Base Tx Frame

This is a frame following the [frames.js OpenFrames](https://framesjs.org/middleware/openframes) standard, working on Base mainnet.

1. **Send Transaction:**
   - **Purpose**: To send a specified amount of a cryptocurrency to a destination address.
   - **Parameters**:
     - `transaction_type=send` indicates the action of sending currency.
     - `amount=1` specifies the amount of BTC to be sent.
     - `token=USDC` indicates that Bitcoin is the currency being sent.
     - `receiver=` specifies the recipient's address. It’s hardcoded in the code
2. **Swap Transaction:**
   - **Purpose**: To exchange one type of cryptocurrency for another.
   - **Parameters**:
     - `transaction_type=swap` indicates a swap action.
     - `amount=1` specifies the amount of ETH to be exchanged.
     - `token_from=USDC` indicates that Ethereum is the currency being swapped.
     - `token_to=DAI` specifies DAI as the currency to receive in the swap.
3. **Mint Transaction:**
   - **Purpose**: To create (mint) a new token or NFT.
   - **Parameters**:
     - `transaction_type=mint` indicates the minting of a new NFT.
     - `collection=` specifies the NFT collection.
     - `token_id=` specifies the unique identifier of the NFT within the collection.

## Testing

Here are the three testing URLs based on your requirements:

1. **Send 1 USDC to `0x73a333cb82862d4f66f0154229755b184fb4f5b0`:**

   ```
   https://base-tx-frame.vercel.app/transaction/?transaction_type=send&buttonName=Send&amount=1&token=USDC&receiver=0x73a333cb82862d4f66f0154229755b184fb4f5b0
   ```

   ```
   http://localhost:3000/transaction/?transaction_type=send&buttonName=Send&amount=1&token=USDC&receiver=0x73a333cb82862d4f66f0154229755b184fb4f5b0
   ```

2. **Swap 1 USDC to DAI:**

   ```
   https://base-tx-frame.vercel.app/transaction/?transaction_type=swap&buttonName=Swap&amount=1&token_from=USDC&token_to=DAI
   ```

   ```
   http://localhost:3000/transaction/?transaction_type=swap&buttonName=Swap&amount=1&token_from=USDC&token_to=DAI
   ```

3. **Mint the collection (with example of tokenId and collection):**

   ```
   https://base-tx-frame.vercel.app/transaction/?transaction_type=mint&buttonName=Mint&collection=0x73a333cb82862d4f66f0154229755b184fb4f5b0&token_id=1
   ```

   ```
   http://localhost:3000/transaction/?transaction_type=mint&buttonName=Mint&collection=0x73a333cb82862d4f66f0154229755b184fb4f5b0&token_id=1
   ```

## Development

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Click on Debug to open the frames.js debugger, sign in with farcaster or with wallet to try openframes.

You can start editing the frame by modifying `app/transaction/route.tsx`.

The files in the `/app/api` folder `/app/api/mint/route.ts`, `app/api/send/route.ts`, `app/api/swap/complete/route.ts` e `app/api/swap/approval/route.ts` handle the logic for the completion of the mint, send, swap and swap approval transactions.

After a transaction is made, the user is redirected to the frame `app/transaction/transaction-result/route.tsx`, which shows the status (if the transactionReceipt is available).

Under the hood, this project uses the following libraries:

- [Enso Finance](https://enso.finance) for the swap transaction
- [Zora ZDK](https://docs.zora.co/docs/zora-api/zdk) to retrieve the NFT metadata for the mint transaction
- [Viem](https://viem.sh) for everything else
