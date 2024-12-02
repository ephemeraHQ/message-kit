import { Coinbase, WalletData, Wallet } from "@coinbase/coinbase-sdk";
import { XMTPContext } from "@xmtp/message-kit";
import { keccak256, toHex } from "viem";

const apiKeyName = process.env.COINBASE_API_KEY_NAME;
const privateKey = process.env.COINBASE_API_KEY_PRIVATE_KEY;

if (!apiKeyName || !privateKey) {
  throw new Error("Missing Coinbase API credentials");
}
interface WalletServiceData {
  data: WalletData;
  address: string;
}
const coinbase = new Coinbase({
  apiKeyName,
  privateKey,
});

export class WalletService {
  private walletDb: any;
  private encryptionKey: string;

  constructor(walletDb: any, encryptionKey: string) {
    this.walletDb = walletDb;
    this.encryptionKey = encryptionKey;
  }

  encrypt(data: any): string {
    const dataString = JSON.stringify(data);
    const key = keccak256(toHex(this.encryptionKey.toLowerCase()));
    // Simple XOR encryption with the key
    const encrypted = Buffer.from(dataString).map(
      (byte, i) => byte ^ parseInt(key.slice(2 + (i % 64), 4 + (i % 64)), 16),
    );
    return toHex(encrypted);
  }

  private hexToBytes(hex: string): Uint8Array {
    if (hex.startsWith("0x")) {
      hex = hex.slice(2);
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  decrypt(encryptedData: string): any {
    const key = keccak256(toHex(this.encryptionKey.toLowerCase()));
    const encrypted = this.hexToBytes(encryptedData);
    const decrypted = encrypted.map(
      (byte, i) => byte ^ parseInt(key.slice(2 + (i % 64), 4 + (i % 64)), 16),
    );
    return JSON.parse(Buffer.from(decrypted).toString());
  }

  async getUserWallet(userAddress: string): Promise<WalletServiceData> {
    const encryptedKey = `${this.encrypt(userAddress)}`;
    const walletData = await this.walletDb.get(`wallet:${encryptedKey}`);

    if (walletData) {
      try {
        const decrypted = this.decrypt(walletData);
        console.log(`Retrieved wallet data for user ${userAddress}`);
        return decrypted;
      } catch (error) {
        console.error("Failed to decrypt wallet data:", error);
        throw new Error("Invalid wallet access");
      }
    }

    console.log(`Creating new wallet for user ${userAddress}...`);
    const wallet = await Wallet.create({
      networkId: Coinbase.networks.BaseMainnet,
    });

    const data = wallet.export();
    const address = await wallet.getDefaultAddress();
    console.log("Address ID:", address.getId());
    console.log("Saved wallet data:", {
      data,
      userAddress,
      address: address.getId(),
    });

    await this.walletDb.set(
      `wallet:${encryptedKey}`,
      this.encrypt({ data, userAddress, address: address.getId() }),
    );
    return { data, address: address.getId() };
  }
  async requestFunds(
    context: XMTPContext,
    amount: number,
    to: string,
  ): Promise<void> {
    let from = context.message.sender.address;
    await context.reply("Check your DMs");
    await context.sendTo(
      "You don't have enough USDC. You can fund your account here:",
      [from],
    );
    await context.requestPayment(amount, "USDC", to, [from]);
    await context.sendTo(
      "After funding, please try again replying to the original message.",
      [from],
    );
  }
  async withdrawFunds(
    walletData: WalletData,
    userAddress: string,
    amount?: number,
  ): Promise<void> {
    const wallet = await Wallet.import(walletData);
    const balance = await wallet.getBalance(Coinbase.assets.Usdc);
    if (Number(balance) === 0) {
      throw new Error("Insufficient balance");
    }
    await wallet.createTransfer({
      amount: amount || balance,
      assetId: Coinbase.assets.Usdc,
      destination: userAddress,
      gasless: true,
    });
    console.log("Withdrawal completed successfully");
  }
  async checkBalance(walletData: WalletData): Promise<number> {
    console.log("Checking balance for wallet:", walletData);
    const wallet = await Wallet.import(walletData);
    let balance = await wallet.getBalance(Coinbase.assets.Usdc);
    console.log("Wallet balance:", balance);
    return Number(balance);
  }

  async transfer(
    fromWalletData: WalletData,
    toWalletData: WalletData,
    amount: number,
  ): Promise<boolean> {
    const fromWallet = await Wallet.import(fromWalletData);
    const toWallet = await Wallet.import(toWalletData);
    console.log("Transfer initiated:", {
      fromWallet: fromWalletData.walletId,
      toWallet: toWalletData.walletId,
      amount,
    });

    try {
      await fromWallet.createTransfer({
        amount,
        assetId: Coinbase.assets.Usdc,
        destination: toWallet,
        gasless: true,
      });
      console.log("Transfer completed successfully");
      return true;
    } catch (error) {
      console.error("Transfer failed:", error);
      throw error;
    }
  }

  async createTempWallet(tempId: string): Promise<WalletServiceData> {
    try {
      console.log(`Creating temporary wallet...`);
      const wallet = await Wallet.create({
        networkId: Coinbase.networks.BaseMainnet,
      });

      const data = wallet.export();
      const address = await wallet.getDefaultAddress();
      const walletInfo = { data, address: address.getId() };

      await this.walletDb.set(
        `temp:${this.encrypt(tempId)}`,
        this.encrypt(walletInfo),
      );
      return walletInfo;
    } catch (error) {
      console.error("Error creating temp wallet:", error);
      throw error;
    }
  }

  async getTempWallet(tempId: string): Promise<WalletServiceData> {
    const encryptedKey = this.encrypt(tempId);
    const encryptedData = await this.walletDb.get(`temp:${encryptedKey}`);
    console.log(`temp:${encryptedKey}`, encryptedData);
    if (!encryptedData) {
      throw new Error("Temp wallet not found");
    }

    try {
      const decrypted = this.decrypt(encryptedData);
      return decrypted;
    } catch (error) {
      console.error("Failed to access temp wallet:", error);
      throw new Error("Invalid wallet access");
    }
  }

  async deleteTempWallet(tempId: string): Promise<void> {
    console.log(`Deleting wallet for temp ${tempId}`);
    const encryptedKey = this.encrypt(tempId);
    const walletData = await this.walletDb.get(`temp:${encryptedKey}`);
    console.log(`Deleting tempID ${tempId}`, walletData);
    await this.walletDb.del(`temp:${encryptedKey}`);
    console.log(`Wallet deleted for temp ${tempId}`);
  }

  async swap(
    walletData: WalletData,
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
