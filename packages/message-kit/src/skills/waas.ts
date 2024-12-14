import { Skill } from "../helpers/types";
import { Context } from "../lib/core";

export const waas: Skill[] = [
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
      "/send @username 5.1",
      "/send 0x123... 10",
      "/send vitalik.eth 0.01",
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
    skill: "address",
    description: "Check your wallet address.",
    handler: handleWallet,
    examples: ["/address"],
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

export async function handleWallet(context: Context) {
  const {
    message: {
      content: {
        skill,
        params: { amount, recipient, fromToken, toToken },
      },
      sender,
    },
    group,
    walletService,
  } = context;
  if (group && skill == "help") {
    await context.reply("Check your DM's");
    return;
  } else if (skill === "help") {
    await context.send("Im your personal assistant. How can I help you today?");
  } else if (skill === "address") {
    const walletExist = await walletService.getWallet(sender.address);
    if (walletExist) {
      await context.send("Your agent wallet address");
      await context.sendWallet(walletExist.agent_address);
      return;
    }
    await context.reply("You don't have an agent wallet.");
  } else if (skill === "balance") {
    const { balance } = await walletService.checkBalance(sender.address);
    await context.send(`Your agent wallet has a balance of $${balance}`);
  } else if (skill === "fund") {
    await walletService.fund(amount);
    return;
  } else if (skill === "withdraw") {
    await walletService.withdraw(amount);
  } else if (skill === "swap") {
    await walletService.swap(sender.address, fromToken, toToken, amount);
    await context.send("Swap completed");
    return;
  } else if (skill === "transfer") {
    const { balance } = await walletService.checkBalance(sender.address);
    if (balance === 0) {
      await context.reply("You have no funds to transfer.");
      return;
    }
    await context.send(`Transferring ${amount} USDC to ${recipient}`);
    await walletService.transfer(sender.address, recipient, amount);
    await context.send("Transfer completed");
    return;
  }
}
