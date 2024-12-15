import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { type Context } from "../lib/core";
import { AgentWallet, AgentWalletData } from "../helpers/types";
import { LocalStorage } from "./storage";

const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
const walletSetId = process.env.CIRCLE_WALLET_SET_ID;

const client =
  apiKey && entitySecret && walletSetId
    ? initiateDeveloperControlledWalletsClient({
        apiKey,
        entitySecret,
      })
    : undefined;

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

export class WalletService implements AgentWallet {
  private walletStorage!: LocalStorage;
  private context: Context;
  private humanAddress: string;

  constructor(context: Context) {
    this.context = context;
    this.humanAddress = context.message.sender.address;
    this.walletStorage = new LocalStorage();
  }

  async getWallet(userAddress: string): Promise<AgentWalletData> {
    // Check if user has a wallet stored
    const walletData = await this.walletStorage.get(`wallet:${userAddress}`);

    if (walletData) {
      const wallet = JSON.parse(walletData);
      return {
        id: wallet.id,
        address: wallet.address,
        blockchain: "ETH-SEPOLIA",
        state: "ACTIVE",
        wallet: client?.getWallet,
        agent_address: userAddress,
        key: wallet.id,
      };
    }

    return this.createWallet(userAddress);
  }

  async createWallet(userAddress: string): Promise<AgentWalletData> {
    console.log(`Creating new wallet for user ${userAddress}...`);
    const response = await client?.createWallets({
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

    if (!response?.data?.wallets?.[0]) {
      throw new Error("Failed to create wallet");
    }

    const wallet = response?.data?.wallets?.[0];

    // Store in LocalStorage
    await this.walletStorage.set(
      `wallet:${userAddress}`,
      JSON.stringify({
        id: wallet.id,
        address: wallet.address,
      }),
    );

    console.log(`Created wallet for user ${userAddress}`);

    return {
      id: wallet.id,
      address: wallet.address,
      blockchain: wallet.blockchain,
      state: wallet.state,
      wallet: client?.getWallet,
      agent_address: userAddress,
      key: wallet.id,
    };
  }

  async transfer(
    fromAddress: string,
    toAddress: string,
    amount: number,
  ): Promise<any> {
    try {
      // Get token balances to find the requested token
      const fromWallet = await this.getWallet(fromAddress);
      const { balance, id } = await this.checkBalance(fromAddress);

      // Check if balance is sufficient
      if (balance < amount) {
        throw new Error(`Insufficient USDC balance. Available: ${balance}`);
      }

      console.log("Initiating transfer:", {
        from: fromWallet.id,
        to: toAddress,
        amount,
      });

      const response = await client?.createTransaction({
        walletId: fromWallet.id,
        tokenId: id as string,
        destinationAddress: toAddress,
        amount: [amount.toString()],
        fee: {
          type: "level",
          config: {
            feeLevel: "MEDIUM",
          },
        },
      });

      if (!response?.data?.id) {
        throw new Error("Failed to create transaction");
      }

      // Start monitoring transaction status
      const status = await this.checkTransactionStatus(response?.data?.id);
      return status;
    } catch (error) {
      console.error("Error in transfer:", error);
      throw error;
    }
  }

  // Helper method to get available tokens
  private async getAvailableTokens(
    walletData: AgentWalletData,
  ): Promise<string[]> {
    const balances = await this.getBalance(walletData);
    return balances.map((b) => b.token.symbol);
  }

  private async getBalance(
    walletData: AgentWalletData,
  ): Promise<TokenBalance[]> {
    try {
      console.log(`Checking balance for wallet ${walletData.id}...`);
      const response = (await client?.getWalletTokenBalance({
        id: walletData.id,
      })) as TokenBalanceResponse;

      //console.log("Wallet balance retrieved:", response.data.tokenBalances);

      if (!response.data?.tokenBalances) {
        throw new Error("Failed to get wallet balance");
      }

      return response.data.tokenBalances;
    } catch (error) {
      console.error("Error checking balance:", error);
      throw error;
    }
  }

  // Helper method to get specific token balance
  async checkBalance(
    humanAddress: string,
    tokenSymbol: string = "USDC",
  ): Promise<{
    address: string | undefined;
    balance: number;
    id: string | undefined;
  }> {
    const userWallet = await this.getWallet(humanAddress);
    if (!userWallet) {
      return { address: undefined, balance: 0, id: undefined };
    }

    const balances = await this.getBalance(userWallet);
    const token = balances.find(
      (b) => b.token.symbol.toUpperCase() === tokenSymbol.toUpperCase(),
    );
    return {
      address: token?.token.tokenAddress,
      id: token?.token.id,
      balance: token ? parseFloat(token.amount) : 0,
    };
  }

  async checkTransactionStatus(
    transactionId: string,
  ): Promise<TransactionStatus> {
    try {
      const response = await client?.getTransaction({
        id: transactionId,
      });

      if (!response?.data?.transaction) {
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
  fund(amount: number): Promise<any> {
    // return this.transfer(this.humanAddress, this.humanAddress, amount);
    return Promise.resolve(true);
  }
  withdraw(amount: number): Promise<any> {
    // return this.transfer(this.humanAddress, this.humanAddress, amount);
    return Promise.resolve(true);
  }
}
