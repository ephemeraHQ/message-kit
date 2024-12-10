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
    examples: [
      "/transfer @username 5.1",
      "/transfer @username 2",
      "/transfer 0x123... 10",
      "/transfer vitalik.eth 0.01",
    ],
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
  {
    skill: "swap",
    description: "Swap between tokens (e.g., ETH to USDC).",
    handler: handleWallet,
    examples: ["/swap 1 eth usdc", "/swap 100 usdc eth"],
    params: {
      amount: {
        type: "number",
        default: "",
      },
      fromToken: {
        type: "string",
        values: ["eth", "usdc"],
        default: "",
      },
      toToken: {
        type: "string",
        values: ["eth", "usdc"],
        default: "",
      },
    },
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

      const userInfo = await context.getUserInfo(recipient);
      recipientAddress = userInfo?.address;
      console.log("recipientAddress", userInfo);
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

    case "swap":
      const { amount: swapAmount, fromToken, toToken } = params;
      await walletService.swap(sender.address, swapAmount, fromToken, toToken);
      await context.reply(
        `Successfully swapped ${swapAmount} ${fromToken.toUpperCase()} to ${toToken.toUpperCase()}`,
      );
      break;
  }
}
