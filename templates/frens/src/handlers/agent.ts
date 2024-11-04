import { HandlerContext } from "@xmtp/message-kit";
import { textGeneration, processMultilineResponse } from "../lib/gpt.js";
import { BITTU, EARL, PEANUT, LILI, GENERAL, KUZCO } from "../prompts/tasks.js";
import fs from "fs";
import path from "path";
import { replaceDeeplinks } from "../lib/bots.js";
import { fileURLToPath } from "url";

let chatHistories: Record<string, any[]> = {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function agentHandler(context: HandlerContext, name: string) {
  if (!process?.env?.OPEN_AI_API_KEY) {
    console.log("No OPEN_AI_API_KEY found in .env");
    return;
  }

  const {
    message: {
      content: { content: userPrompt },
      sender,
    },
    group,
  } = context;
  try {
    const historyKey = `${name}:${sender.address}`;

    //Onboarding
    if (name === "earl" && !group) {
      const onboarded = await onboard(context, name, sender.address);
      if (onboarded) return;
    }

    const { reply, history } = await textGeneration(
      sender?.address,
      userPrompt,
      await getSystemPrompt(name, sender)
    );

    if (!group) chatHistories[historyKey] = history; // Update chat history for the user

    await processMultilineResponse(sender.address, reply, context);
  } catch (error) {
    console.error("Error during OpenAI call:", error);
    await context.send(
      "Oops looks like something went wrong. Please call my creator to fix me."
    );
  }
}

async function getSystemPrompt(name: string, senderAddress: string) {
  //General prompt

  //Personality prompt
  const personality = fs.readFileSync(
    path.resolve(__dirname, `../../src/personalities/${name}.md`),
    "utf8"
  );

  let task = getTasks(name);
  let generalPrompt = replaceValues(GENERAL, name, senderAddress);

  if (name === "earl") {
    const speakers = fs.readFileSync(
      path.resolve(__dirname, "../../src/data/speakers.md"),
      "utf8"
    );

    task = task + "\n\n### Speakers\n\n" + speakers;
  } else if (name === "lili") {
    const thailand = fs.readFileSync(
      path.resolve(__dirname, "../../src/data/thailand.csv"),
      "utf8"
    );
    task = task + "\n\n### Thailand\n\n" + thailand;
  }

  const systemPrompt =
    generalPrompt +
    `\n\n# Personality: You are ${name}\n\n` +
    personality +
    `\n\n# Task\n\n You are ${name}. ${task}`;

  return systemPrompt;
}

function getTasks(name: string) {
  if (name == "bittu") return BITTU;
  if (name == "earl") return EARL;
  if (name == "peanut") return PEANUT;
  if (name == "lili") return LILI;
  if (name == "kuzco") return KUZCO;
}
function replaceValues(generalPrompt: string, name: string, address: string) {
  const bangkokTimezone = "Asia/Bangkok";
  const currentTime = new Date().toLocaleString("en-US", {
    timeZone: bangkokTimezone,
  });

  const time = `Current time in Bangkok: ${currentTime} - ${new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
    }
  )}`;
  generalPrompt = generalPrompt.replace("{NAME}", name);
  generalPrompt = generalPrompt.replace("{TIME}", time);
  generalPrompt = generalPrompt.replace("{ADDRESS}", address);

  //Return with dev addresses for testing
  if (process.env.NODE_ENV !== "production")
    generalPrompt = replaceDeeplinks(generalPrompt);

  return generalPrompt;
}

export async function clearChatHistory(address?: string) {
  console.log("Clearing chat history");
  if (address) chatHistories[address] = [];
  else chatHistories = {};
}

async function onboard(
  context: HandlerContext,
  name: string,
  senderAddress: string
) {
  const { skill } = context;
  if (name === "earl") {
    try {
      const exists = await skill(`/exists`);
      if (exists?.code == 400) {
        clearChatHistory(senderAddress);
        const response2 = await skill("/add");
        console.log("Adding to group", response2);
        // Sleep for 30 seconds
        const groupId = process.env.GROUP_ID;
        if (response2?.code == 200) {
          //onboard message
          context.send(
            `Welcome! I'm Earl, and I'm here to assist you with everything frENSday!\n\nJoin us in our event group chat: https://converse.xyz/group/${groupId}\n\nIf you need any information about the event or our speakers, just ask me. I'm always happy to help!`
          );
          await context.skill(`/subscribe ${senderAddress}`);
          console.log(`User added: ${senderAddress}`);

          setTimeout(() => {
            context.send(
              "psst... by the way, check with Bittu https://converse.xyz/dm/bittu.frens.eth for a exclusive POAP 😉"
            );
          }, 30000); // 30000 milliseconds = 30 seconds

          const sendBittu = await context.skill(`/sendbittu ${senderAddress}`);
          console.log("Send Bittu", sendBittu);
          if (sendBittu?.code == 200) return true;
          else return false;
        }
      }
    } catch (error) {
      console.log("Error adding to group", error);
    }
    return false;
  }
}
