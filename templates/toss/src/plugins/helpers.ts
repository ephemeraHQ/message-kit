import { XMTPContext } from "@xmtp/message-kit";
import { getRedisClient } from "./redis.js";

const tossDBClient = await getRedisClient();
interface Participant {
  response: string;
  name: string;
  address: string;
  agent_address: string;
}
export interface TossData {
  group_id: string;
  admin_name: string;
  admin_address: string;
  options: string;
  toss_id: string;
  amount: number;
  created_at: string;
  end_time: string;
  description: string;
  encrypted_participants: string[];
  participants?: Participant[];
  toss_wallet_address: string;
}
export async function checkTossCorrect(
  context: XMTPContext,
): Promise<TossData | undefined> {
  const {
    message: {
      content: { previousMsg },
    },
    walletService,
    group,
  } = context;
  if (!group) {
    await context.reply("This command can only be used in a group.");
    return undefined;
  } else if (!previousMsg) {
    await context.reply("You must reply to a toss.");
    return undefined;
  }

  let toss_id = extractTossId(previousMsg);
  if (!toss_id) {
    await context.reply(
      "Invalid toss ID. Be sure you are replying to a original toss.",
    );
    return undefined;
  }
  let encryptedKey = walletService.encrypt(toss_id);
  const tossDataString = await tossDBClient.get(`toss:${encryptedKey}`);
  const hexString = tossDataString?.replace(/"/g, "");
  let tossData = hexString ? walletService.decrypt(hexString) : null;

  if (typeof tossData === "string") {
    tossData = JSON.parse(tossData) as TossData;
  }
  console.log("tossData", tossData);
  if (!tossData) {
    await context.reply("Toss not found");
    return undefined;
  } else if (tossData.status === "closed") {
    await context.reply("Toss has already ended.");
    return undefined;
  } else if (tossData.group_id.toLowerCase() !== group.id.toLowerCase()) {
    await context.reply("This toss is not in this group.");
    return undefined;
  }
  tossData.participants = [];
  if (tossData.encrypted_participants?.length) {
    tossData.participants = tossData.encrypted_participants?.map((p: string) =>
      walletService.decrypt(p),
    );
  }
  const pool = tossData.amount * (tossData?.participants?.length || 0);
  return { ...tossData, toss_id, pool };
}

export function extractTossId(message: string): string | null {
  try {
    const match = message.match(/ID:\s*(\d+)/);
    return match ? match[1].toString() : null;
  } catch (error) {
    return null;
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
