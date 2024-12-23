import { Context } from "@xmtp/message-kit";
import { getRedisClient } from "./redis.js";

interface Participant {
  response: string;
  name: string;
  address: string;
}
export interface TossData {
  group_id: string;
  admin_name: string;
  admin_address: string;
  creator_address: string;
  options: string;
  toss_id: string;
  amount: number;
  created_at: string;
  end_time: string;
  description: string;
  participants: Participant[];
}
export async function checkTossCorrect(
  context: Context,
): Promise<TossData | undefined> {
  const {
    message: {
      content: { previousMsg },
    },
    group,
  } = context;

  if (!group) {
    await context.send({
      message: "This command can only be used in a group.",
      originalMessage: context.message,
      typeId: "reply",
    });
    return undefined;
  } else if (!previousMsg) {
    await context.send({
      message: "You must reply to a toss.",
      originalMessage: context.message,
      typeId: "reply",
    });
    return undefined;
  }

  let toss_id = extractTossId(previousMsg);
  if (!toss_id) {
    await context.send({
      message: "Invalid toss ID. Be sure you are replying to a original toss.",
      originalMessage: context.message,
      typeId: "reply",
    });
    return undefined;
  }
  const tossDBClient = await getRedisClient();
  const tossDataString = await tossDBClient.get(`toss:${toss_id}`);
  let tossData = tossDataString ? JSON.parse(tossDataString) : undefined;

  if (typeof tossData === "string") {
    tossData = JSON.parse(tossData) as TossData;
  }

  if (!tossData) {
    await context.send({
      message: "Toss not found",
      originalMessage: context.message,
      typeId: "reply",
    });
    return undefined;
  } else if (tossData.status === "closed") {
    await context.send({
      message: "Toss has already ended.",
      originalMessage: context.message,
      typeId: "reply",
    });
    return undefined;
  } else if (tossData.group_id.toLowerCase() !== group.id.toLowerCase()) {
    await context.send({
      message: "This toss is not in this group.",
      originalMessage: context.message,
      typeId: "reply",
    });
    return undefined;
  }

  return { ...tossData, toss_id };
}

export function extractTossId(message: string): string | undefined {
  try {
    const match = message.match(/ID:\s*(\d+)/);
    return match ? match[1].toString() : undefined;
  } catch (error) {
    return undefined;
  }
}

export async function extractWinners(
  participants: Participant[],
  option: string,
): Promise<{
  winners: Participant[];
  losers: Participant[];
}> {
  let winners: Participant[] = [];
  let losers: Participant[] = [];

  await Promise.all(
    participants.map(async (participant) => {
      if (participant.response.toLowerCase() === option.toLowerCase()) {
        winners.push(participant);
      } else {
        losers.push(participant);
      }
    }),
  );
  return { winners, losers };
}

export function generateTossMessage(tossData: TossData): string {
  return `Here is your toss!\n
🪙  ${tossData.description.toUpperCase()}? - ${tossData.options.toUpperCase()} - $${tossData.amount}\n
- ID: ${tossData.toss_id}
- Judge: ${tossData.admin_name}
- Ends on: ${tossData.end_time}

How to toss:\n- The creator of the toss is one who can end or settle the toss. \n- The pool will be split evenly with the winners. \n- Remember, with great power comes great responsibility 💪

\n🛠️ Reply with:
@toss <option>
@toss end <option> - only the judge can end the toss
@toss cancel - only the creator can cancel the toss
@toss status - check the status of the toss
@toss help - for managing your toss via DMs`;
}

export function generateEndTossMessage(
  winners: { name: string; address: string }[],
  losers: { name: string; address: string }[],
  prize: number,
): string {
  if (!winners.length) {
    return `The toss has been closed and no winners were found.`;
  }
  let message = `🏆 Winners have been rewarded! 🏆\n\n🎉 Winners: \n${winners
    .map((winner) => `- ${winner.name} - $${prize} 💰\n`)
    .join("")}`;
  if (losers.length > 0) {
    message += `\n😢 Losers: \n${losers
      .map((loser) => `- ${loser.name} 😢\n`)
      .join("")}`;
  }
  return (
    message +
    `\nThe pool has been distributed among the winners. The toss has been closed now.`
  );
}

export async function generateTossStatusMessage(
  tossData: TossData,
): Promise<string> {
  const participants = tossData.participants;
  return `Here are the details:
- Amount: $${tossData.amount}
- Description: ${tossData.description}
- Judge: ${tossData.admin_name}
- End Time: ${tossData.end_time}

📊 Status:
    👥 Participants:\n${participants
      ?.map(
        (participant: any) =>
          `- ${participant.name ?? participant.address} - ${participant.response}\n`,
      )
      .join("")}
🏦 Pool: $${(tossData?.participants?.length || 0) * tossData.amount}
📋 Options:
${tossData.options
  .split(",")
  .map((option: string) => {
    const voteCount = participants?.filter(
      (participant: any) =>
        participant.response.toLowerCase() === option.toLowerCase(),
    ).length;
    return `\t- ${option}: ${voteCount} votes`;
  })
  .join("\n")} `;
}

export const DM_HELP_MESSAGE = `Welcome to @toss! I'm your friendly neighbourhood toss bot.
/fund [amount] - You can fund your account with 
/balance - Check your balance
/withdraw [amount] - You can withdraw funds to your wallet
/create - Create an agent wallet
/help - Get help with tossing`;
