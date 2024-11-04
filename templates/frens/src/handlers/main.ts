import { HandlerContext, Config } from "@xmtp/message-kit";
import { agentHandler } from "./agent.js";
import { run } from "@xmtp/message-kit";
import { startCron } from "../lib/cron.js";
import { xmtpClient } from "@xmtp/message-kit";
import { isBot, BotAddress } from "../lib/bots.js";
import { clearChatHistory } from "./agent.js";

const { v2client: earl } = await xmtpClient({
  privateKey: process.env.KEY_EARL,
  hideInitLogMessage: true,
});
startCron(earl);

export async function mainHandler(appConfig: BotAddress) {
  //@ts-ignore
  const { name } = appConfig;
  run(
    async (context: HandlerContext) => {
      const {
        message: {
          content: { content: text },
          typeId,
          sender,
        },
        group,
        members,
        skills,
      } = context;
      if (isBot(sender.address)) return;
      if (typeId === "group_updated" && name == "bittu") {
        const { addedInboxes } = context.message.content;
        if (addedInboxes.length === 1) {
          const addedMember = await members?.find(
            (member: any) => member.inboxId === addedInboxes[0]?.inboxId,
          );
          if (addedMember) {
            group.send(
              "Welcome to the group!" +
                addedMember?.address.slice(0, 4) +
                "...",
            );
          }
        }

        return;
      }
      //Disable for groups
      if (group) {
        context.reply("Sorry i dont work inside groups 🙈");
        return;
      }
      if (typeId !== "text") return;
      const lowerContent = text?.toLowerCase();

      if (lowerContent.startsWith("/reset")) {
        clearChatHistory();
        context.send("Resetting chat history");
        //remove from group
        const response = await context.skill("/remove");
        if (response && response.message) context.send(response.message);
        const response2 = await context.skill("/unsubscribe");
        if (response2 && response2.message) context.send(response2.message);

        const response3 = await context.skill(`/removepoap ${sender.address}`);
        if (response3 && response3.message) context.send(response3.message);

        return;
      }
      await agentHandler(context, name);
    },
    { ...appConfig },
  );
}
