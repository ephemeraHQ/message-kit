import { agentReply, Context, createAgent } from "@xmtp/message-kit";
import { downloadPage } from "./plugins/notion.js";
import fs from "fs";

setupFiles();

export const agent = createAgent({
  name: "Hackathon Store",
  tag: "@store",
  description: "Hackathon Store",
  systemPrompt: fs.existsSync("src/prompt.md")
    ? fs.readFileSync("src/prompt.md", "utf-8")
    : "",

  onMessage: async (context: Context) => {
    const {
      message: {
        content: { skill },
      },
    } = context;

    if (skill === "update") {
      const page = await downloadPage();
      fs.writeFileSync("src/prompt.md", page);
      await context.reply("Notion DB updated");
    }

    await agentReply(context);
  },
}).run();

async function setupFiles() {
  const page = await downloadPage();
  fs.writeFileSync("src/prompt.md", page);
  console.log("Notion DB updated");
}
