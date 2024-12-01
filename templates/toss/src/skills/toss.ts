import { Skill, XMTPContext, getUserInfo } from "@xmtp/message-kit";
import { getTossDBClient, updateField } from "../lib/redis.js";
import { WalletService } from "../lib/cdp.js";
import { checkTossCorrect, extractWinners } from "../lib/helpers.js";

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

const tossDBClient = await getTossDBClient();

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
    let judge = params.judge ?? sender.address;
    if (params.judge) {
      judge = await getUserInfo(params.judge);
    }
    let judgeUsername = await context.getUserInfo(
      judge?.address ?? sender.address,
    );
    const keys = await tossDBClient.keys("*");
    let tossId = keys.length + 1;
    const tossWallet = await WalletService.createTempWallet(tossId.toString());

    await tossDBClient.set(
      tossId.toString(),
      JSON.stringify({
        description: params.description,
        options: params.options,
        amount: params.amount,
        groupId: group?.id,
        admin: judge.toLowerCase(),
        createdAt: new Date().toLocaleString(),
        endTime: params.endTime
          ? new Date(params.endTime).toLocaleString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
        participants: [],
        walletAddress: tossWallet.address,
      }),
    );
    if (tossId !== undefined) {
      await context.send(
        `Here is your toss! 🪙 ID: ${tossId}\n\n✨ How it works:\n- The creator of the toss is one who can modify and settle the toss. \n- The pool will be split evenly with the winners. \n- Remember, with great power comes great responsibility 💪\n\n📋 Here are the details:
- Toss ID: ${tossId}
- Options: ${params.options}
- Amount: ${params.amount}
- Description: ${params.description}
- Judge: ${judgeUsername?.preferredName ?? judge?.address}
- Ends on: ${params?.endTime ?? "24 hours"}
\n🛠️ Reply with:
- @toss <option>
- @toss end <option> (only the judge can end the toss)
- @toss status`,
      );
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
  const { tossId, amount } = tossData;
  const {
    message: {
      sender,
      content: {
        params: { response },
      },
    },
  } = context;

  const userWallet = await WalletService.getUserWallet(sender.address);
  const tossWallet = await WalletService.getTempWallet(tossId.toString());

  if (!tossWallet) {
    await context.reply("Toss not found or expired");
    return;
  }

  const balance = await WalletService.checkBalance(userWallet);
  const userWalletAddress = await WalletService.getWalletAddress(userWallet);

  if (balance < amount) {
    await context.reply(
      "You don't have enough USDC to join the toss. You can fund your account here:",
    );
    await context.requestPayment(amount, "USDC", userWalletAddress.id);
    await context.reply(
      "After funding, please try again replying to the original message.",
    );
    return;
  }

  try {
    await WalletService.transfer(userWallet, tossWallet, amount);
    await updateField(tossDBClient, tossId.toString(), { response: true });

    await context.reply("Successfully joined the toss!");
  } catch (error) {
    console.error(error);
    await context.reply("Failed to process your entry. Please try again.");
  }
}

export async function handleEndToss(context: XMTPContext) {
  const tossData = await checkTossCorrect(context);
  if (!tossData) {
    await context.reply("Toss not found or invalid.");
    return;
  }
  const { tossId, admin, options, participants } = tossData;

  const {
    message: {
      sender,
      content: {
        params: { option },
      },
    },
  } = context;

  if (participants.length === 0) {
    await context.reply("No participants for this toss.");
    return;
  } else if (admin.toLowerCase() !== sender.address.toLowerCase()) {
    await context.reply("Only the admin can end the toss.");
    return;
  } else if (!options.split(",").includes(option.toLowerCase())) {
    await context.reply("Invalid option selected.");
    return;
  }

  const { winners, losers } = await extractWinners(participants, option);

  if (winners.length === 0) {
    await context.reply("No winners for this toss.");
    return;
  }

  const prize = (tossData.amount * participants.length) / (winners.length ?? 1);
  for (const winner of winners) {
    try {
      const winnerWallet = await WalletService.getUserWallet(winner.address);
      const tossWallet = await WalletService.getTempWallet(tossId.toString());

      if (!tossWallet) {
        await context.reply("Toss wallet not found");
        return;
      }

      await WalletService.transfer(tossWallet, winnerWallet, prize);
    } catch (error) {
      console.error(`Failed to send prize to ${winner.address}:`, error);
      await context.reply(`Failed to send prize to ${winner.address}`);
    }
  }

  // Clean up
  //await WalletService.deleteTempWallet(tossWalletRedis, tossId.toString());
  await updateField(tossDBClient, tossId.toString(), { status: "closed" });

  if (winners.length > 0) {
    await context.reply(
      `🏆 Winners have been rewarded! 🏆\n\n🎉 Winners: \n${winners
        .map(
          (winner: { name: string; address: string }) =>
            `- ${winner.name} - $${prize} 💰\n`,
        )
        .join("")}
😢 Losers: \n${losers
        .map(
          (loser: { name: string; address: string }) => `- ${loser.name} 😢\n`,
        )
        .join("")}
The pool has been distributed among the winners. The toss has been closed now.`,
    );
  }
}

export async function handleTossStatus(context: XMTPContext) {
  const tossData = await checkTossCorrect(context);
  if (!tossData) {
    await context.reply("Toss not found or invalid.");
    return;
  }

  const {
    tossId,
    admin,
    options,
    participants,
    amount,
    endTime,
    description,
    pool,
  } = tossData;

  const {
    message: {
      content: {},
    },
  } = context;

  let optArray = options.split(",");

  await context.reply(`Here are the details:
- Amount: ${amount}
- Description: ${description}
- ID: ${tossId}
- Judge: ${(await context.getUserInfo(admin))?.preferredName ?? admin}
- End Time: ${endTime ?? "24 hours"}

📊 Status:
👥 Participants:\n${participants.join("")}
💵 Amount: $${amount}
🏦 Pool: $${pool}
📋 Options:
${optArray
  .map((option: string) => {
    const voteCount = participants.filter(
      (participant: { response: string }) =>
        participant.response.toLowerCase() === option.toLowerCase(),
    ).length;
    return `\t- ${option}: ${voteCount} votes`;
  })
  .join("\n")} `);
}
