import { Transfer } from "@coinbase/coinbase-sdk";
import { Skill } from "../helpers/types";
import { Context } from "../lib/core";
import { getUserInfo } from "../plugins/resolver";
import { isAddress } from "viem";
import { FrameKit } from "../plugins/framekit";

export const concierge: Skill[] = [
  {
    skill: "fund",
    description:
      "Fund your agent wallet. Asume its always usdc. There is no minum to fund the account. Max to top the account is 10 usdc",
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
      "/pay @username 5.1",
      "/pay @username 2",
      "/pay 0x123... 10",
      "/pay vitalik.eth 0.01",
    ],
    params: {
      recipient: {
        type: "username",
      },
      amount: {
        type: "number",
        default: "",
      },
    },
  },
  {
    skill: "balance",
    description: "Check your USDC wallet balance.",
    handler: handleWallet,
    examples: ["/balance"],
  },
  {
    skill: "address",
    description:
      "Check your agent wallet address/status/balance. Always assume the user is talking about its agent wallet.",
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
        params: { amount, recipient },
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
    await context.dm("Im your personal assistant. How can I help you today?");
  } else if (skill === "address") {
    const walletExist = await walletService.getWallet(sender.address);
    if (walletExist) {
      const { balance } = await walletService.checkBalance(sender.address);
      await context.dm("Your agent wallet address");
      const url = await FrameKit.sendWallet(
        walletExist.address,
        walletExist.agent_address,
        balance,
      );
      await context.dm(url);
      return;
    }
    await context.reply("You don't have an agent wallet.");
  } else if (skill === "balance") {
    const { balance } = await walletService.checkBalance(sender.address);
    await context.dm(`Your agent wallet has a balance of $${balance}`);
  } else if (skill === "fund") {
    await fund(context, amount);
    return;
  } else if (skill === "withdraw") {
    await withdraw(context, amount);
  } else if (skill === "swap") {
    context.dm("I cant do that yet");
    // await walletService.swap(sender.address, fromToken, toToken, amount);
    // await context.dm("Swap completed");
    // return;
  } else if (skill === "transfer") {
    const { balance } = await walletService.checkBalance(sender.address);
    if (balance === 0) {
      await context.reply("You have no funds to transfer.");
      return;
    }
    if (!recipient?.address) {
      console.log("recipient", recipient);
      await context.reply("User not found.");
      return;
    }
    await context.dm(
      `Transferring ${amount} USDC to ${recipient?.preferredName}`,
    );
    const tx = await walletService.transfer(
      sender.address,
      recipient?.address as string,
      amount,
    );
    await notifyUser(
      context,
      sender.address,
      recipient?.address as string,
      tx,
      amount,
    );
    return;
  }
}

async function notifyUser(
  context: Context,
  fromAddress: string,
  toAddress: string,
  transaction: any,
  amount: number,
) {
  if (transaction) {
    await context.dm(`Transfer completed successfully`);
    if ((await transaction.getTransactionHash()) !== undefined) {
      const url = await FrameKit.sendReceipt(
        `https://basescan.org/tx/${await transaction.getTransactionHash()}`,
        amount,
      );
      await context.dm(url);
    } else if ((await transaction.getTransaction()) !== undefined) {
      const url = await FrameKit.sendReceipt(
        `https://basescan.org/tx/${await transaction.getTransaction()}`,
        amount,
      );
      await context.dm(url);
    }
  }
  await context.dm(`Your balance was deducted by $${amount}`);

  if (!isAddress(toAddress)) return;
  const { v2, v3 } = await context.xmtp.isOnXMTP(toAddress);
  console.log(toAddress, { v2, v3 });
  if (!v2 && !v3) return;
  let userInfo = await getUserInfo(fromAddress);
  await context.sendTo(`${userInfo?.preferredName} just sent you $${amount}`, [
    toAddress,
  ]);
}

async function fund(
  context: Context,
  amount: number,
  onRamp: boolean = false,
): Promise<boolean> {
  const {
    group,
    message: { sender },
    walletService,
  } = context;

  if (amount <= 0) {
    await context.dm("Please specify a valid amount to fund.");
    return false;
  }

  let walletData = await walletService.getWallet(sender.address);
  if (!walletData) return false;
  console.log(`Retrieved wallet data for ${sender.address}`);
  let { balance } = await walletService.checkBalance(sender.address);
  if (Number(balance) === 10) {
    await context.dm("You have maxed out your funds. Max 10 USDC.");
    return false;
  } else if (amount) {
    console.log("amount", amount);
    console.log("balance", balance);
    if (amount + Number(balance) <= 10) {
      if (group) {
        await context.reply(
          `You need to fund your agent account. Check your DMs https://converse.xyz/${context.xmtp.address}`,
        );
      }
      let onRampURL = await walletService.onRampURL(
        amount,
        walletData.agent_address,
      );
      await context.dm("Here is the payment link:");
      const url = await FrameKit.requestPayment(
        walletData.agent_address,
        amount,
        "USDC",
        onRamp ? onRampURL : undefined,
      );
      await context.dm(url);
      return true;
    } else {
      await context.dm("Wrong amount. Max 10 USDC.");
      return false;
    }
  } else {
    const options = Array.from(
      { length: Math.floor(10 - Number(balance)) },
      (_, i) => (i + 1).toString(),
    );
    const response = await context.awaitResponse(
      `Please specify the amount of USDC to prefund (1 to ${
        10 - Number(balance)
      }):`,
      options,
    );

    let onRampURL = await walletService.onRampURL(
      amount,
      walletData.agent_address,
    );

    const url = await FrameKit.requestPayment(
      walletData.agent_address,
      Number(response),
      "USDC",
      onRamp ? onRampURL : undefined,
    );
    await context.dm(url);
    return true;
  }
}

async function withdraw(
  context: Context,
  amount?: number,
): Promise<Transfer | undefined> {
  const {
    message: { sender },
    walletService,
  } = context;

  let walletData = await walletService.getWallet(sender.address);
  if (!walletData) return undefined;
  console.log(`Retrieved wallet data for ${sender.address}`);
  let { balance } = await walletService.checkBalance(sender.address);
  if (amount && amount <= 0) {
    await context.dm("Please specify a valid positive amount to withdraw.");
    return;
  }
  if (amount && amount > Number(balance)) {
    await context.dm("You don't have enough funds to withdraw.");
    return;
  }
  let toWithdraw = amount ?? Number(balance);
  if (toWithdraw <= Number(balance)) {
    const transfer = await walletService.transfer(
      sender.address,
      sender.address,
      toWithdraw,
    );

    return transfer;
  }
}
