import { Skill, XMTPContext, getUserInfo } from "@xmtp/message-kit";
import { getRedisClient } from "../lib/redis.js";
import { WalletService } from "../lib/wallet.js";

export const toss: Skill[] = [
  {
    skill: "/join [tossId] [response]",
    description: "Join a toss.",
    params: {
      tossId: {
        type: "number",
      },
      response: {
        type: "string",
      },
    },
    handler: handleJoinToss,
    examples: ["/join {number} yes", "/join {number} no"],
  },
  {
    skill: "/status [tossId]",
    description: "Check the status of the toss.",
    handler: handleTossStatus,
    examples: ["/status 1"],
    params: {
      tossId: {
        type: "number",
      },
    },
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
  {
    skill: "/end [tossId] [option]",
    description: "End a toss.",
    handler: handleEndToss,
    examples: ["/end 72 yes", "/end 72 No", "/end 81 yes"],
    params: {
      tossId: {
        type: "number",
      },
      option: {
        type: "string",
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
    let judge = params.judge ?? sender.address;
    if (params.judge) {
      judge = await getUserInfo(params.judge);
    }
    let judgeUsername = await context.getUserInfo(
      judge?.address ?? sender.address,
    );
    const redis = await getRedisClient();
    const keys = await redis.keys("*");
    let tossId = keys.length + 1;
    const tossWallet = await WalletService.createTossWallet(tossId.toString());

    await redis.set(
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
\n🛠️ Commands:
- @toss join <tossId>
- @toss end <tossId> <option> (only the judge can end the toss)
- @toss status <tossId>`,
      );
    } else {
      await context.reply(
        `An error occurred while creating the toss. ${JSON.stringify(tossId)}`,
      );
    }
  }
}

export async function handleJoinToss(context: XMTPContext) {
  const {
    message: {
      sender,
      content: {
        params: { tossId, response },
      },
    },
    group,
  } = context;
  if (!group) {
    await context.reply("This command can only be used in a group.");
    return;
  } else if (!response) {
    await context.reply("Please specify your response.");
    return;
  } else if (!tossId) {
    await context.reply("Please specify the toss ID.");
    return;
  }

  const redis = await getRedisClient();
  const tossDataString = await redis.get(tossId.toString());
  const tossData = tossDataString ? JSON.parse(tossDataString) : null;

  if (!tossData) {
    await context.reply("Toss not found");
    return;
  } else if (tossData.groupId !== group.id) {
    await context.reply("This toss is not in this group.");
    return;
  } else if (
    tossData.participants.some(
      (p: { address: string }) => p.address === sender.address,
    )
  ) {
    // Check if the participant has already joined
    await context.reply("You have already joined this toss.");
    return;
  }

  const userWallet = await WalletService.getUserWallet(sender.address);
  const tossWallet = await WalletService.getTossWallet(tossId.toString());

  if (!tossWallet) {
    await context.reply("Toss not found or expired");
    return;
  }

  const balance = await WalletService.checkBalance(userWallet);
  const userWalletAddress = await WalletService.getWalletAddress(userWallet);

  if (balance < tossData.amount) {
    await context.reply(
      "You don't have enough USDC to join the toss. You can fund your account here:",
    );
    await context.requestPayment(
      tossData.amount,
      "USDC",
      userWalletAddress.id,
    );
    await context.reply("After funding, please try again.");
    return;
  }

  try {
    await WalletService.transfer(userWallet, tossWallet, tossData.amount);
    
    // Add participant and their response to the array
    tossData.participants.push({ address: sender.address, response });
    await redis.set(tossId.toString(), JSON.stringify(tossData));
    
    await context.reply("Successfully joined the toss!");
  } catch (error) {
    console.error(error);
    await context.reply("Failed to process your entry. Please try again.");
  }
}

export async function handleEndToss(context: XMTPContext) {
  const {
    message: {
      sender,
      content: {
        params: { tossId, option },
      },
    },
  } = context;
  if (!tossId) {
    await context.reply("Please specify the toss ID.");
    return;
  } else if (!option) {
    await context.reply("Please specify the option.");
    return;
  }
  const redis = await getRedisClient();
  const tossDataString = await redis.get(tossId.toString());
  const tossData = tossDataString ? JSON.parse(tossDataString) : null;
  if (!tossData) {
    await context.reply("Toss not found");
    return;
  }

  // Check if the sender is the admin of the toss
  if (tossData.admin.toLowerCase() !== sender.address.toLowerCase()) {
    await context.reply("Only the admin can end the toss.");
    return;
  }

  let optArray = tossData.options.split(",");
  if (!optArray.includes(option.toLowerCase())) {
    await context.reply("Invalid option selected.");
    return;
  }

  // Calculate winners and prize amounts
  let winners = tossData.participants.filter(
    (p: { response: string }) =>
      p.response.toLowerCase() === option.toLowerCase(),
  );

  const prize = tossData.amount * tossData.participants.length / winners.length;

  // Distribute prizes
  for (const winner of winners) {
    try {
      const winnerWallet = await WalletService.getUserWallet(winner.address);
      const tossWallet = await WalletService.getTossWallet(tossId.toString());
      
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
  await WalletService.deleteTossWallet(tossId.toString());
  tossData.closed = true;
  await redis.set(tossId.toString(), JSON.stringify(tossData));

  let participants = await Promise.all(
    tossData.participants.map(
      async (participant: { address: string }) =>
        (await context.getUserInfo(participant.address))?.preferredName ??
        participant.address,
    ),
  );

  if (winners.length > 0) {
    await context.reply(
      `🏆 Winners have been rewarded! 🏆\n\n🎉 Winners: \n${winners
        .map(
          (winner: { name: string; address: string }) =>
            `- ${winner.name} - $${prize} 💰\n`,
        )
        .join("")}
😢 Losers: \n${participants
        .map((participant: string) => `- ${participant} 😢\n`)
        .join("")}
The pool has been distributed among the winners. The toss has been closed now.`,
    );
  } else {
    await context.reply("No winners for this toss.");
  }
}

export async function handleTossStatus(context: XMTPContext) {
  const {
    message: {
      sender,
      content: {
        params: { tossId },
      },
    },
    group,
  } = context;
  if (!group) {
    await context.reply("This command can only be used in a group.");
    return;
  }

  const redis = await getRedisClient();
  const tossDataString = await redis.get(tossId.toString());
  const tossData = tossDataString ? JSON.parse(tossDataString) : null;

  if (!tossData) {
    await context.reply("Toss not found");
    return;
  } else if (tossData.groupId !== group.id) {
    await context.reply("This toss is not in this group.");
    return;
  }

  let participants = await Promise.all(
    tossData.participants.map(
      async (participant: { address: string }) =>
        (await context.getUserInfo(participant.address))?.preferredName ??
        participant.address,
    ),
  );
  let optArray = tossData.options.split(",");
  const amount = tossData.amount;
  const pool = amount * tossData.participants.length;
  await context.reply(`Here are the details:
- Amount: ${amount}
- Description: ${tossData.description}
- Judge: ${
    (await context.getUserInfo(tossData.admin))?.preferredName ?? tossData.admin
  }
- End Time: ${tossData.endTime ?? "24 hours"}

📊 Status:
👥 Participants:\n${participants
    .map((participant: string) => `\t- ${participant}\n`)
    .join("")}
💵 Amount: $${amount}
🏦 Pool: $${pool}
📋 Options:
${optArray
  .map((option: string) => {
    const voteCount = tossData.participants.filter(
      (participant: { response: string }) =>
        participant.response.toLowerCase() === option.toLowerCase(),
    ).length;
    return `\t- ${option}: ${voteCount} votes`;
  })
  .join("\n")} `);
}
