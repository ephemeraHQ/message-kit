import {
  agentReply,
  XMTPContext,
  replaceVariables,
  run,
} from "@xmtp/message-kit";
import { downloadPage } from "./plugins/notion.js";
import fs from "fs";

setupFiles();

run(async (context: XMTPContext) => {
  const {
    message: {
      sender,
      content: { skill },
    },
    agent,
  } = context;

  if (skill === "update") {
    const page = await downloadPage();
    fs.writeFileSync("src/prompt.md", page);
    await context.reply("Notion DB updated");
  }

  let systemPrompt = await getPrompt();
  let prompt = await replaceVariables(systemPrompt, sender.address, agent);
  await agentReply(context, prompt);
});

async function getPrompt() {
  return fs.readFileSync("src/prompt.md", "utf8");
}
async function setupFiles() {
  const page = await downloadPage();
  fs.writeFileSync("src/prompt.md", page);
  console.log("Notion DB updated");
}
