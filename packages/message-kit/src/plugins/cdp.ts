import {
  Coinbase,
  Wallet,
  Transfer,
  Trade,
  TimeoutError,
} from "@coinbase/coinbase-sdk";
import { XMTPContext } from "../lib/xmtp";
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
    : null;

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
  private context: XMTPContext;
  private humanAddress: string;

  constructor(context: XMTPContext) {
    this.context = context;
    this.humanAddress = context.message.sender.address;
    this.walletStorage = new LocalStorage();
    this.cdpEncriptionKey = context.getConversationKey();
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
      await this.context.send(`Creating new agent wallet for you...`);
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

      ///let importedWallet =
      await Wallet.import(data);
      // return {
      //   wallet: importedWallet,
      //   agent_address: address.getId(),
      //   address: this.humanAddress,
      //   key: key,
      // };
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
      console.log(`Retrieved wallet data for ${decrypted.agent_address}`);

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

  async fund(amount: number): Promise<boolean> {
    let walletData = await this.getWallet(this.humanAddress);
    if (!walletData) return false;
    let balance = await walletData.wallet.getBalance(Coinbase.assets.Usdc);
    if (Number(balance) === 10) {
      await this.context.reply("You have maxed out your funds. Max 10 USDC.");
      return false;
    } else if (amount) {
      if (amount + Number(balance) <= 10) {
        return true;
      } else {
        await this.context.reply("Wrong amount. Max 10 USDC.");
        return false;
      }
    }
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

    await this.context.requestPayment(
      walletData.agent_address,
      Number(response),
    );
    return true;
  }

  async withdraw(amount?: number): Promise<Transfer | undefined> {
    let walletData = await this.getWallet(this.humanAddress);
    if (!walletData) return undefined;
    let balance = await walletData.wallet.getBalance(Coinbase.assets.Usdc);
    if (Number(balance) === 0) {
      await this.context.send("You have no funds to withdraw.");
      return;
    }
    let toWithdraw = amount ?? Number(balance);
    if (toWithdraw <= Number(balance)) {
      const transfer = await walletData.wallet.createTransfer({
        amount: Number(amount),
        assetId: Coinbase.assets.Usdc,
        destination: this.humanAddress,
        gasless: true,
      });
      // Wait for transfer to land on-chain.
      try {
        await transfer.wait();
        console.log(
          `Withdrawal completed successfully: https://basescan.org/tx/${transfer.getTransactionHash()}`,
        );
      } catch (err) {
        if (err instanceof TimeoutError) {
          console.log("Waiting for transfer timed out");
        } else {
          console.error("Error while waiting for transfer to complete: ", err);
        }
      }
      return transfer;
    }
  }

  async checkBalance(
    humanAddress: string,
  ): Promise<{ address: string | undefined; balance: number }> {
    let walletData = await this.getWallet(humanAddress);
    if (!walletData) return { address: undefined, balance: 0 };
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
    let balance = await from.wallet.getBalance(Coinbase.assets.Usdc);
    if (Number(balance) < amount) {
      return undefined;
    }
    if (!isAddress(toAddress)) {
      let user = await getUserInfo(toAddress);
      console.log("resolved toAddress", toAddress, user?.address);
      if (!user) {
        this.context.send("User not found.");
        return undefined;
      }
      toAddress = user.address as string;
    }
    let to = await this.getWallet(toAddress, false);
    let toWallet = to?.agent_address ?? toAddress;
    try {
      const transfer = await from.wallet.createTransfer({
        amount,
        assetId: Coinbase.assets.Usdc,
        destination: toWallet as string,
        gasless: true,
      });
      try {
        await transfer.wait();
        return transfer;
      } catch (err) {
        if (err instanceof TimeoutError) {
          console.log("Waiting for transfer timed out");
        } else {
          console.error("Error while waiting for transfer to complete: ", err);
        }
      }
      return transfer;
    } catch (error) {
      console.error("Transfer failed:", error);
      throw error;
    }
  }

  async swap(
    address: string,
    fromAssetId: string,
    toAssetId: string,
    amount: number,
  ): Promise<Trade | undefined> {
    let walletData = await this.getWallet(address);
    if (!walletData) return undefined;

    console.log(
      `Initiating swap from ${fromAssetId} to ${toAssetId} for amount: ${amount}`,
    );

    const trade = await walletData.wallet.createTrade({
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

  async deleteWallet(key: string): Promise<boolean> {
    console.log(`Deleting wallet for key ${key}`);
    const encryptedKey = this.encrypt(key);
    await this.walletStorage.del(`wallet:${encryptedKey}`);
    console.log(`Wallet deleted for key ${key}`);
    return true;
  }
}
