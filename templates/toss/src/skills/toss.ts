import { Skill, XMTPContext, getUserInfo } from "@xmtp/message-kit";
import { getRedisClient, getWalletService, updateField } from "../lib/redis.js";
import { WalletService } from "../lib/wallet.js";
import {
  checkTossCorrect,
  extractWinners,
  TossData,
  generateTossMessage,
  generateEndTossMessage,
  generateTossStatusMessage,
} from "../lib/helpers.js";

const tossDBClient = await getRedisClient();
const walletServiceDB = await getWalletService();
const walletService = new WalletService(walletServiceDB);

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
    skill: "/cancel",
    description: "Cancel a toss.",
    handler: handleCancelToss,
    examples: ["/cancel"],
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
      sender.address,
      group.id,
    );

    let tossData: TossData = {
      tossId: tossId.toString(),
      description: params.description,
      options: params.options,
      amount: params.amount,
      groupId: group.id,
      adminName:
        (await getUserInfo(params.judge ?? sender.address))?.preferredName ??
        "",
      adminAddress: params.judge ?? sender.address,
      createdAt: new Date().toLocaleString(),
      endTime: params.endTime
        ? new Date(params.endTime).toLocaleString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
      participants: [],
      tossWalletAddress: createdTossWallet?.address,
    };
    await tossDBClient.set(
      "toss:" +
        WalletService.encrypt(tossId.toString(), group.id + sender.address),
      WalletService.encrypt(tossData, group.id + sender.address),
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

  const { tossId, participants, decryptedParticipants, amount, adminAddress } =
    tossData;

  const {
    message: {
      sender,
      content: {
        params: { response },
      },
    },
    group,
  } = context;

  if (decryptedParticipants?.some((p) => p.address === sender.address)) {
    await context.reply("You have already joined this toss.");
    return;
  }

  const tossWallet = await walletService.getTempWallet(
    tossId.toString(),
    group.id,
    adminAddress,
  );
  const userWallet = await walletService.getUserWallet(sender.address);
  const balance = await walletService.checkBalance(userWallet.data);

  if (balance < amount) {
    await walletService.requestFunds(context, amount, userWallet.address);
    return;
  }

  try {
    await walletService.transfer(userWallet.data, tossWallet?.data, amount);
    const encryptedParticipant = WalletService.encrypt(
      {
        address: sender.address,
        response: response,
        name:
          (await context.getUserInfo(sender.address))?.preferredName ??
          sender.address,
      },
      group.id + adminAddress,
    );
    participants.push(encryptedParticipant as string);

    await tossDBClient.set(
      `toss:${WalletService.encrypt(
        tossId.toString(),
        group.id + adminAddress,
      )}`,
      WalletService.encrypt(
        JSON.stringify({ ...tossData, participants }),
        group.id + adminAddress,
      ),
    );

    await context.reply("Successfully joined the toss!");
    await context.executeSkill(`/status ${tossId}`);
  } catch (error) {
    console.error(error);
    await context.reply("Failed to process your entry. Please try again.");
  }
}

export async function handleEndToss(context: XMTPContext) {
  const tossData = await checkTossCorrect(context);
  if (!tossData) return;
  const { tossId, adminAddress, options, participants, decryptedParticipants } =
    tossData;

  const {
    message: {
      sender,
      content: {
        params: { option },
      },
    },
    group,
  } = context;
  if (participants.length === 0) {
    await context.reply("No participants for this toss.");
    return;
  } else if (adminAddress.toLowerCase() !== sender.address.toLowerCase()) {
    await context.reply("Only the admin can end the toss.");
    return;
  } else if (!options.split(",").includes(option.toLowerCase())) {
    await context.reply("Invalid option selected.");
    return;
  }
  const { winners, losers } = await extractWinners(
    decryptedParticipants ?? [],
    option,
  );

  if (winners.length === 0) {
    await context.reply("No winners for this toss.");
    return;
  }

  const prize = (tossData.amount * participants.length) / (winners.length ?? 1);
  for (const winner of winners) {
    try {
      const winnerWallet = await walletService.getUserWallet(winner.address);
      const tossWallet = await walletService.getTempWallet(
        tossId.toString(),
        group.id,
        adminAddress,
      );

      if (!tossWallet) {
        await context.reply("Toss wallet not found");
        return;
      }

      await walletService.transfer(tossWallet.data, winnerWallet.data, prize);
    } catch (error) {
      console.error(`Failed to send prize to ${winner.address}:`, error);
      await context.reply(`Failed to send prize to ${winner.address}`);
    }
  }

  // Clean up
  //await walletService.deleteTempWallet(tossWalletRedis, tossId.toString());

  await tossDBClient.set(
    `toss:${WalletService.encrypt(tossId.toString(), group.id + adminAddress)}`,
    WalletService.encrypt(
      JSON.stringify({ ...tossData, status: "closed" }),
      group.id + adminAddress,
    ),
  );

  if (winners.length > 0) {
    await context.reply(generateEndTossMessage(winners, losers, prize));
  }
}

export async function handleCancelToss(context: XMTPContext) {
  const tossData = await checkTossCorrect(context);
  if (!tossData) return;
  const {
    tossId,
    adminAddress,
    options,
    participants,
    decryptedParticipants,
    amount,
  } = tossData;

  const {
    message: {
      sender,
      content: {
        params: { option },
      },
    },
    group,
  } = context;
  if (participants.length === 0) {
    await context.reply("No participants for this toss.");
    return;
  } else if (adminAddress.toLowerCase() !== sender.address.toLowerCase()) {
    await context.reply("Only the admin can end the toss.");
    return;
  } else if (!options.split(",").includes(option.toLowerCase())) {
    await context.reply("Invalid option selected.");
    return;
  }

  for (const participant of decryptedParticipants ?? []) {
    try {
      const userWallet = await walletService.getUserWallet(participant.address);
      const tossWallet = await walletService.getTempWallet(
        tossId.toString(),
        group.id,
        adminAddress,
      );

      if (!tossWallet) {
        await context.reply("Toss wallet not found");
        return;
      }

      await walletService.transfer(tossWallet.data, userWallet.data, amount);
    } catch (error) {
      console.error(`Failed to send prize to ${participant.address}:`, error);
      await context.reply(`Failed to send prize to ${participant.address}`);
    }
  }

  // Clean up
  //await walletService.deleteTempWallet(tossWalletRedis, tossId.toString());

  await tossDBClient.set(
    `toss:${WalletService.encrypt(tossId.toString(), group.id + adminAddress)}`,
    WalletService.encrypt(
      JSON.stringify({ ...tossData, status: "cancelled" }),
      group.id + adminAddress,
    ),
  );

  await context.reply("Toss cancelled successfully.");
}
export async function handleTossStatus(context: XMTPContext) {
  const tossData = await checkTossCorrect(context);
  if (!tossData) return;
  console.log(tossData);
  await context.reply(await generateTossStatusMessage(tossData));
}
