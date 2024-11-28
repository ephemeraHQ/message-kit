import fs from "fs";
import path from "path";
import { generatePrivateKey } from "viem/accounts";

let wallets: Map<string, number> = new Map();

export class AgentWallet {
  walletDir: string;
  senderAddress: string;
  constructor(senderAddress: string) {
    this.senderAddress = senderAddress;
    this.walletDir = path.join(process.cwd(), `./.data/agentwallets`);
    console.log("Wallet directory:", this.walletDir);
    if (!fs.existsSync(this.walletDir)) {
      fs.mkdirSync(this.walletDir, { recursive: true });
    }
    const privateKey = generatePrivateKey();
    const walletData = `KEY=${privateKey}`;
    fs.writeFileSync(
      path.join(this.walletDir, `${senderAddress}.agent`),
      walletData,
    );
    console.log("Agent wallet created and saved successfully.");
  }

  checkBalance() {
    const balance = wallets.get(this.senderAddress) || 0;
    return balance;
  }
  fakeFunding(amount: number) {
    wallets.set(this.senderAddress, amount);
  }

  transfer(to: string, amount: number) {
    const balance = wallets.get(this.senderAddress) || 0;
    if (balance >= amount) {
      wallets.set(this.senderAddress, balance - amount);
      return `Transferred ${amount} to ${to}. New balance: ${balance}`;
    } else {
      return "Insufficient balance for transfer.";
    }
  }
}
