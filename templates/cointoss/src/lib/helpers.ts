import { XMTPContext } from "@xmtp/message-kit";
import { getTossDBClient } from "./redis.js";

export interface TossData {
  groupId: string;
  admin: string;
  options: string;
  tossId: string;
  amount: number;
  endTime: Date;
  prize: number;
  pool: number;
  description: string;
  participants: { address: string; response: string; name: string }[];
}
const tossDBClient = await getTossDBClient();
export async function checkTossCorrect(
  context: XMTPContext,
): Promise<TossData | undefined> {
  const {
    message: {
      sender,
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
  if (!tossId) {
    await context.reply("Invalid toss ID.");
    return undefined;
  }
  const tossDataString = await tossDBClient.get(tossId.toString());
  const tossData = tossDataString ? JSON.parse(tossDataString) : null;

  if (!tossData) {
    await context.reply("Toss not found");
    return undefined;
  } else if (tossData.groupId !== group.id) {
    await context.reply("This toss is not in this group.");
    return undefined;
  } else if (
    tossData.participants.some(
      (p: { address: string }) => p.address === sender.address,
    )
  ) {
    // Check if the participant has already joined
    await context.reply("You have already joined this toss.");
    return;
  }
  tossData.tossId = tossId;

  let participants = await Promise.all(
    tossData.participants.map(
      async (participant: { address: string; response: string }) => ({
        name:
          (await context.getUserInfo(participant.address))?.preferredName ??
          participant.address,
        address: participant.address,
        response: participant.response,
      }),
    ),
  );

  const pool = tossData.amount * participants.length;
  return { ...tossData, participants, pool };
}

export function extractTossId(message: string): string | null {
  const match = message.match(/ID:\s*(\d+)/);
  return match ? match[1] : null;
}

export async function extractWinners(
  participants: { address: string; name: string; response: string }[],
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
