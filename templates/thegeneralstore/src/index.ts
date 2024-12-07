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
    message: { sender },
    agent,
  } = context;
  let systemPrompt = await getPrompt();
  let prompt = await replaceVariables(systemPrompt, sender.address, agent);
  await agentReply(context, prompt);
});

async function getPrompt() {
  if (fs.existsSync(".data/prompt.md"))
    return fs.readFileSync(".data/prompt.md", "utf8");
  else return fs.readFileSync("src/prompt.md", "utf8");
}
async function setupFiles() {
  if (!fs.existsSync(".data/db.json")) {
    const dbfile = fs.readFileSync("src/data/db.json", "utf8");
    fs.writeFileSync(".data/db.json", dbfile);
    console.log("DB file created");
  }

  const page = await downloadPage();
  fs.writeFileSync("src/prompt.md", page);
  console.log("Notion DB updated");
}
