import { Skill, XMTPContext, getUserInfo } from "@xmtp/message-kit";
import { DM_HELP_MESSAGE } from "../plugins/helpers.js";

export const waas: Skill[] = [
  {
    skill: "create",
    description: "Create an agent wallet.",
    handler: handleDM,
    examples: ["/create"],
  },
  {
    skill: "fund",
    description: "Fund your account.",
    handler: handleDM,
    examples: ["/fund 10"],
    params: {
      amount: {
        type: "number",
      },
    },
  },
  {
    skill: "withdraw",
    description: "Withdraw funds from your account.",
    handler: handleDM,
    examples: ["/withdraw 10"],
    params: {
      amount: {
        type: "number",
      },
    },
  },
  {
    skill: "help",
    description: "Get help with tossing.",
    handler: handleDM,
    examples: ["/help"],
  },
  {
    skill: "balance",
    description: "Check your balance.",
    handler: handleDM,
    examples: ["/balance"],
  },
];

export async function handleDM(context: XMTPContext) {
  const {
    message: {
      content: {
        skill,
        params: { amount },
      },
      sender,
    },
    group,
    walletService,
  } = context;
  if (group && skill == "help") {
    await context.reply("Check your DM's");
    await context.sendTo(DM_HELP_MESSAGE, [sender.address]);
    return;
  } else if (skill === "help") {
    await context.send(DM_HELP_MESSAGE);
  } else if (skill === "create") {
    const walletExist = await walletService.getWallet(sender.address);
    if (walletExist) {
      await context.reply("You already have an agent wallet.");
      return;
    }
    await walletService.createWallet(sender.address);
  } else if (skill === "balance") {
    context.sendTo(
      `Your agent wallet for address is ${sender.address}\nBalance: $${await walletService.checkBalance(sender.address)}`,
      [sender.address],
    );
  } else if (skill === "fund") {
    const balance = await walletService.checkBalance(sender.address);
    if (balance === 10) {
      await context.reply("You have maxed out your funds.");
      return;
    } else if (amount) {
      if (amount + balance <= 10) {
        return walletService.requestFunds(Number(amount));
      } else {
        await context.send("Wrong amount. Max 10 USDC.");
        return;
      }
    }
    await context.reply(
      `You have $${balance} in your account. You can fund up to $${10 - balance} more.`,
    );
    const options = Array.from({ length: Math.floor(10 - balance) }, (_, i) =>
      (i + 1).toString(),
    );
    const response = await context.awaitResponse(
      `Please specify the amount of USDC to prefund (1 to ${10 - balance}):`,
      options,
    );
    return walletService.requestFunds(Number(response));
  } else if (skill === "withdraw") {
    const balance = await walletService.checkBalance(sender.address);
    if (balance === 0) {
      await context.reply("You have no funds to withdraw.");
      return;
    }
    const options = Array.from({ length: Math.floor(balance) }, (_, i) =>
      (i + 1).toString(),
    );
    const response = await context.awaitResponse(
      `Please specify the amount of USDC to withdraw (1 to ${balance}):`,
      options,
    );
    await walletService.withdrawFunds(Number(response));
  }
}
