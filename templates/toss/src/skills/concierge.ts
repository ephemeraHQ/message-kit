import { Transfer } from "@coinbase/coinbase-sdk";
import { Skill, Context } from "@xmtp/message-kit";
import { getUserInfo } from "xmtp";
import { isAddress } from "viem";
import { baselinks } from "../plugins/baselinks.js";

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
        params: { amount, recipient, fromToken, toToken },
      },
      sender,
    },
    group,
    walletService,
  } = context;

  if (group && skill == "help") {
    await context.send({
      message: "Check your DM's",

      originalMessage: context.message,
      typeId: "reply",
    });
    return;
  } else if (skill === "help") {
    await context.send({
      message: "Im your personal assistant. How can I help you today?",

      originalMessage: context.message,
    });
  } else if (skill === "address") {
    const walletExist = await walletService.getWallet(sender.address);
    if (walletExist) {
      const { balance } = await walletService.checkBalance(sender.address);
      await context.send({
        message: "Your agent wallet address",

        originalMessage: context.message,
      });
      const url = baselinks.walletDetails(
        walletExist.address,
        walletExist.agent_address,
        balance,
      );
      await context.send({
        message: url,

        originalMessage: context.message,
      });
      return;
    }
    await context.send({
      message: "You don't have an agent wallet.",

      originalMessage: context.message,
    });
  } else if (skill === "balance") {
    const { balance } = await walletService.checkBalance(sender.address);
    await context.send({
      message: `Your agent wallet has a balance of $${balance}`,

      originalMessage: context.message,
    });
  } else if (skill === "fund") {
    await fund(context, amount);
    return;
  } else if (skill === "withdraw") {
    await withdraw(context, amount);
  } else if (skill === "swap") {
    const { balance } = await walletService.checkBalance(sender.address);
    if (balance === 0) {
      await context.send({
        message: "You have no funds to transfer.",

        originalMessage: context.message,
      });
      return;
    }
    if (!recipient?.address) {
      console.log("recipient", recipient);
      await context.send({
        message: "User not found.",

        originalMessage: context.message,
      });
      return;
    }
    await context.send({
      message: `Swapping ${amount} ${fromToken} to ${toToken}`,

      originalMessage: context.message,
    });
    const swap = await walletService.swap(
      sender.address,
      fromToken,
      toToken,
      amount,
    );
    await context.send({
      message: `Swap completed successfully`,

      originalMessage: context.message,
    });
  } else if (skill === "transfer") {
    const { balance } = await walletService.checkBalance(sender.address);
    if (balance === 0) {
      await context.send({
        message: "You have no funds to transfer.",

        originalMessage: context.message,
      });
      return;
    }
    if (!recipient?.address) {
      console.log("recipient", recipient);
      await context.send({
        message: "User not found.",

        originalMessage: context.message,
      });
      return;
    }
    await context.send({
      message: `Transferring ${amount} USDC to ${recipient?.preferredName}`,

      originalMessage: context.message,
    });
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
    await context.send({
      message: `Transfer completed successfully`,
      receivers: [context.message.sender.address],
      originalMessage: context.message,
    });
    if ((await transaction.getTransactionHash()) !== undefined) {
      const url = baselinks.receiptLink(
        `https://basescan.org/tx/${await transaction.getTransactionHash()}`,
        amount,
      );
      await context.send({
        message: url,
        receivers: [context.message.sender.address],
        originalMessage: context.message,
      });
    } else if ((await transaction.getTransaction()) !== undefined) {
      const url = baselinks.receiptLink(
        `https://basescan.org/tx/${await transaction.getTransaction()}`,
        amount,
      );
      await context.send({
        message: url,
        receivers: [context.message.sender.address],
        originalMessage: context.message,
      });
    }
  }
  await context.send({
    message: `Your balance was deducted by $${amount}`,
    receivers: [context.message.sender.address],
    originalMessage: context.message,
  });

  if (!isAddress(toAddress)) return;
  const isOnXMTP = await context.xmtp.canMessage(toAddress);
  console.log(toAddress, isOnXMTP);
  if (!isOnXMTP) return;
  let userInfo = await getUserInfo(fromAddress);
  await context.send({
    message: `${userInfo?.preferredName} just sent you $${amount}`,
    receivers: [toAddress],
    originalMessage: context.message,
  });
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
    await context.send({
      message: "Please specify a valid amount to fund.",
      originalMessage: context.message,
    });
    return false;
  }

  let walletData = await walletService.getWallet(sender.address);
  if (!walletData) return false;
  console.log(`Retrieved wallet data for ${sender.address}`);
  let { balance } = await walletService.checkBalance(sender.address);
  if (Number(balance) === 10) {
    await context.send({
      message: "You have maxed out your funds. Max 10 USDC.",
      originalMessage: context.message,
    });
    return false;
  } else if (amount) {
    console.log("amount", amount);
    console.log("balance", balance);
    if (amount + Number(balance) <= 10) {
      if (group) {
        await context.send({
          message: `You need to fund your agent account. Check your DMs https://converse.xyz/${context.xmtp.address}`,
          originalMessage: context.message,
        });
      }
      let onRampURL = await walletService.onRampURL(
        amount,
        walletData.agent_address,
      );

      await context.send({
        message: "Here is the payment link:",
        originalMessage: context.message,
      });
      const url = baselinks.paymentLink(
        walletData.agent_address,
        amount,
        onRamp ? onRampURL : undefined,
      );
      await context.send({
        message: url,
        originalMessage: context.message,
      });
      return true;
    } else {
      await context.send({
        message: "Wrong amount. Max 10 USDC.",
        originalMessage: context.message,
      });
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

    const url = baselinks.paymentLink(
      walletData.agent_address,
      Number(response),
      onRamp ? onRampURL : undefined,
    );
    await context.send({
      message: url,
      originalMessage: context.message,
    });
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
    await context.send({
      message: "Please specify a valid positive amount to withdraw.",
      receivers: [context.message.sender.address],
      originalMessage: context.message,
    });
    return;
  }
  if (amount && amount > Number(balance)) {
    await context.send({
      message: "You don't have enough funds to withdraw.",
      receivers: [context.message.sender.address],
      originalMessage: context.message,
    });
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
