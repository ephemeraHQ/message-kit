import {
  Coinbase,
  Wallet,
  Transfer,
  Trade,
  TimeoutError,
} from "@coinbase/coinbase-sdk";
import { XMTPContext } from "../lib/xmtp";
import { keccak256, toHex, toBytes } from "viem";
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

  async get(key: string): Promise<string | null> {
    try {
      const filePath = path.join(this.baseDir, `${key}.dat`);
      return (await fsPromises?.readFile(filePath, "utf8")) ?? null;
    } catch (error) {
      return null;
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
  private context: XMTPContext;
  private walletStorage: LocalStorage;
  private cdpEncriptionKey: string;
  private enabled: boolean;
  private isGroup: boolean;
  private senderAddress: string;

  constructor(context: XMTPContext) {
    this.context = context;
    this.isGroup = context.group !== undefined;
    this.senderAddress = context.message.sender.address;
    this.walletStorage = new LocalStorage();
    this.cdpEncriptionKey = context.getConversationKey();
    this.enabled = Boolean(coinbase);
  }
  private async sendGroupMessage(message: string) {
    if (this.isGroup) {
      await this.context.reply(message);
    }
  }
  private async requestPayment(amount: number, to: string) {
    await this.context.requestPayment(amount, "USDC", to, [this.senderAddress]);
  }
  private async sendReceipt(tx: string) {
    this.context.sendReceipt(tx);
  }
  private async sendPrivateMessage(message: string) {
    if (!this.isGroup) {
      await this.context.send(message);
    } else if (this.isGroup) {
      await this.context.sendTo(message, [this.senderAddress]);
    }
  }
  private checkEnabled() {
    if (!this.enabled) {
      throw new Error(
        "Wallet service is not enabled - missing Coinbase API credentials",
      );
    }
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

  decrypt(data: string): any {
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
      this.checkEnabled();
      if (await this.getWallet(key)) {
        return true;
      }
      console.log(`Creating new wallet for key ${key}...`);
      const wallet = await Wallet.create({
        networkId: Coinbase.networks.BaseMainnet,
      });

      const data = wallet.export();
      const address = await wallet.getDefaultAddress();
      console.log("Agent Wallet:", address.getId());

      const walletInfo = {
        data,
        agent_address: address.getId(),
        address: this.senderAddress,
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
      //   address: this.senderAddress,
      //   key: key,
      // };
      return true;
    } catch (error) {
      console.error("Failed to create wallet:", error);
      return false;
    }
  }

  async getWallet(key: string): Promise<WalletServiceData | undefined> {
    const encryptedKey = `wallet:${this.encrypt(key)}`;
    const walletData = await this.walletStorage.get(encryptedKey);

    if (walletData) {
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
  }

  private async checkWalletExists(
    address: string,
  ): Promise<WalletServiceData | undefined> {
    const walletData = await this.getWallet(address);
    if (!walletData) {
      this.sendPrivateMessage(
        "You don't have an agent wallet yet. Would you like to create one?",
      );
      return undefined;
    }
    return walletData;
  }

  async requestFunds(amount: number): Promise<void> {
    let to = this.senderAddress;
    let wallet = await this.checkWalletExists(to);
    if (!wallet) return;

    if (!appId) {
      throw new Error("COINBASE_APP_ID is not set");
    }

    // const onRampURL = generateOnRampURL({
    //   appId: process.env.COINBASE_APP_ID,
    //   presetCryptoAmount: amount,
    //   addresses: {
    //     [wallet?.agent_address as string]: ["base"],
    //   },
    //   assets: ["USDC"],
    // });

    this.sendPrivateMessage(`You can fund your account here:`);
    this.requestPayment(amount, wallet?.agent_address);

    this.sendGroupMessage(
      `You need to fund your account. Check your DMs https://converse.xyz/${this.context.client.accountAddress}`,
    );

    return;
  }

  async withdrawFunds(amount?: number): Promise<Transfer | undefined> {
    let to = this.senderAddress;
    let walletData = await this.checkWalletExists(to);
    if (!walletData) return undefined;

    const balance = await walletData.wallet.getBalance(Coinbase.assets.Usdc);
    if (Number(balance) === 0) {
      this.sendPrivateMessage("Insufficient balance");
      return;
    }

    const transfer = await walletData.wallet.createTransfer({
      amount: amount || balance,
      assetId: Coinbase.assets.Usdc,
      destination: to,
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
        this.checkBalance(to);
      } else {
        console.error("Error while waiting for transfer to complete: ", err);
        this.checkBalance(to);
      }
    }
    return transfer;
  }

  async checkBalance(key: string): Promise<number> {
    let walletData = await this.checkWalletExists(key);
    if (!walletData) return 0;

    let balance = await walletData.wallet.getBalance(Coinbase.assets.Usdc);
    console.log(
      `Wallet balance for: ${walletData.agent_address} is ${balance}`,
    );
    return Number(balance);
  }

  async transfer(
    fromAddress: string,
    toAddress: string,
    amount: number,
  ): Promise<Transfer | undefined> {
    let from = await this.checkWalletExists(fromAddress);
    if (!from) return undefined;
    let balance = await from.wallet.getBalance(Coinbase.assets.Usdc);
    if (Number(balance) < amount) {
      this.requestFunds(amount);
      return;
    }
    let to = await this.getWallet(toAddress);
    let toWallet = to?.agent_address ?? toAddress;
    try {
      this.sendPrivateMessage(`Transferring ${amount} USDC to ${toWallet}`);
      const transfer = await from.wallet.createTransfer({
        amount,
        assetId: Coinbase.assets.Usdc,
        destination: toWallet as string,
        gasless: true,
      });
      let sent = false;
      try {
        await transfer.wait();
        let tx = transfer.getTransactionHash();
        this.sendReceipt(`https://basescan.org/tx/${tx}`);
        sent = true;
      } catch (err) {
        if (err instanceof TimeoutError) {
          console.log("Waiting for transfer timed out");
        } else {
          console.error("Error while waiting for transfer to complete: ", err);
        }
      }
      if (!sent) this.sendPrivateMessage(`Transfer completed successfully`);
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
    let walletData = await this.checkWalletExists(address);
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
        this.checkBalance(address);
      } else {
        console.error("Error while waiting for trade to complete: ", err);
        this.checkBalance(address);
      }
    }
    console.log(`Trade completed successfully`);
    return trade;
  }

  async deleteWallet(key: string): Promise<void> {
    console.log(`Deleting wallet for key ${key}`);
    const encryptedKey = this.encrypt(key);
    await this.walletStorage.del(`wallet:${encryptedKey}`);
    console.log(`Wallet deleted for key ${key}`);
  }
}
