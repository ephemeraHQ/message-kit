import { Skill, XMTPContext, getUserInfo } from "@xmtp/message-kit";
import { TimeoutError } from "@coinbase/coinbase-sdk";
import { getRedisClient } from "../plugins/redis.js";
import {
  checkTossCorrect,
  extractWinners,
  TossData,
  generateTossMessage,
  generateEndTossMessage,
  generateTossStatusMessage,
  DM_HELP_MESSAGE,
} from "../plugins/helpers.js";

const tossDBClient = await getRedisClient();

export const toss: Skill[] = [
  {
    skill: "/end [option]",
    description: "End a toss.",
    handler: handleEndToss,
    examples: ["/end yes", "/end no"],
    params: {
      option: {
        type: "string",
      },
    },
  },
  {
    skill: "/create",
    description: "Create an agent wallet.",
    handler: handleDM,
    examples: ["/create"],
    params: {},
  },
  {
    skill: "/fund [amount]",
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
    skill: "/withdraw [amount]",
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
    skill: "/help",
    description: "Get help with tossing.",
    handler: handleDM,
    examples: ["/help"],
    params: {},
  },
  {
    skill: "/cancel",
    description: "Cancel a toss.",
    handler: handleCancelToss,
    examples: ["/cancel"],
    params: {},
  },
  {
    skill: "/balance",
    description: "Check your balance.",
    handler: handleDM,
    examples: ["/balance"],
    params: {},
  },
  {
    skill: "/join [response]",
    description: "Join a toss.",
    params: {
      response: {
        type: "string",
      },
    },
    handler: handleJoinToss,
    examples: ["/join yes", "/join no"],
  },
  {
    skill: "/status",
    description: "Check the status of the toss.",
    handler: handleTossStatus,
    examples: ["/status"],
    params: {},
  },
  {
    skill:
      "/toss [description] [options (separated by comma)] [amount] [judge(optional)] [endTime(optional)]",
    description:
      "Create a toss with a description, options, amount and judge(optional).",
    handler: handleTossCreation,
    examples: [
      "/toss 'Shane vs John at pickeball' 'Yes,No' 10",
      "/toss 'Will argentina win the world cup' 'Yes,No' 10",
      "/toss 'Race to the end' 'Fabri,John' 10 @fabri",
      "/toss 'Will argentina win the world cup' 'Yes,No' 5 '27 Oct 2023 23:59:59 GMT'",
      "/toss 'Will the niks win on sunday?' 'Yes,No' 10 vitalik.eth '27 Oct 2023 23:59:59 GMT'",
      "/toss 'Will it rain tomorrow' 'Yes,No' 0",
    ],
    params: {
      description: {
        type: "quoted",
      },
      options: {
        default: "Yes, No",
        type: "quoted",
      },
      amount: {
        type: "number",
      },
      judge: {
        type: "username",
      },
      endTime: {
        type: "quoted",
      },
    },
  },
];

export async function handleTossCreation(context: XMTPContext) {
  const {
    message: {
      content: { params },
      sender,
    },
    walletService,
    group,
  } = context;
  if (!group) {
    await context.reply("This command can only be used in a group.");
    return;
  }

  if (params.description && params.options && !isNaN(Number(params.amount))) {
    const keys = await tossDBClient.keys("*");
    let tossId = keys.length + 1;
    const createdTossWallet = await walletService.createTempWallet(
      tossId.toString(),
    );

    let tossData: TossData = {
      toss_id: tossId.toString(),
      description: params.description,
      options: params.options,
      amount: params.amount,
      group_id: group.id,
      admin_name:
        (await getUserInfo(params.judge ?? sender.address))?.preferredName ??
        "",
      admin_address: params.judge ?? sender.address,
      created_at: new Date().toLocaleString(),
      end_time: params.endTime
        ? new Date(params.endTime).toLocaleString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
      encrypted_participants: [],
      participants: [],
      toss_wallet_address: createdTossWallet?.address,
    };
    await tossDBClient.set(
      "toss:" + walletService.encrypt(tossId.toString()),
      walletService.encrypt(tossData),
    );

    if (tossId !== undefined) {
      await context.send(generateTossMessage(tossData));
    } else {
      await context.reply(
        `An error occurred while creating the toss. ${JSON.stringify(tossId)}`,
      );
    }
  }
}

export async function handleJoinToss(context: XMTPContext) {
  const tossData = await checkTossCorrect(context);
  if (!tossData) {
    return;
  }

  const { toss_id, participants, encrypted_participants, amount } = tossData;

  const {
    message: {
      sender,
      content: {
        params: { response },
      },
    },
    group,
    walletService,
  } = context;

  if (participants?.some((p) => p.address === sender.address)) {
    await context.reply("You have already joined this toss.");
    return;
  }

  const tossWallet = await walletService.getTempWallet(toss_id);
  if (!tossWallet) {
    await context.reply("Toss wallet not found");
    return;
  }
  const balance = await walletService.checkBalance(sender.address);

  if (balance < amount) {
    await context.send("You need to fund your account. Check your DMs:");
    await walletService.requestFunds(context, amount);
    return;
  }

  try {
    const senderWallet = await walletService.getUserWallet(sender.address);
    if (!senderWallet) {
      await context.reply("Sender wallet not found");
      return;
    }
    const transfer = await walletService.transfer(
      senderWallet,
      tossWallet,
      amount,
    );
    console.log("Transfer:", transfer.getTransactionHash());
    const encryptedParticipant = walletService.encrypt({
      address: sender.address,
      agent_address: senderWallet.address,
      response: response,
      name:
        (await context.getUserInfo(sender.address))?.preferredName ??
        sender.address,
    });
    encrypted_participants.push(encryptedParticipant as string);

    await tossDBClient.set(
      `toss:${walletService.encrypt(toss_id)}`,
      walletService.encrypt(
        JSON.stringify({ ...tossData, encrypted_participants }),
      ),
    );

    await context.reply("Successfully joined the toss!");
    await context.sendTo(
      `Your balance was deducted by $${amount}. Now is $${balance - amount}. You can check your balance with /balance`,
      [sender.address],
    );
    await context.executeSkill(`/status ${toss_id}`);
  } catch (error) {
    console.error(error);
    await context.reply("Failed to process your entry. Please try again.");
  }
}

export async function handleEndToss(context: XMTPContext) {
  const tossData = await checkTossCorrect(context);
  if (!tossData) return;
  const { toss_id, admin_address, options, participants } = tossData;

  const {
    message: {
      sender,
      content: {
        params: { option },
      },
    },
    walletService,
  } = context;

  if (participants?.length === 0) {
    await context.reply("No participants for this toss.");
    return;
  } else if (admin_address.toLowerCase() !== sender.address.toLowerCase()) {
    await context.reply("Only the admin can end the toss.");
    return;
  } else if (
    !options
      .split(",")
      .map((o) => o.toLowerCase())
      .includes(option.toLowerCase())
  ) {
    await context.reply("Invalid option selected.");
    return;
  }
  const { winners, losers } = await extractWinners(participants ?? [], option);

  if (winners.length === 0) {
    await context.reply("No winners for this toss.");
    return;
  }

  const prize =
    (tossData.amount * (participants?.length ?? 0)) / (winners.length ?? 1);

  try {
    for (const winner of winners) {
      const tossWallet = await walletService.getTempWallet(toss_id);

      if (!tossWallet) {
        await context.reply("Toss wallet not found");
        return;
      }
      const winnerWallet = await walletService.getUserWallet(
        winner.address,
        winner.address,
      );
      if (!winnerWallet) {
        await context.reply("Winner wallet not found");
        return;
      }
      const transfer = await walletService.transfer(
        tossWallet,
        winnerWallet,
        prize,
      );
      console.log("Transfer:", transfer.getTransactionHash());
      await tossDBClient.set(
        `toss:${walletService.encrypt(toss_id)}`,
        walletService.encrypt(
          JSON.stringify({ ...tossData, status: "closed" }),
        ),
      );
    }
    // Clean up
    //await walletService.deleteTempWallet(tossWalletRedis, tossId.toString());
    if (winners.length > 0) {
      await context.reply(generateEndTossMessage(winners, losers, prize));
    }

    await context.sendTo(
      `You received $${prize} from the toss! Check your balance with /balance`,
      winners.map((w) => w.address),
    );
  } catch (error) {
    await context.reply(`Failed to send prize to ${winners.length} winners`);
  }
}

export async function handleCancelToss(context: XMTPContext) {
  const tossData = await checkTossCorrect(context);
  if (!tossData) return;

  const { toss_id, admin_address, participants, amount } = tossData;

  const {
    message: { sender },
    walletService,
  } = context;

  if (participants?.length === 0) {
    await context.reply("No participants for this toss.");
    return;
  } else if (admin_address.toLowerCase() !== sender.address.toLowerCase()) {
    await context.reply("Only the admin can cancel the toss.");
    return;
  }

  for (const participant of participants ?? []) {
    try {
      const tossWallet = await walletService.getTempWallet(toss_id);

      if (!tossWallet) {
        await context.reply("Toss wallet not found");
        return;
      }

      const participantWallet = await walletService.getUserWallet(
        participant.address,
      );
      if (!participantWallet) {
        await context.reply("Participant wallet not found");
        return;
      }
      const transfer = await walletService.transfer(
        tossWallet,
        participantWallet,
        amount,
      );
      console.log("Transfer:", transfer.getTransactionHash());
    } catch (error) {
      console.error(`Failed to send prize to ${participant.address}:`, error);
      await context.reply(`Failed to send prize to ${participant.address}`);
    }
  }

  // Clean up
  //await walletService.deleteTempWallet(tossWalletRedis, tossId.toString());

  await tossDBClient.set(
    `toss:${walletService.encrypt(toss_id)}`,
    walletService.encrypt(JSON.stringify({ ...tossData, status: "cancelled" })),
  );

  await context.reply(
    `Toss cancelled successfully.\nFunds distributed to participants:\n
    ${participants?.map((p) => `${p.name} - $${amount}`).join("\n")}`,
  );
}
export async function handleTossStatus(context: XMTPContext) {
  const tossData = await checkTossCorrect(context);
  if (!tossData) return;
  await context.reply(await generateTossStatusMessage(tossData));
}

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
  }
  if (skill === "help") {
    await context.send(DM_HELP_MESSAGE);
  } else if (skill === "create") {
    const walletExist = await walletService.getUserWallet(sender.address);
    if (walletExist) {
      await context.reply("You already have an agent wallet.");
      return;
    }
    const userWallet = await walletService.createUserWallet(sender.address);
    await context.reply(
      `Your agent wallet address is ${userWallet.address}\nBalance: $${await walletService.checkBalance(sender.address)}`,
    );
  } else if (skill === "balance") {
    const userWallet = await walletService.getUserWallet(sender.address);

    context.sendTo(
      `Your agent wallet address is ${userWallet?.address}\nBalance: $${await walletService.checkBalance(sender.address)}`,
      [sender.address],
    );
  } else if (skill === "fund") {
    const balance = await walletService.checkBalance(sender.address);
    if (balance === 10) {
      await context.reply("You have maxed out your funds.");
      return;
    } else if (amount) {
      if (amount + balance <= 10) {
        await walletService.requestFunds(context, Number(amount));
        return;
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
    await walletService.requestFunds(context, Number(response));
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
    await walletService.withdrawFunds(sender.address, Number(response));
  }
}
