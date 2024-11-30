import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { getUserWalletRedis, getTossWalletRedis } from "./redis.js";

const apiKeyName =
  "organizations/ba8d1462-d59f-47bd-b3f8-6e5c7bc73026/apiKeys/562fbfd0-51c3-403c-8382-ae2fac8b8247";
const privateKey =
  "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIMhbzb4KogcjT2Mz2Mndh1H8IeOMS5PDR3pyRraV3dLWoAoGCCqGSM49\nAwEHoUQDQgAEFTKv37b63OdZiy6ijUn7aFYT6oi//a7G889D4oR3hb96USkHuQME\nBq8Rfy4cpz2mw0nPsX5vUlKAR3QraWmEtg==\n-----END EC PRIVATE KEY-----\n";

if (!apiKeyName || !privateKey) {
  throw new Error("Missing Coinbase API credentials");
}

const coinbase = new Coinbase({ apiKeyName, privateKey });

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
      networkId: Coinbase.networks.BaseMainnet 
    });

    const data = wallet.export();
    console.log('Exported wallet data:', data);
    
    await redis.set(`wallet:${userAddress}`, JSON.stringify(data));
    return data;
  }

  static async createTossWallet(tossId: string): Promise<any> {
    const redis = await getTossWalletRedis();
    
    try {
      console.log(`Creating wallet for toss ${tossId}...`);
      
      const wallet = await Wallet.create({ 
        networkId: Coinbase.networks.BaseMainnet 
      });

      const data = wallet.export();
      const address = (await wallet.getDefaultAddress()).toString();
      console.log('Toss wallet created:', { data, address });

      await redis.set(`toss:${tossId}`, JSON.stringify(data));
      return { data, address };
    } catch (error) {
      console.error('Error creating toss wallet:', error);
      throw error;
    }
  }

  static async getWalletAddress(walletData: any): Promise<string> {
    console.log('Getting wallet address from data:', walletData);
    const wallet = await Wallet.import(walletData);
    const address = await wallet.getDefaultAddress();
    console.log('Wallet address:', address.toString());
    return address.toString();
  }

  static async checkBalance(walletData: any): Promise<number> {
    console.log('Checking balance for wallet:', walletData);
    const wallet = await Wallet.import(walletData);
    let balance = await wallet.getBalance(Coinbase.assets.Usdc);
    console.log('Wallet balance:', balance);
    return Number(balance);
  }

  static async transfer(
    fromWalletData: any,
    toAddress: string,
    amount: number
  ): Promise<void> {
    console.log('Transfer initiated:', {
      fromWallet: fromWalletData,
      toAddress,
      amount
    });

    const fromWallet = await Wallet.import(fromWalletData);
    console.log('From wallet imported successfully');
    
    try {
      // Try direct address transfer
      await fromWallet.createTransfer({
        amount,
        assetId: Coinbase.assets.Usdc,
        destination: toAddress,  // Using address string directly
        gasless: true
      });
      console.log('Transfer completed successfully');
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  }

  static async getTossWallet(tossId: string): Promise<any | null> {
    const redis = await getTossWalletRedis();
    const walletData = await redis.get(`toss:${tossId}`);
    if (!walletData) {
      console.log(`No wallet found for toss ${tossId}`);
      return null;
    }
    console.log(`Retrieved toss wallet data:`, walletData);
    return JSON.parse(walletData);
  }

  static async deleteTossWallet(tossId: string) {
    console.log(`Deleting wallet for toss ${tossId}`);
    const redis = await getTossWalletRedis();
    await redis.del(`toss:${tossId}`);
    console.log(`Wallet deleted for toss ${tossId}`);
  }
}
