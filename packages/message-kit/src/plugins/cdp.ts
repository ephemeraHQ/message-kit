import {
  Coinbase,
  Wallet,
  Transfer,
  Trade,
  TimeoutError,
} from "@coinbase/coinbase-sdk";
import { type Context } from "../lib/core";
import { keccak256, toHex, toBytes } from "viem";
import { getUserInfo } from "../plugins/resolver";
import { isAddress } from "viem";
import { generateOnRampURL } from "@coinbase/cbpay-js";
import path from "path";
import { getFS } from "../helpers/utils";

const { fsPromises } = getFS();
const appId = process.env.COINBASE_APP_ID;
const apiKeyName = process.env.COINBASE_API_KEY_NAME;
const privateKey = process.env.COINBASE_API_KEY_PRIVATE_KEY;

const coinbase =
  apiKeyName && privateKey
    ? new Coinbase({
        apiKeyName,
        privateKey,
      })
    : undefined;

interface WalletServiceData {
  wallet: Wallet;
  address: string;
  agent_address: string;
  key: string;
}

class LocalStorage {
  private baseDir: string;

  constructor(baseDir: string = ".data/wallet-storage") {
    this.baseDir = baseDir;
  }

  private async ensureDir() {
    if (!fsPromises) return;
    await fsPromises.mkdir(this.baseDir, { recursive: true });
  }

  async set(key: string, value: string): Promise<void> {
    await this.ensureDir();
    const filePath = path.join(this.baseDir, `${key}.dat`);
    await fsPromises?.writeFile(filePath, value, "utf8");
  }

  async get(key: string): Promise<string | undefined> {
    try {
      const filePath = path.join(this.baseDir, `${key}.dat`);
      return (await fsPromises?.readFile(filePath, "utf8")) ?? undefined;
    } catch (error) {
      return undefined;
    }
  }

  async del(key: string): Promise<void> {
    try {
      const filePath = path.join(this.baseDir, `${key}.dat`);
      await fsPromises?.unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }
}

export class WalletService {
  private walletStorage: LocalStorage;
  private cdpEncriptionKey: string;
  private context: Context;
  private humanAddress: string;
  private isGroup: boolean;
  constructor(context: Context) {
    this.context = context;
    this.humanAddress = context.message.sender.address;
    this.walletStorage = new LocalStorage();
    this.cdpEncriptionKey = context.client.accountAddress;
    this.isGroup = context.group !== undefined;
  }

  encrypt(data: any): string {
    if (typeof data === "string") {
      data = data.toLowerCase();
    }
    const dataString = JSON.stringify(data);
    const key = keccak256(toHex(this.cdpEncriptionKey));
    // Simple XOR encryption with the key
    const encrypted = Buffer.from(dataString).map(
      (byte, i) => byte ^ parseInt(key.slice(2 + (i % 64), 4 + (i % 64)), 16),
    );
    return toHex(encrypted);
  }

  decrypt(data: string): any | undefined {
    if (typeof data === "string") {
      data = data.toLowerCase();
    }

    const key = keccak256(toHex(this.cdpEncriptionKey));
    const encrypted = toBytes(data);
    const decrypted = encrypted.map(
      (byte, i) => byte ^ parseInt(key.slice(2 + (i % 64), 4 + (i % 64)), 16),
    );
    return JSON.parse(Buffer.from(decrypted).toString());
  }
  async createWallet(key: string): Promise<boolean> {
    try {
      console.log(`Creating new wallet for key ${key}...`);
      const wallet = await Wallet.create({
        networkId: Coinbase.networks.BaseMainnet,
      });

      const data = wallet.export();
      const address = await wallet.getDefaultAddress();
      console.log("New agent wallet created:", address.getId());

      const walletInfo = {
        data,
        agent_address: address.getId(),
        address: this.humanAddress,
        key,
      };

      await this.walletStorage.set(
        `wallet:${this.encrypt(key)}`,
        this.encrypt(walletInfo),
      );

      await Wallet.import(data);
      return true;
    } catch (error) {
      console.error("Failed to create wallet:", error);
      return false;
    }
  }
  async getWallet(
    key: string,
    createIfNotFound: boolean = true,
  ): Promise<WalletServiceData | undefined> {
    const encryptedKey = `wallet:${this.encrypt(key)}`;
    const walletData = await this.walletStorage.get(encryptedKey);
    // If no wallet exists, create one
    if (!walletData) {
      console.log("No wallet found for", key, encryptedKey);
      if (createIfNotFound) {
        const success = await this.createWallet(key);
        if (success) {
          // Retry getting the newly created wallet
          return this.getWallet(key);
        }
      }
      return undefined;
    }

    try {
      const decrypted = this.decrypt(walletData);
      let importedWallet = await Wallet.import(decrypted.data);
      return {
        wallet: importedWallet,
        agent_address: decrypted.agent_address,
        address: decrypted.address,
        key: decrypted.key,
      };
    } catch (error) {
      console.error("Failed to decrypt wallet data:", error);
      throw new Error("Invalid wallet access");
    }
  }

  async fund(amount: number, onRamp: boolean = false): Promise<boolean> {
    let walletData = await this.getWallet(this.humanAddress);
    if (!walletData) return false;
    console.log(`Retrieved wallet data for ${this.humanAddress}`);
    let balance = await walletData.wallet.getBalance(Coinbase.assets.Usdc);
    if (Number(balance) === 10) {
      await this.context.dm("You have maxed out your funds. Max 10 USDC.");
      return false;
    } else if (amount) {
      if (amount + Number(balance) <= 10) {
        if (this.isGroup) {
          await this.context.reply(
            `You need to fund your agent account. Check your DMs https://converse.xyz/${this.context.client.accountAddress}`,
          );
        }
        const onRampURL = generateOnRampURL({
          appId: appId,
          presetCryptoAmount: Number(amount),
          addresses: {
            [walletData.agent_address]: ["base"],
          },
          assets: ["USDC"],
        });
        await this.context.dm("Here is the payment link:");
        await this.context.framekit.requestPayment(
          walletData.agent_address,
          amount,
          "USDC",
          onRamp ? onRampURL : undefined,
        );
        return true;
      } else {
        await this.context.dm("Wrong amount. Max 10 USDC.");
        return false;
      }
    } else {
      const options = Array.from(
        { length: Math.floor(10 - Number(balance)) },
        (_, i) => (i + 1).toString(),
      );
      const response = await this.context.awaitResponse(
        `Please specify the amount of USDC to prefund (1 to ${
          10 - Number(balance)
        }):`,
        options,
      );
      const onRampURL = generateOnRampURL({
        appId: appId,
        presetCryptoAmount: Number(response),
        addresses: {
          [walletData.agent_address]: ["base"],
        },
        assets: ["USDC"],
      });
      await this.context.framekit.requestPayment(
        walletData.agent_address,
        Number(response),
        "USDC",
        onRamp ? onRampURL : undefined,
      );
      return true;
    }
  }

  async withdraw(amount?: number): Promise<Transfer | undefined> {
    let walletData = await this.getWallet(this.humanAddress);
    if (!walletData) return undefined;
    console.log(`Retrieved wallet data for ${this.humanAddress}`);
    let balance = await walletData.wallet.getBalance(Coinbase.assets.Usdc);
    if (amount && amount <= 0) {
      await this.context.dm(
        "Please specify a valid positive amount to withdraw.",
      );
      return;
    }
    if (amount && amount > Number(balance)) {
      await this.context.dm("You don't have enough funds to withdraw.");
      return;
    }
    let toWithdraw = amount ?? Number(balance);
    if (toWithdraw <= Number(balance)) {
      console.log("Withdrawing", toWithdraw);
      const transfer = await walletData.wallet.createTransfer({
        amount: toWithdraw,
        assetId: Coinbase.assets.Usdc,
        destination: this.humanAddress,
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

      this.notifyUser(walletData, this.humanAddress, transfer, toWithdraw);
      return transfer;
    }
  }

  async checkBalance(
    humanAddress: string,
  ): Promise<{ address: string | undefined; balance: number }> {
    let walletData = await this.getWallet(humanAddress);
    if (!walletData) return { address: undefined, balance: 0 };

    console.log(`Retrieved wallet data for ${this.humanAddress}`);
    let balance = await walletData.wallet.getBalance(Coinbase.assets.Usdc);

    return {
      address: walletData.agent_address,
      balance: Number(balance),
    };
  }

  async transfer(
    fromAddress: string,
    toAddress: string,
    amount: number,
  ): Promise<Transfer | undefined> {
    let from = await this.getWallet(fromAddress);
    if (!from) return undefined;
    console.log(`Retrieved wallet data for ${fromAddress}`);
    let balance = await from.wallet.getBalance(Coinbase.assets.Usdc);
    if (Number(balance) < amount) {
      return undefined;
    }
    if (!isAddress(toAddress) && !toAddress.includes(":")) {
      let user = await getUserInfo(toAddress);
      console.log("resolved toAddress", toAddress, user?.address);
      if (!user) {
        this.context.dm("User not found.");
        return undefined;
      }
      toAddress = user.address as string;
    }
    let to = await this.getWallet(toAddress, false);
    let toWallet = to?.agent_address ?? toAddress;
    if (toWallet.includes(":")) {
      console.log("Failed accessing the wallet");
      return undefined;
    }
    try {
      console.log("Transferring", amount, fromAddress, toWallet);
      const transfer = await from.wallet.createTransfer({
        amount,
        assetId: Coinbase.assets.Usdc,
        destination: toWallet as string,
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

      await this.notifyUser(from, toAddress, transfer, amount);
      return transfer;
    } catch (error) {
      console.error("Transfer failed:", error);
      throw error;
    }
  }
  async notifyUser(
    from: WalletServiceData,
    toAddress: string,
    transaction: Transfer | Trade,
    amount: number,
  ) {
    let balance = await from.wallet.getBalance(Coinbase.assets.Usdc);

    if (transaction instanceof Transfer) {
      await this.context.dm(`Transfer completed successfully`);
      if (transaction.getTransactionHash()) {
        await this.context.framekit.sendReceipt(
          `https://basescan.org/tx/${transaction.getTransactionHash()}`,
        );
      }
    } else if (transaction instanceof Trade) {
      await this.context.dm(`Trade completed successfully`);
      if (transaction.getTransaction()) {
        await this.context.framekit.sendReceipt(
          `https://basescan.org/tx/${(transaction as Trade).getTransaction()}`,
        );
      }
    }
    if (!isAddress(toAddress)) return;
    const { v2, v3 } = await this.context.isOnXMTP(toAddress);
    if (v2 || v3) return;
    await this.context.dm(
      `Your balance was deducted by $${amount}. Now is $${Number(balance) - amount}.`,
    );
    if (toAddress) {
      await this.context.sendTo(
        `Your balance was added by $${amount}. Now is $${Number(balance) + amount}.`,
        [toAddress],
      );
    }
  }
  // async swap(
  //   address: string,
  //   fromAssetId: string,
  //   toAssetId: string,
  //   amount: number,
  // ): Promise<Trade | undefined> {
  //   let walletData = await this.getWallet(address);
  //   if (!walletData) return undefined;
  //   console.log(`Retrieved wallet data for ${address}`);

  //   console.log(
  //     `Initiating swap from ${fromAssetId} to ${toAssetId} for amount: ${amount}`,
  //   );
  //   const trade = await walletData.wallet.createTrade({
  //     amount,
  //     fromAssetId,
  //     toAssetId,
  //   });

  //   try {
  //     await trade.wait();
  //   } catch (err) {
  //     if (err instanceof TimeoutError) {
  //       console.log("Waiting for trade timed out");
  //     } else {
  //       console.error("Error while waiting for trade to complete: ", err);
  //     }
  //   }

  //   //Notify the user
  //   await this.notifyUser(  from, toAddress, trade, amount);

  //   return trade;
  // }

  async deleteWallet(key: string): Promise<boolean> {
    console.log(`Deleting wallet for key ${key}`);
    const encryptedKey = this.encrypt(key);
    await this.walletStorage.del(`wallet:${encryptedKey}`);
    console.log(`Wallet deleted for key ${key}`);
    return true;
  }
}
