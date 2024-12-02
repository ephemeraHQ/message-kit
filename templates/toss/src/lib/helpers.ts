import { XMTPContext, WalletService } from "@xmtp/message-kit";
import { getRedisClient } from "./redis.js";

const tossDBClient = await getRedisClient();

export interface TossData {
  groupId: string;
  adminName: string;
  adminAddress: string;
  options: string;
  tossId: string;
  amount: number;
  createdAt: string;
  endTime: string;
  description: string;
  participants: string[];
  decryptedParticipants?: {
    response: string;
    name: string;
    address: string;
  }[];
  tossWalletAddress: string;
}
export async function checkTossCorrect(
  context: XMTPContext,
): Promise<TossData | undefined> {
  const {
    message: {
      content: { previousMsg },
    },
    group,
  } = context;
  if (!group) {
    await context.reply("This command can only be used in a group.");
    return undefined;
  } else if (!previousMsg) {
    await context.reply("You must reply to a toss.");
    return undefined;
  }

  let tossId = extractTossId(previousMsg);
  let creatorAddress = extractCreatorAddress(previousMsg);
  if (!tossId || !creatorAddress) {
    await context.reply("Invalid toss ID.");
    return undefined;
  }
  let encryptedKey = WalletService.encrypt(tossId, group.id + creatorAddress);
  const tossDataString = await tossDBClient.get(`toss:${encryptedKey}`);
  const hexString = tossDataString?.replace(/"/g, "");
  let tossData = hexString
    ? WalletService.decrypt(hexString, group.id + creatorAddress)
    : null;

  if (typeof tossData === "string") {
    tossData = JSON.parse(tossData);
  }
  if (!tossData) {
    await context.reply("Toss not found");
    return undefined;
  } else if (tossData.status === "closed") {
    await context.reply("Toss has already ended.");
    return undefined;
  } else if (tossData.groupId !== group.id) {
    await context.reply("This toss is not in this group.");
    return undefined;
  }
  tossData.decryptedParticipants = tossData.participants?.map((p: string) =>
    WalletService.decrypt(p, group.id + tossData.adminAddress),
  );

  const pool = tossData.amount * (tossData?.decryptedParticipants?.length || 0);
  return { ...tossData, pool };
}

export function extractTossId(message: string): string | null {
  try {
    const match = message.match(/ID:\s*(\d+)/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

export function extractCreatorAddress(message: string): string | null {
  const match = message.match(/Creator:\s*(\w+)/);
  return match ? match[1] : null;
}

export async function extractWinners(
  participants: { response: string; name: string; address: string }[],
  option: string,
): Promise<{
  winners: { name: string; address: string }[];
  losers: { name: string; address: string }[];
}> {
  let winners: { name: string; address: string }[] = [];
  let losers: { name: string; address: string }[] = [];

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
  return `Here is your toss! 🪙\n\n✨ How it works:\n- The creator of the toss is one who can modify and settle the toss. \n- The pool will be split evenly with the winners. \n- Remember, with great power comes great responsibility 💪\n\n📋 Here are the details:
- ID: ${tossData.tossId}
- Creator: ${tossData.adminAddress}
- Options: ${tossData.options}
- Amount: ${tossData.amount}
- Description: ${tossData.description}
- Judge: ${tossData.adminName}
- Ends on: ${tossData.endTime}
- Toss Wallet: ${tossData.tossWalletAddress}
\n🛠️ Reply with:
@toss <option>
@toss end <option> (only the judge can end the toss)
@toss cancel (only the creator can cancel the toss)
@toss status`;
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
  return `Here are the details:
- Amount: ${tossData.amount}
- Description: ${tossData.description}
- Judge: ${tossData.adminName}
- End Time: ${tossData.endTime}

📊 Status:
👥 Participants:\n${tossData.decryptedParticipants
    ?.map(
      (participant: any) =>
        `- ${participant.name ?? participant.address} - ${participant.response}\n`,
    )
    .join("")}
💵 Amount: $${tossData.amount}
🏦 Pool: $${(tossData?.decryptedParticipants?.length || 0) * tossData.amount}
📋 Options:
${tossData.options
  .split(",")
  .map((option: string) => {
    const voteCount = tossData.decryptedParticipants?.filter(
      (participant: any) =>
        participant.response.toLowerCase() === option.toLowerCase(),
    ).length;
    return `\t- ${option}: ${voteCount} votes`;
  })
  .join("\n")} `;
}
