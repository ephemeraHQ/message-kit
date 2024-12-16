import {
  Coinbase,
  Wallet,
  Transfer,
  TimeoutError,
  Trade,
} from "@coinbase/coinbase-sdk";
import { type Context } from "../lib/core";
import { keccak256, toHex, toBytes } from "viem";
import { getUserInfo } from "../plugins/resolver";
import { isAddress } from "viem";
import { generateOnRampURL } from "@coinbase/cbpay-js";
import { AgentWallet, AgentWalletData } from "../helpers/types";
import { LocalStorage } from "./storage";

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

export class WalletService implements AgentWallet {
  private walletStorage: LocalStorage;
  private cdpEncriptionKey: string;
  private senderAddress: string;
  private developerAddress: string;

  constructor(context: Context) {
    this.walletStorage = new LocalStorage();
    this.cdpEncriptionKey = (
      process.env.COINBASE_API_KEY_PRIVATE_KEY as string
    ).toLowerCase();
    this.senderAddress = context.message.sender.address.toLowerCase();
    this.developerAddress = context.client.accountAddress.toLowerCase();
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
  async createWallet(key: string): Promise<AgentWalletData> {
    try {
      key = key.toLowerCase();
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
        address: this.senderAddress,
        key,
      };

      await this.walletStorage.set(
        `wallet:${this.encrypt(key)}`,
        this.encrypt(walletInfo),
      );

      await Wallet.import(data);
      return {
        id: address.getId(),
        wallet: wallet,
        address: this.senderAddress,
        agent_address: address.getId(),
        key: key,
      };
    } catch (error) {
      console.error("Failed to create wallet:", error);
      throw new Error("Failed to create wallet");
    }
  }
  async getWallet(
    key: string,
    createIfNotFound: boolean = true,
  ): Promise<AgentWalletData | undefined> {
    key = key.toLowerCase();
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
        id: importedWallet.getId() ?? "",
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

  async checkBalance(
    humanAddress: string,
  ): Promise<{ address: string | undefined; balance: number }> {
    humanAddress = humanAddress.toLowerCase();
    let walletData = await this.getWallet(humanAddress);
    if (!walletData) return { address: undefined, balance: 0 };

    console.log(`Retrieved wallet data for ${humanAddress}`);
    let balance = await walletData.wallet.getBalance(Coinbase.assets.Usdc);

    return {
      address: walletData.agent_address,
      balance: Number(balance),
    };
  }
  async onRampURL(amount: number, address: string) {
    const onRampURL = generateOnRampURL({
      appId: appId,
      presetCryptoAmount: Number(amount),
      addresses: {
        [address]: ["base"],
      },
      assets: ["USDC"],
    });
    return onRampURL;
  }
  async transfer(
    fromAddress: string,
    toAddress: string,
    amount: number,
  ): Promise<Transfer | undefined> {
    fromAddress = fromAddress.toLowerCase();
    toAddress = toAddress.toLowerCase();
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
    address = address.toLowerCase();
    let walletData = await this.getWallet(address);
    if (!walletData) return undefined;
    console.log(`Retrieved wallet data for ${address}`);

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

    return trade;
  }

  async deleteWallet(key: string): Promise<boolean> {
    key = key.toLowerCase();
    console.log(`Deleting wallet for key ${key}`);
    const encryptedKey = this.encrypt(key);
    await this.walletStorage.del(`wallet:${encryptedKey}`);
    console.log(`Wallet deleted for key ${key}`);
    return true;
  }
}
