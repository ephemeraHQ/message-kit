let wallets: Map<string, number> = new Map();

export class AgentWallet {
  senderAddress: string;

  constructor(senderAddress: string) {
    this.senderAddress = senderAddress;
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
