import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
import { AgentWallet } from "../lib/usdc.js";

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
  const agentWallet = new AgentWallet(sender.address);
  const { usdc } = await agentWallet.checkBalances();
  await context.send(
    `Your balance is ${usdc} USDC. let me know if you want check again or to fund your wallet.`,
  );
}

async function fundHandler(context: XMTPContext) {
  const {
    message: {
      sender,
      content: {
        params: { amount },
      },
    },
  } = context;
  const agentWallet = new AgentWallet(sender.address);
  const { usdc } = await agentWallet.checkBalances();
  if (!amount && usdc >= 0 && usdc < 10) {
    const min = usdc;
    const max = 10;
    const response = await context.awaitResponse(
      `Please specify the amount of USDC to prefund. \nFrom: ${min} to ${max}.`,
      Array.from({ length: max - min + 1 }, (_, i) => (i + min).toString()),
    );

    await context.requestPayment(
      parseInt(response),
      "USDC",
      agentWallet?.agentAddress,
    );
    await context.send(
      "After funding, let me know so i can check your balance.",
    );
    return;
  } else if (usdc && usdc >= 10) {
    await context.send("Your balance is maxed out at 10 USDC.");
    return;
  } else if (parseInt(amount) > 0 && usdc + parseInt(amount) <= 10) {
    await context.requestPayment(
      parseInt(amount),
      "USDC",
      agentWallet?.agentAddress,
    );
    await context.send(
      "After funding, let me know so i can check your balance.",
    );
    return;
  } else {
    await context.send("Invalid amount. Max 10 USDC. Please try again.");
    return;
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
  const agentWallet = new AgentWallet(sender.address);
  if (amount > 10) {
    await context.send("You can only transfer up to 10 USDC at a time.");
    return;
  }
  await agentWallet.transferUsdc(address, amount);
}
