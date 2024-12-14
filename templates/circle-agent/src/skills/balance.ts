import { Skill, Context } from "@xmtp/message-kit";
import { WalletService } from '../lib/WalletService.js';

export const balanceSkill: Skill[] = [
  {
    skill: "balance",
    handler: handler,
    examples: ["/balance"],
    description: "Check agent's wallet balance",
    params: {}
  },
];

async function handler(context: Context) {
  try {
    const userWallet = await WalletService.getUserWallet(context.message.sender.address);
    const balances = await WalletService.checkBalance(userWallet);
    console.log(balances);
    
    if (balances.length === 0) {
      return {
        code: 200,
        message: "You don't have any funds in your wallet right now"
      };
    }

    let message = `💰 Your wallet balances:\n`;
    message += `📍 Address: ${userWallet.address}\n\n`;

    balances.forEach(balance => {
      const amount = balance.amount;
      const symbol = balance.token.symbol;
      message += `${symbol}: ${amount}\n`;
    });

    return {
      code: 200,
      message
    };
  } catch (error: any) {
    console.error('Error checking balance:', error);
    return {
      code: 500,
      message: `❌ Failed to check balance: ${error.message}`
    };
  }
}