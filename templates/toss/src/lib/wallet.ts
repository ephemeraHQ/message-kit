import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { getUserWalletRedis, getTossWalletRedis } from "./redis.js";

const apiKeyName = process.env.COINBASE_API_KEY_NAME;
const privateKey = process.env.COINBASE_API_KEY_PRIVATE_KEY;

if (!apiKeyName || !privateKey) {
  throw new Error("Missing Coinbase API credentials");
}

const coinbase = new Coinbase({
  apiKeyName: apiKeyName as string,
  privateKey: privateKey as string,
});

export class WalletService {
  static async getUserWallet(userAddress: string): Promise<any> {
    const redis = await getUserWalletRedis();
    const walletData = await redis.get(`wallet:${userAddress}`);

    if (walletData) {
      console.log(`Retrieved wallet data for user ${userAddress}:`, walletData);
      return JSON.parse(walletData);
    }

    console.log(`Creating new wallet for user ${userAddress}...`);
    const wallet = await Wallet.create({
      networkId: Coinbase.networks.BaseMainnet,
    });

    const data = wallet.export();
    console.log("Exported wallet data:", data);

    await redis.set(`wallet:${userAddress}`, JSON.stringify(data));
    return data;
  }

  static async createTempWallet(tossId: string): Promise<any> {
    const redis = await getTossWalletRedis();

    try {
      console.log(`Creating wallet for toss ${tossId}...`);

      const wallet = await Wallet.create({
        networkId: Coinbase.networks.BaseMainnet,
      });

      const data = wallet.export();
      const address = await wallet.getDefaultAddress();
      console.log("Toss wallet created:", {
        data,
        address: address.toString(),
      });

      await redis.set(`toss:${tossId}`, JSON.stringify(data));
      return { data, address };
    } catch (error) {
      console.error("Error creating toss wallet:", error);
      throw error;
    }
  }

  static async getWalletAddress(walletData: any): Promise<any> {
    console.log("Getting wallet address from data:", walletData);
    const wallet = await Wallet.import(walletData);
    const address = await wallet.getDefaultAddress();
    console.log("Wallet address:", address.toString());
    return address;
  }

  static async checkBalance(walletData: any): Promise<number> {
    console.log("Checking balance for wallet:", walletData);
    const wallet = await Wallet.import(walletData);
    let balance = await wallet.getBalance(Coinbase.assets.Usdc);
    console.log("Wallet balance:", balance);
    return Number(balance);
  }

  static async transfer(
    fromWalletData: any,
    toWalletData: any,
    amount: number,
  ): Promise<void> {
    console.log("Transfer initiated:", {
      fromWallet: fromWalletData,
      toWallet: toWalletData,
      amount,
    });

    const fromWallet = await Wallet.import(fromWalletData);
    const toWallet = await Wallet.import(toWalletData);
    console.log("Both wallets imported successfully");

    try {
      await fromWallet.createTransfer({
        amount,
        assetId: Coinbase.assets.Usdc,
        destination: toWallet,
        gasless: true,
      });
      console.log("Transfer completed successfully");
    } catch (error) {
      console.error("Transfer failed:", error);
      throw error;
    }
  }

  static async getTempWallet(tossId: string): Promise<any | null> {
    const redis = await getTossWalletRedis();
    const walletData = await redis.get(`toss:${tossId}`);
    if (!walletData) {
      console.log(`No wallet found for toss ${tossId}`);
      return null;
    }
    console.log(`Retrieved toss wallet data:`, walletData);
    return JSON.parse(walletData);
  }

  static async deleteTempWallet(tossId: string) {
    console.log(`Deleting wallet for toss ${tossId}`);
    const redis = await getTossWalletRedis();
    const walletData = await redis.get(`toss:${tossId}`);
    console.log(`Deleting tossID ${tossId}`, walletData);
    await redis.del(`toss:${tossId}`);
    console.log(`Wallet deleted for toss ${tossId}`);
  }
}
