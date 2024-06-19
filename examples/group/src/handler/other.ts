import { MlsHandlerContext as HandlerContext } from "@xmtp/message-kit";
import { commands } from "../commands.js"; // Assuming commands.ts is in the same directory

export async function handler(context: HandlerContext) {
  const { content } = context.message;
  const { content: command } = content;
  switch (command.trim().replace("/", "")) {
    case "tx":
      context.reply("Send 1 ETH tx:0xf0490b45884803924Ca84C2051ef435991D7350D");
      break;
    case "dm":
      context.reply("dm:/0x1CB3649469546D10b7fa4fd1d1c63e8aA3a0E667");
      break;
    case "help":
      const intro =
        "Available experiences:\n" +
        commands
          .flatMap((app: any) => app.commands)
          .map((command: any) => `${command.command} - ${command.description}`)
          .join("\n") +
        "\nUse these commands to interact with specific apps.";
      context.reply(intro);
      break;
    default:
      context.reply("Command not found. Use /help to see available commands.");
      break;
  }
}
