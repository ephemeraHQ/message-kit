import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { getRedisClient } from "../plugins/redis.js";

if (
  !process.env.CIRCLE_API_KEY ||
  !process.env.CIRCLE_ENTITY_SECRET ||
  !process.env.CIRCLE_WALLET_SET_ID
) {
  throw new Error("Missing Circle API credentials");
}

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET,
});

interface WalletData {
  id: string;
  address: string;
  blockchain: string;
  state: string;
}

interface TransactionStatus {
  id: string;
  state: string;
  txHash?: string;
  createDate?: string;
  updateDate?: string;
}

interface TokenBalance {
  token: {
    id: string;
    blockchain: string;
    name: string;
    symbol: string;
    decimals: number;
    isNative: boolean;
    tokenAddress?: string;
  };
  amount: string;
  updateDate: string;
}

interface TokenBalanceResponse {
  data: {
    tokenBalances: TokenBalance[];
  };
}

export class WalletService {
  static async getUserWallet(userAddress: string): Promise<WalletData> {
    const redis = await getRedisClient();

    // Check if user has a wallet by looking for any keys with their address prefix
    const userWallets = await redis.keys(`${userAddress}:*`);
    if (userWallets.length > 0) {
      const walletAddress = await redis.get(userWallets[0]);
      const [, walletId] = userWallets[0].split(":");
      return {
        id: walletId,
        address: walletAddress || "",
        blockchain: "ETH-SEPOLIA",
        state: "ACTIVE",
      };
    }

    // Create new wallet silently for the user
    console.log(`Creating new wallet for user ${userAddress}...`);
    const response = await client.createWallets({
      accountType: "SCA",
      blockchains: ["ETH-SEPOLIA"],
      count: 1,
      walletSetId: process.env.CIRCLE_WALLET_SET_ID as string,
      metadata: [
        {
          name: "user",
          refId: userAddress,
        },
      ],
    });

    if (!response.data?.wallets?.[0]) {
      throw new Error("Failed to create wallet");
    }

    const wallet = response.data.wallets[0];

    // Store in Redis using format: senderAddress:walletId -> walletAddress
    const key = `${userAddress}:${wallet.id}`;
    await redis.set(key, wallet.address);
    console.log(`Created wallet for user ${userAddress}`);

    return {
      id: wallet.id,
      address: wallet.address,
      blockchain: wallet.blockchain,
      state: wallet.state,
    };
  }

  static async checkBalance(walletData: WalletData): Promise<TokenBalance[]> {
    try {
      console.log(`Checking balance for wallet ${walletData.id}...`);
      const response = (await client.getWalletTokenBalance({
        id: walletData.id,
      })) as TokenBalanceResponse;

      console.log("Wallet balance retrieved:", response.data.tokenBalances);

      if (!response.data?.tokenBalances) {
        throw new Error("Failed to get wallet balance");
      }

      return response.data.tokenBalances;
    } catch (error) {
      console.error("Error checking balance:", error);
      throw error;
    }
  }

  static async transfer(
    fromWallet: WalletData,
    destinationAddress: string,
    amount: string,
    tokenSymbol: string = "USDC", // Default to USDC but allow other tokens
  ): Promise<TransactionStatus> {
    try {
      // Get token balances to find the requested token
      const balances = await this.checkBalance(fromWallet);
      const token = balances.find(
        (b) => b.token.symbol.toUpperCase() === tokenSymbol.toUpperCase(),
      );

      if (!token) {
        throw new Error(
          `Token ${tokenSymbol} not found in wallet. Available tokens: ${balances.map((b) => b.token.symbol).join(", ")}`,
        );
      }

      // Check if balance is sufficient
      if (parseFloat(token.amount) < parseFloat(amount)) {
        throw new Error(
          `Insufficient ${tokenSymbol} balance. Available: ${token.amount}`,
        );
      }

      console.log("Initiating transfer:", {
        from: fromWallet.id,
        to: destinationAddress,
        amount,
        token: {
          symbol: token.token.symbol,
          id: token.token.id,
        },
      });

      const response = await client.createTransaction({
        walletId: fromWallet.id,
        tokenId: token.token.id,
        destinationAddress,
        amount: [amount],
        fee: {
          type: "level",
          config: {
            feeLevel: "MEDIUM",
          },
        },
      });

      if (!response.data?.id) {
        throw new Error("Failed to create transaction");
      }

      // Start monitoring transaction status
      const status = await this.checkTransactionStatus(response.data.id);
      return status;
    } catch (error) {
      console.error("Error in transfer:", error);
      throw error;
    }
  }

  // Helper method to get available tokens
  static async getAvailableTokens(walletData: WalletData): Promise<string[]> {
    const balances = await this.checkBalance(walletData);
    return balances.map((b) => b.token.symbol);
  }

  // Helper method to get specific token balance
  static async getTokenBalance(
    walletData: WalletData,
    tokenSymbol: string,
  ): Promise<TokenBalance | null> {
    const balances = await this.checkBalance(walletData);
    return (
      balances.find(
        (b) => b.token.symbol.toUpperCase() === tokenSymbol.toUpperCase(),
      ) || null
    );
  }

  static async checkTransactionStatus(
    transactionId: string,
  ): Promise<TransactionStatus> {
    try {
      const response = await client.getTransaction({
        id: transactionId,
      });

      if (!response.data?.transaction) {
        throw new Error("Failed to get transaction status");
      }

      const tx = response.data.transaction;
      return {
        id: tx.id,
        state: tx.state,
        txHash: tx.txHash,
        createDate: tx.createDate,
        updateDate: tx.updateDate,
      };
    } catch (error) {
      console.error("Error checking transaction status:", error);
      throw error;
    }
  }
}
