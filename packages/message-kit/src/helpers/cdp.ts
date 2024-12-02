import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

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
  static async getUserWallet(redis: any, userAddress: string): Promise<any> {
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

  static async createTempWallet(redis: any, tossId: string): Promise<any> {
    try {
      console.log(`Creating wallet for toss ${tossId}...`);

      const wallet = await Wallet.create({
        networkId: Coinbase.networks.BaseMainnet,
      });

      const data = wallet.export();
      const address = await wallet.getDefaultAddress();

      await redis.set(`toss:${tossId}`, JSON.stringify(data));
      return { data, address };
    } catch (error) {
      console.error("Error creating toss wallet:", error);
      throw error;
    }
  }

  static async getTempWallet(redis: any, tossId: string): Promise<any | null> {
    const walletData = await redis.get(`temp:${tossId}`);
    if (!walletData) {
      console.log(`No wallet found for toss ${tossId}`);
      return null;
    }
    console.log(`Retrieved toss wallet data:`, walletData);
    return JSON.parse(walletData);
  }

  static async deleteTempWallet(redis: any, tossId: string) {
    console.log(`Deleting wallet for toss ${tossId}`);
    const walletData = await redis.get(`toss:${tossId}`);
    console.log(`Deleting tossID ${tossId}`, walletData);
    await redis.del(`toss:${tossId}`);
    console.log(`Wallet deleted for toss ${tossId}`);
  }

  static async swap(
    walletData: any,
    fromAssetId: string,
    toAssetId: string,
    amount: number,
  ): Promise<void> {
    console.log(
      `Initiating swap from ${fromAssetId} to ${toAssetId} for amount: ${amount}`,
    );

    const wallet = await Wallet.import(walletData);
    const trade = await wallet.createTrade({
      amount,
      fromAssetId,
      toAssetId,
    });

    await trade.wait();

    if (trade.getStatus() === "complete") {
      console.log(`Trade successfully completed: `, trade.toString());
    } else {
      console.log(`Trade failed on-chain: `, trade.toString());
    }
  }
}
