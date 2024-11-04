import cron from "node-cron";
import { Client } from "@xmtp/xmtp-js";
import { db } from "./db.js";
import { fetchSpeakers } from "./eventapi.js";
import fs from "fs/promises";
import { textGeneration } from "./gpt.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPEAKERS_FILE_PATH = path.resolve(
  __dirname,
  "../../src/data/speakers.md"
);

async function saveSpeakersToFile() {
  const speakerInfo = await fetchSpeakers();
  const formattedSpeakerInfo = speakerInfo.replace(/\n/g, "\n\n");
  await fs.writeFile(SPEAKERS_FILE_PATH, formattedSpeakerInfo);
}

export async function startCron(v2client: Client) {
  const conversations = await v2client.conversations.list();
  // Ensure speakers file exists or create it for the first time
  try {
    await fs.access(SPEAKERS_FILE_PATH);
  } catch (error) {
    console.log("Speakers file doesn't exist. Creating it for the first time.");
    await saveSpeakersToFile();
  }
  cron.schedule("*/10 * * * *", async () => {
    console.log("Fetching and saving speakers");
    await saveSpeakersToFile();
  });
  await db.read();
  const subscribers = db?.data?.subscribers;
  console.log(
    `   - Cron job started to fetch speakers every 10 minutes\n   - Earl will send updates to ${subscribers?.length} subscribers every 2 days`
  );

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Logging new messages to console ↴`);
  // Cron job to send updates once a day at midnight UTC
  cron.schedule(
    "0 0 */2 * *", // Every 2 days at midnight UTC
    async () => {
      await db.read();
      const subscribers = db?.data?.subscribers;

      console.log(`Running task. ${subscribers?.length} subscribers.`);
      for (const subscriber of subscribers) {
        const subscriptionStatus = subscriber.status;
        if (subscriptionStatus === "subscribed") {
          const targetConversation = conversations.find(
            (conv) => conv.peerAddress === subscriber.address
          );
          if (targetConversation) {
            const announcement = await generateAnnouncement(subscriber.address);
            await targetConversation.send(announcement);
            await targetConversation.send(
              "If you need any information about the event or our speakers, just ask me. I'm always happy to help!"
            );
            await targetConversation.send(
              "To unsubscribe, just tell me to stop."
            );
          }
        }
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );
}

export async function generateAnnouncement(senderAddress: string) {
  const speakers = await fs.readFile(SPEAKERS_FILE_PATH, "utf-8");
  const systemPrompt = `
  You are Earl, a helpful assistant that generates announcements for the event.
  - Keep it simple and super short. Only 1 paragraph or 1 sentence.  
  - Do not make guesses or assumptions
  - For a exclusive POAP go to Bittu https://converse.xyz/dm/bittu.frens.eth 
  - For playing games to Peanut https://converse.xyz/dm/peanut.frens.eth
  - For all about ENS domains go to Kuzco https://converse.xyz/dm/kuzco.frens.eth
  - And for all about Bangkok side events go to Lili https://converse.xyz/dm/lili.frens.eth
  - You will be sending once a day so keep it really random in terms of what you share. 
  `;
  const userPrompt = `Based on the following list of speakers, generate an announcement for the event:
  ${speakers}
  `;
  const { reply } = await textGeneration(
    senderAddress,
    userPrompt,
    systemPrompt
  );

  return reply;
}
