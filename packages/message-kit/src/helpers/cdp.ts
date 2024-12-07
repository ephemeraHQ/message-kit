import {
  Coinbase,
  Wallet,
  Transfer,
  Trade,
  TimeoutError,
} from "@coinbase/coinbase-sdk";
import { XMTPContext } from "../lib/xmtp";
import { keccak256, toHex, toBytes } from "viem";

const apiKeyName = process.env.COINBASE_API_KEY_NAME;
const privateKey = process.env.COINBASE_API_KEY_PRIVATE_KEY;

const coinbase =
  apiKeyName && privateKey
    ? new Coinbase({
        apiKeyName,
        privateKey,
      })
    : null;

interface WalletServiceData {
  wallet: Wallet;
  address: string;
  userAddress: string;
  identifier: string;
}

export class WalletService {
  private walletDb: any;
  private tempEncryptionKey: string;
  private userEncryptionKey: string;
  private enabled: boolean;

  constructor(
    walletDb: any,
    tempEncryptionKey: string,
    userEncryptionKey: string,
  ) {
    this.walletDb = walletDb;
    this.tempEncryptionKey = tempEncryptionKey.toLowerCase();
    this.userEncryptionKey = userEncryptionKey.toLowerCase();
    this.enabled = Boolean(coinbase);
  }

  private checkEnabled() {
    if (!this.enabled) {
      throw new Error(
        "Wallet service is not enabled - missing Coinbase API credentials",
      );
    }
  }

  encrypt(data: any, encryptionKey?: string): string {
    if (typeof data === "string") {
      data = data.toLowerCase();
    }
    const encKey = encryptionKey ?? this.tempEncryptionKey;
    const dataString = JSON.stringify(data);
    const key = keccak256(toHex(encKey));
    // Simple XOR encryption with the key
    const encrypted = Buffer.from(dataString).map(
      (byte, i) => byte ^ parseInt(key.slice(2 + (i % 64), 4 + (i % 64)), 16),
    );
    return toHex(encrypted);
  }

  decrypt(data: string, encryptionKey?: string): any {
    if (typeof data === "string") {
      data = data.toLowerCase();
    }

    const encKey = encryptionKey ?? this.tempEncryptionKey;
    const key = keccak256(toHex(encKey));
    const encrypted = toBytes(data);
    const decrypted = encrypted.map(
      (byte, i) => byte ^ parseInt(key.slice(2 + (i % 64), 4 + (i % 64)), 16),
    );
    return JSON.parse(Buffer.from(decrypted).toString());
  }

  async createUserWallet(userAddress: string): Promise<WalletServiceData> {
    this.checkEnabled();
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
      `wallet:${this.encrypt(userAddress, this.userEncryptionKey)}`,
      this.encrypt(
        { data, userAddress, address: address.getId() },
        this.userEncryptionKey,
      ),
    );

    let importedWallet = await Wallet.import(data);
    return {
      wallet: importedWallet,
      address: address.getId(),
      userAddress,
      identifier: userAddress,
    };
  }
  async getUserWallet(
    userAddress: string,
    encryptionKey?: string,
  ): Promise<WalletServiceData | undefined> {
    const encryptedKey = `wallet:${this.encrypt(
      userAddress,
      encryptionKey ?? this.userEncryptionKey,
    )}`;
    const walletData = await this.walletDb.get(encryptedKey);

    if (walletData) {
      try {
        const decrypted = this.decrypt(
          walletData,
          encryptionKey ?? this.userEncryptionKey,
        );
        console.log(`Retrieved wallet data for user ${userAddress}`);

        let importedWallet = await Wallet.import(decrypted.data);
        return {
          wallet: importedWallet,
          address: decrypted.address,
          userAddress,
          identifier: userAddress,
        };
      } catch (error) {
        console.error("Failed to decrypt wallet data:", error);
        throw new Error("Invalid wallet access");
      }
    }
    return undefined;
  }
  async requestFunds(context: XMTPContext, amount: number): Promise<void> {
    let to = context.message.sender.address;
    let agentWallet = await this.getUserWallet(to);
    if (!agentWallet) {
      agentWallet = await this.createUserWallet(to);
    }
    await context.sendTo(`You can fund your account here:`, [to]);
    await context.requestPayment(amount, "USDC", agentWallet.address, [to]);
  }
  async withdrawFunds(userAddress: string, amount?: number): Promise<Transfer> {
    let walletData = await this.getUserWallet(userAddress);
    if (!walletData) {
      throw new Error("Wallet not found");
    }
    const balance = await walletData.wallet.getBalance(Coinbase.assets.Usdc);
    if (Number(balance) === 0) {
      throw new Error("Insufficient balance");
    }
    const transfer = await walletData.wallet.createTransfer({
      amount: amount || balance,
      assetId: Coinbase.assets.Usdc,
      destination: userAddress,
      gasless: true,
    });
    // Wait for transfer to land on-chain.
    try {
      await transfer.wait();
    } catch (err) {
      if (err instanceof TimeoutError) {
        console.log("Waiting for transfer timed out");
      } else {
        console.error("Error while waiting for transfer to complete: ", err);
      }
    }
    console.log(`Withdrawal completed successfully`);
    return transfer;
  }
  async checkBalance(senderAddress: string): Promise<number> {
    let walletData = await this.getUserWallet(senderAddress);
    if (!walletData) {
      throw new Error("Wallet not found");
    }
    let balance = await walletData.wallet.getBalance(Coinbase.assets.Usdc);
    console.log("Wallet balance: for ", walletData.address, balance);
    return Number(balance);
  }

  async transfer(
    fromWallet: WalletServiceData,
    toWallet: WalletServiceData,
    amount: number,
  ): Promise<Transfer> {
    console.log("Transfer initiated:", {
      fromWallet: fromWallet.address,
      toWallet: toWallet.address,
      amount,
    });

    try {
      const transfer = await fromWallet.wallet.createTransfer({
        amount,
        assetId: Coinbase.assets.Usdc,
        destination: toWallet.address,
        gasless: true,
      });
      try {
        await transfer.wait();
      } catch (err) {
        if (err instanceof TimeoutError) {
          console.log("Waiting for transfer timed out");
        } else {
          console.error("Error while waiting for transfer to complete: ", err);
        }
      }
      console.log(`Transfer completed successfully`);
      return transfer;
    } catch (error) {
      console.error("Transfer failed:", error);
      throw error;
    }
  }

  async createTempWallet(tempId: string): Promise<WalletServiceData> {
    try {
      const wallet = await Wallet.create({
        networkId: Coinbase.networks.BaseMainnet,
      });

      const data = wallet.export();
      const address = await wallet.getDefaultAddress();
      const walletInfo = { data, address: address.getId() };
      console.log("Creating temporary wallet", walletInfo);

      await this.walletDb.set(
        `temp:${this.encrypt(tempId, this.tempEncryptionKey)}`,
        this.encrypt(walletInfo, this.tempEncryptionKey),
      );
      return {
        wallet: wallet,
        address: address.getId(),
        userAddress: address.getId(),
        identifier: tempId,
      };
    } catch (error) {
      console.error("Error creating temp wallet:", error);
      throw error;
    }
  }

  async getTempWallet(tempId: string): Promise<WalletServiceData | undefined> {
    const encryptedKey = this.encrypt(tempId, this.tempEncryptionKey);
    const encryptedData = await this.walletDb.get(`temp:${encryptedKey}`);
    if (!encryptedData) {
      console.log(`Temp wallet not found for ${tempId}`);
      return undefined;
    }

    try {
      const decrypted = this.decrypt(encryptedData, this.tempEncryptionKey);

      let importedWallet = await Wallet.import(decrypted.data);
      return {
        wallet: importedWallet,
        address: decrypted.address,
        userAddress: decrypted.address,
        identifier: tempId,
      };
    } catch (error) {
      console.error("Failed to access temp wallet:", error);
      return undefined;
    }
  }

  async deleteTempWallet(tempId: string): Promise<void> {
    console.log(`Deleting wallet for temp ${tempId}`);
    const encryptedKey = this.encrypt(tempId, this.tempEncryptionKey);
    const walletData = await this.walletDb.get(`temp:${encryptedKey}`);
    console.log(`Deleting tempID ${tempId}`, walletData);
    await this.walletDb.del(`temp:${encryptedKey}`);
    console.log(`Wallet deleted for temp ${tempId}`);
  }

  async swap(
    address: string,
    fromAssetId: string,
    toAssetId: string,
    amount: number,
  ): Promise<Trade> {
    console.log(
      `Initiating swap from ${fromAssetId} to ${toAssetId} for amount: ${amount}`,
    );

    const wallet = await this.getUserWallet(address);
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    const trade = await wallet.wallet.createTrade({
      amount,
      fromAssetId,
      toAssetId,
    });

    try {
      await trade.wait();
    } catch (err) {
      if (err instanceof TimeoutError) {
        console.log("Waiting for trade timed out");
      } else {
        console.error("Error while waiting for trade to complete: ", err);
      }
    }
    console.log(`Trade completed successfully`);
    return trade;
  }
}
