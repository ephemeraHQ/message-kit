import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
import { USDCWallet } from "../lib/usdc.js";

export const cash: Skill[] = [
  {
    skill: "/balance",
    handler: balanceHandler,
    examples: ["/balance"],
    params: {},
    description: "Check your balance.",
  },
  {
    skill: "/fund [amount]",
    handler: fundHandler,
    examples: ["/fund 1", "/fund 10"],
    params: {
      amount: {
        type: "number",
        default: "",
      },
    },
    description: "Fund your wallet. Returns a url to fund your wallet.",
  },
  {
    skill: "/transfer [address] [amount]",
    handler: transferHandler,
    examples: ["/transfer 0x40f08f0f853d1c42c61815652b7ccd5a50f0be09 1"],
    params: {},
    description: "Transfer USDC to another address.",
  },
];

async function balanceHandler(context: XMTPContext) {
  const {
    message: { sender },
  } = context;
  const usdcWallet = new USDCWallet(sender.address);
  const { usdc } = await usdcWallet.checkBalances();
  await context.send(
    `Your balance is ${usdc} USDC. let me know if you want check again or to fund your wallet.`,
  );
}

async function fundHandler(context: XMTPContext) {
  try {
    const {
      message: {
        sender,
        content: {
          params: { amount },
        },
      },
    } = context;
    const usdcWallet = new USDCWallet(sender.address);
    const { usdc } = await usdcWallet.checkBalances();
    const MAX_USDC = 10;

    if (usdc >= MAX_USDC) {
      await context.send(`Your balance is maxed out at ${MAX_USDC} USDC.`);
      return;
    }

    const remainingLimit = MAX_USDC - usdc;
    let fundAmount: number;

    if (!amount) {
      const options = Array.from(
        { length: Math.floor(remainingLimit) },
        (_, i) => (i + 1).toString(),
      );
      const response = await context.awaitResponse(
        `Please specify the amount of USDC to prefund (1 to ${remainingLimit}):`,
        options,
      );
      fundAmount = parseInt(response);
    } else {
      fundAmount = parseInt(amount);
    }

    if (isNaN(fundAmount) || fundAmount <= 0 || fundAmount > remainingLimit) {
      await context.send(
        `Invalid amount. Please specify a value between 1 and ${remainingLimit} USDC.`,
      );
      return;
    }

    await context.requestPayment(fundAmount, "USDC", usdcWallet.address);
    await context.send(
      "After funding, let me know so I can check your balance.",
    );
  } catch (error) {
    await context.send(
      "An error occurred while processing your request. Please try again.",
    );
  }
}

async function transferHandler(context: XMTPContext) {
  const {
    message: {
      sender,
      content: {
        params: { address, amount },
      },
    },
  } = context;
  const usdcWallet = new USDCWallet(sender.address);
  if (amount > 10) {
    await context.send("You can only transfer up to 10 USDC at a time.");
    return;
  }
  await usdcWallet.transferUsdc(address, amount);
}
