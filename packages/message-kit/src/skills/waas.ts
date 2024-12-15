import { Skill } from "../helpers/types";
import { Context } from "../lib/core";
import { getUserInfo } from "../plugins/resolver";
import { isAddress } from "viem";

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
      "/pay @username 5.1",
      "/pay @username 2",
      "/pay 0x123... 10",
      "/pay vitalik.eth 0.01",
    ],
    params: {
      recipient: {
        type: "user",
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
    description:
      "Check your agent wallet address/status/balance. Always assume the user is talking about its agent wallet.",
    handler: handleWallet,
    examples: ["/address"],
  },
  // {
  //   skill: "swap",
  //   description: "Swap between tokens (e.g., ETH to USDC).",
  //   handler: handleWallet,
  //   examples: ["/swap 1 eth usdc", "/swap 100 usdc eth"],
  //   params: {
  //     amount: {
  //       type: "number",
  //       default: "",
  //     },
  //     fromToken: {
  //       type: "string",
  //       values: ["eth", "usdc"],
  //       default: "",
  //     },
  //     toToken: {
  //       type: "string",
  //       values: ["eth", "usdc"],
  //       default: "",
  //     },
  //   },
  // },
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
    await context.send("Im your personal assistant. How can I help you today?");
  } else if (skill === "address") {
    const walletExist = await walletService.getWallet(sender.address);
    if (walletExist) {
      const { balance } = await walletService.checkBalance(sender.address);
      await context.send("Your agent wallet address");
      await context.framekit.sendWallet(
        walletExist.address,
        walletExist.agent_address,
        balance,
      );
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
    context.send("I cant do that yet");
    // await walletService.swap(sender.address, fromToken, toToken, amount);
    // await context.send("Swap completed");
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
    await context.send(
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
  let { balance } = await context.walletService.checkBalance(fromAddress);

  if (transaction) {
    await context.dm(`Transfer completed successfully`);
    if (transaction.getTransactionHash !== undefined) {
      await context.framekit.sendReceipt(
        `https://basescan.org/tx/${transaction.getTransactionHash()}`,
      );
    } else if (transaction.txHash !== undefined) {
      await context.framekit.sendReceipt(
        `https://basescan.org/tx/${transaction.txHash}`,
      );
    } else if (transaction.getTransaction !== undefined) {
      await context.framekit.sendReceipt(
        `https://basescan.org/tx/${transaction.getTransaction()}`,
      );
    }
  }
  let newBalance = (Number(balance) - amount).toFixed(2);
  await context.dm(
    `Your balance was deducted by $${amount}. Now is $${newBalance}.`,
  );

  if (!isAddress(toAddress)) return;
  const { v2, v3 } = await context.isOnXMTP(toAddress);
  console.log(toAddress, { v2, v3 });
  if (!v2 && !v3) return;
  let userInfo = await getUserInfo(fromAddress);
  await context.sendTo(`${userInfo?.preferredName} just sent you $${amount}`, [
    toAddress,
  ]);
}
