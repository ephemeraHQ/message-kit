import {
  agentReply,
  XMTPContext,
  replaceVariables,
  run,
} from "@xmtp/message-kit";
import { downloadPage } from "./plugins/notion.js";
import fs from "fs";
import { Agent } from "@xmtp/message-kit";
setupFiles();

const agent: Agent = {
  name: "Hackathon Store",
  tag: "@store",
  description: "Hackathon Store",
  skills: [],
  onMessage: async (context: XMTPContext) => {
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
  },
};

run(agent);

async function getPrompt() {
  return fs.readFileSync("src/prompt.md", "utf8");
}
async function setupFiles() {
  const page = await downloadPage();
  fs.writeFileSync("src/prompt.md", page);
  console.log("Notion DB updated");
}
