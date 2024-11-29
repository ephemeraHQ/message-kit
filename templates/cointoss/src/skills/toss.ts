import { Skill, XMTPContext, getUserInfo } from "@xmtp/message-kit";
import { getRedisClient } from "../lib/redis.js";
import { AgentWallet } from "../toremove/usdc.js";

export const toss: Skill[] = [
  {
    skill: "/join [tossId] [response]",
    description: "Join a toss.",
    params: {
      tossId: {
        type: "string",
      },
      response: {
        type: "string",
      },
    },
    handler: handleJoinToss,
    examples: ["/join 72 yes", "/join 80 no"],
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
        type: "string",
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
  } = context;

  if (params.description && params.options && !isNaN(Number(params.amount))) {
    //await context.send("one sec...");
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
    await redis.set(
      tossId.toString(),
      JSON.stringify({
        description: params.description,
        options: params.options,
        amount: params.amount,
        admin: judge,
        participants: [],
      }),
    );
    if (tossId !== undefined) {
      await context.send(
        `Here is your toss! 🪙\n\n✨ How it works:\n- The creator of the toss is one who can modify and settle the toss. \n- The pool will be split evenly with the winners. \n- Remember, with great power comes great responsibility 💪\n\n📋 Here are the details:
- Options: ${params.options}
- Amount: ${params.amount}
- Description: ${params.description}
- Judge: ${judgeUsername?.preferredName ?? judge?.address}
- End Time: ${params?.endTime ?? "Not specified (default 24 hours)"}
- Toss ID: ${tossId}
\n🛠️ Commands:
- @toss join <tossId>
- @toss end <tossId> <option>

You can also interact by replying to this message in natural language.
- @toss join
- @toss end <option>`,
      );
    } else {
      await context.send(
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
  } = context;

  if (!response) {
    await context.reply("Please specify your response.");
    return;
  } else if (!tossId) {
    await context.reply("Please specify the toss ID.");
    return;
  }

  const redis = await getRedisClient();
  const tossDataString = await redis.get(tossId);
  const tossData = tossDataString ? JSON.parse(tossDataString) : null;

  if (!tossData) {
    await context.reply("Toss not found");
    return;
  }

  // Check if the participant has already joined
  if (
    tossData.participants.some(
      (p: { address: string }) => p.address === sender.address,
    )
  ) {
    await context.reply("You have already joined this toss.");
    return;
  }

  const agentWallet = new AgentWallet(sender.address);
  const { usdc, eth } = await agentWallet.checkBalances();

  if (usdc < BigInt(tossData.amount)) {
    await context.reply(
      "You don't have enough USDC to join the toss. You can fund your account here:",
    );
    await context.requestPayment(
      tossData.amount,
      "USDC",
      agentWallet.agentAddress,
    );
    await context.reply("After funding, please try again.");
    return;
  } else {
    await agentWallet.transferUsdc(tossData.admin, tossData.amount);
    await context.reply("Funds transferred successfully");

    // Add participant and their response to the array
    tossData.participants.push({ address: sender.address, response });
    await redis.set(tossId, JSON.stringify(tossData));
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
  const redis = await getRedisClient();
  const tossDataString = await redis.get(tossId);
  const tossData = tossDataString ? JSON.parse(tossDataString) : null;
  const agentWallet = new AgentWallet(sender.address);
  if (!tossData) {
    await context.reply("Toss not found");
    return;
  }

  // Check if the sender is the admin of the toss
  if (tossData.admin !== sender.address) {
    await context.reply("Only the admin can end the toss.");
    return;
  }

  let optsArray: string[];
  if (typeof tossData.options === "string") {
    optsArray = tossData.options.split(",");
  } else {
    optsArray = tossData.options;
  }

  if (!optsArray.includes(option.toLowerCase())) {
    await context.reply("Invalid option selected.");
    return;
  }

  // Logic to distribute the pool among winners
  const winners = tossData.participants.filter(
    (participant: { response: string; address: string }) => {
      if (participant.response === option) {
        return participant.address;
      }
    },
  );

  if (winners.length > 0) {
    const amountPerWinner = BigInt(tossData.amount) / BigInt(winners.length);
    for (const winner of winners) {
      // Transfer the amount to each winner
      // Assume transferUsdc is a function to transfer USDC
      console.log("transferring", winner.address, amountPerWinner);
      //await agentWallet.transferUsdc(winner.address, Number(amountPerWinner));
    }
    await context.reply(
      `Toss ended. Winners have been rewarded.\nWinners: ${winners.map(
        async (winner: { address: string }) =>
          (await context.getUserInfo(winner.address))?.preferredName ??
          winner.address,
      )}\nAmount per winner: ${amountPerWinner}\nLosers: ${tossData.participants
        .filter(
          (participant: { response: string; address: string }) =>
            participant.response !== option,
        )
        .map(
          async (loser: { address: string }) =>
            (await context.getUserInfo(loser.address))?.preferredName ??
            loser.address,
        )}`,
    );
  } else {
    await context.reply("No winners for this toss.");
  }

  // await redis.set(tossId, JSON.stringify({ ...tossData, closed: true }));
  await context.reply("Toss has been closed.");
}
