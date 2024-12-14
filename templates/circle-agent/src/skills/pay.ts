import { Skill, Context } from "@xmtp/message-kit";
import { WalletService } from '../lib/WalletService.js';

export const paySkill: Skill[] = [
  {
    skill: "pay",
    handler: handler,
    examples: [
      "/pay 10 USDC 0x1234...",
      "/pay 0.1 ETH vitalik.eth",
      "/pay 5 MATIC 0x5678..."
    ],
    description: "Send tokens to an address",
    params: {
      amount: {
        type: "number",
      },
      token: {
        type: "string",
        default: "USDC"
      },
      recipient: {
        type: "string",
      }
    }
  },
];

async function handler(context: Context) {
  const {
    message: {
      content: {
        params: { amount, token, recipient }
      },
      sender
    },
  } = context;

  try {
    const fromWallet = await WalletService.getUserWallet(sender.address);
    
    if (!fromWallet) {
      return {
        code: 400,
        message: `❌ No wallet found for ${sender.address}`
      };
    }
    
    // Check if token exists in wallet
    const availableTokens = await WalletService.getAvailableTokens(fromWallet);
    if (!availableTokens.includes(token.toUpperCase())) {
      return {
        code: 400,
        message: `❌ Token ${token} not available. Available tokens: ${availableTokens.join(', ')}`
      };
    }

    // Check token balance before transfer
    const tokenBalance = await WalletService.getTokenBalance(fromWallet, token);
    if (!tokenBalance || parseFloat(tokenBalance.amount) < amount) {
      return {
        code: 400,
        message: `❌ Insufficient ${token} balance. Available: ${tokenBalance?.amount || 0}`
      };
    }
    
    // Start transfer
    const status = await WalletService.transfer(
      fromWallet,
      recipient,
      amount.toString(),
      token
    );

    let message = `🚀 Transfer initiated!\n`;
    message += `💸 Amount: ${amount} ${token}\n`;
    message += `📍 To: ${recipient}\n`;
    message += `📊 Status: ${status.state}\n`;
    if (status.txHash) {
      message += `🔗 Transaction: ${status.txHash}\n`;
    }

    return {
      code: 200,
      message
    };
  } catch (error: any) {
    console.error('Error in payment:', error);
    return {
      code: 500,
      message: `❌ Payment failed: ${error.message}`
    };
  }
} 