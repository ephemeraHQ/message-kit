import fs from "fs";
import path from "path";
import { generatePrivateKey } from "viem/accounts";
import { ethers } from "ethers";

// Define the Base network RPC URL
const baseRpcUrl = "https://mainnet.base.org";

// Create a provider
const provider = new ethers.JsonRpcProvider(baseRpcUrl);

// USDC contract address on Base (replace with actual address)
const usdcAddress = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"; // Replace with the correct USDC contract address

// ERC-20 ABI (balanceOf and transfer functions)
const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

export class AgentWallet {
  walletDir: string;
  senderAddress: string;
  privateKey: string;
  agentAddress: string;
  usdcContract: ethers.Contract;
  wallet: ethers.Wallet;

  constructor(senderAddress: string) {
    this.senderAddress = senderAddress;
    this.walletDir = path.join(process.cwd(), `./.data/agentwallets`);
    const walletFilePath = path.join(this.walletDir, `${senderAddress}.agent`);

    if (!fs.existsSync(this.walletDir)) {
      fs.mkdirSync(this.walletDir, { recursive: true });
      this.privateKey = generatePrivateKey();
      const walletData = `KEY=${this.privateKey}`;
      fs.writeFileSync(walletFilePath, walletData);
      console.warn("Agent wallet created and saved successfully.");
    } else {
      const walletData = fs.readFileSync(walletFilePath, "utf8");
      this.privateKey = walletData.split("=")[1];
    }

    // Initialize wallet and USDC contract
    this.wallet = new ethers.Wallet(this.privateKey, provider);
    this.agentAddress = this.wallet.address;
    this.usdcContract = new ethers.Contract(usdcAddress, erc20Abi, this.wallet);
  }

  async checkUsdcBalance(): Promise<number> {
    try {
      const balance = await this.usdcContract.balanceOf(this.agentAddress);
      const formattedBalance = ethers.formatUnits(balance, 6); // USDC has 6 decimals
      console.warn(`USDC Balance: ${formattedBalance}`);
      return parseFloat(formattedBalance);
    } catch (error) {
      console.error("Error fetching USDC balance:", error);
      return 0;
    }
  }
  async transferUsdc(to: string, amount: number) {
    if (!ethers.isAddress(to)) {
      throw new Error("Invalid recipient address");
    }
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("Invalid transfer amount");
    }
    try {
      const amountInWei = ethers.parseUnits(amount.toString(), 6); // USDC has 6 decimals
      const tx = await this.usdcContract.transfer(to, amountInWei);
      const receipt = await tx.wait();
      if (receipt.status !== 1) {
        throw new Error("Transaction failed or was reverted");
      }
      console.warn(`Transferred ${amount} USDC to ${to}.`);
      return `Transferred ${amount} USDC to ${to}.`;
    } catch (error) {
      console.error("Error transferring USDC:", error);
      return "Error transferring USDC.";
    }
  }
}
