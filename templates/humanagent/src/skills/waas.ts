import { Skill, XMTPContext } from "@xmtp/message-kit";

export const waas: Skill[] = [
  {
    skill: "create",
    description: "Create your CDP wallet.",
    handler: handleWallet,
    examples: ["/create"],
  },
  {
    skill: "fund",
    description: "Fund your CDP wallet.",
    handler: handleWallet,
    examples: ["/fund 10", "/fund 0.01"],
    params: {
      amount: {
        type: "number",
        default: "",
      },
    },
  },
  {
    skill: "transfer",
    description: "Transfer USDC to another user.",
    handler: handleWallet,
    examples: ["/transfer @username 5", "/transfer 0x123... 5"],
    params: {
      recipient: {
        type: "string",
        default: "",
      },
      amount: {
        type: "number",
        default: "",
      },
    },
  },
  {
    skill: "balance",
    description: "Check your wallet balance.",
    handler: handleWallet,
    examples: ["/balance"],
  },
];

async function handleWallet(context: XMTPContext) {
  const {
    message: {
      content: { skill, params },
      sender,
    },
    walletService,
  } = context;

  switch (skill) {
    case "create":
      const created = await walletService.createWallet(sender.address);
      if (created) {
        await context.reply(
          "Your CDP wallet has been created! You can now fund it using /fund command.",
        );
      }
      break;

    case "fund":
      const { amount } = params;
      await walletService.requestFunds(amount || 1);
      break;

    case "transfer":
      const { recipient, amount: transferAmount } = params;
      let recipientAddress = recipient;

      if (recipient.startsWith("@")) {
        const userInfo = await context.getUserInfo(recipient.substring(1));
        recipientAddress = userInfo?.address;
      }

      await walletService.transfer(
        sender.address,
        recipientAddress,
        transferAmount,
      );
      break;

    case "balance":
      const balance = await walletService.checkBalance(sender.address);
      await context.reply(`Your current balance is ${balance} USDC`);
      break;
  }
}
