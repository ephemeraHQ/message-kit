import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

export class WalletService {
  coinbase!: Coinbase;

  static async create(): Promise<WalletService> {
    const apiKeyName = process.env.COINBASE_API_KEY_NAME;
    const privateKey = process.env.COINBASE_API_KEY_PRIVATE_KEY;

    if (!apiKeyName || !privateKey) {
      throw new Error("Missing Coinbase API credentials");
    }
    const coinbase = new Coinbase({ apiKeyName, privateKey });
    const service = new WalletService();
    service.coinbase = coinbase;
    return service;
  }

  async getUserWallet(redis: any, userAddress: string): Promise<any> {
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

  async getWalletAddress(walletData: any): Promise<any> {
    console.log("Getting wallet address from data:", walletData);
    const wallet = await Wallet.import(walletData);
    const address = await wallet.getDefaultAddress();
    console.log("Wallet address:", address.toString());
    return address;
  }

  async checkBalance(walletData: any): Promise<number> {
    console.log("Checking balance for wallet:", walletData);
    const wallet = await Wallet.import(walletData);
    let balance = await wallet.getBalance(Coinbase.assets.Usdc);
    console.log("Wallet balance:", balance);
    return Number(balance);
  }

  async transfer(
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

  async createTempWallet(redis: any, tempId: string): Promise<any> {
    try {
      console.log(`Creating temporary wallet for ID ${tempId}...`);

      const wallet = await Wallet.create({
        networkId: Coinbase.networks.BaseMainnet,
      });

      const data = wallet.export();
      const address = await wallet.getDefaultAddress();
      console.log(redis);
      console.log("Temporary wallet created:", {
        data,
        address: address.toString(),
      });
      await redis.set(`temp:${tempId}`, JSON.stringify(data));
      return { data, address };
    } catch (error) {
      console.error("Error creating temporary wallet:", error);
      throw error;
    }
  }

  async getTempWallet(redis: any, tempId: string): Promise<any | null> {
    const walletData = await redis.get(`temp:${tempId}`);
    if (!walletData) {
      console.log(`No wallet found for temporary ID ${tempId}`);
      return null;
    }
    console.log(`Retrieved temporary wallet data:`, walletData);
    return JSON.parse(walletData);
  }

  static async deleteTempWallet(redis: any, tempId: string) {
    console.log(`Deleting wallet for temporary ID ${tempId}`);
    const walletData = await redis.get(`temp:${tempId}`);
    console.log(`Deleting temporary ID ${tempId}`, walletData);
    await redis.del(`temp:${tempId}`);
    console.log(`Wallet deleted for temporary ID ${tempId}`);
  }
}
