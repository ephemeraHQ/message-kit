import { Context, Skill } from "@xmtp/message-kit";
import { baselinks } from "../plugins/baselinks.js";
import { USDCWallet } from "../plugins/usdc.js";

export const cash: Skill[] = [
  {
    skill: "balance",
    handler: balanceHandler,
    examples: ["/balance"],
    description: "Check your balance.",
  },
  {
    skill: "fund",
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
    skill: "transfer",
    handler: transferHandler,
    examples: ["/transfer 0x40f08f0f853d1c42c61815652b7ccd5a50f0be09 1"],
    params: {
      address: {
        type: "address",
        default: "",
      },
      amount: {
        type: "number",
        default: "",
      },
    },
    description: "Transfer USDC to another address.",
  },
];

async function balanceHandler(context: Context) {
  const {
    message: { sender },
  } = context;
  const usdcWallet = new USDCWallet(sender.address);
  const { usdc } = await usdcWallet.checkBalances();
  await context.send({
    message: `Your balance is ${usdc} USDC. let me know if you want check again or to fund your wallet.`,
    originalMessage: context.message,
  });
}

async function fundHandler(context: Context) {
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
      await context.send({
        message: `Your balance is maxed out at ${MAX_USDC} USDC.`,
        originalMessage: context.message,
      });
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
      await context.send({
        message: `Invalid amount. Please specify a value between 1 and ${remainingLimit} USDC.`,
        originalMessage: context.message,
      });
      return;
    }

    const url = baselinks.paymentLink(usdcWallet.agentAddress, fundAmount);
    await context.send({ message: url, originalMessage: context.message });
    await context.send({
      message: "After funding, let me know so I can check your balance.",
      originalMessage: context.message,
    });
  } catch (error) {
    await context.send({
      message:
        "An error occurred while processing your request. Please try again.",
      originalMessage: context.message,
    });
  }
}

async function transferHandler(context: Context) {
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
    await context.send({
      message: "You can only transfer up to 10 USDC at a time.",
      originalMessage: context.message,
    });
    return;
  }
  await usdcWallet.transferUsdc(address, amount);
}
