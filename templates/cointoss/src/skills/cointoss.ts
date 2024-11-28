import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
import { AgentWallet } from "../lib/usdc.js";

let currentGame = {
  randomChoice: Math.random() < 0.5 ? "heads" : "tails",
};

export const guessToss: Skill[] = [
  {
    skill: "/guess [choice]",
    handler: handler,
    examples: ["/guess heads", "/guess tails"],
    description: "Guess 'heads' or 'tails'. Toss is 1 USDC.",
    params: {
      choice: {
        type: "string",
        values: ["heads", "tails", ""],
      },
    },
  },
];

async function handler(context: XMTPContext) {
  const {
    message: {
      sender,
      content: {
        params: { choice },
      },
    },
  } = context;
  if (!choice) {
    await context.send("Lets do a toss. Guess heads or tails.");
    return;
  }
  // This will be directly in the context of messagekit
  const agentWallet = new AgentWallet(sender.address);

  // Check if the guess is correct
  if (choice === currentGame.randomChoice) {
    // Reset the game for the next round
    currentGame.randomChoice = Math.random() < 0.5 ? "heads" : "tails";

    await context.send(
      `Congratulations! You guessed correctly. It was ${currentGame.randomChoice}. You get to keep your 1 USDC! Your balance is ${agentWallet.checkUsdcBalance()} USDC.`,
    );
  } else {
    // Deduct 1 USDC from the user's balance
    const BURNER_ADDRESS = "0x0000000000000000000000000000000000000000";
    agentWallet.transferUsdc(BURNER_ADDRESS, 1);
    await context.send(
      `Sorry, the correct choice was ${currentGame.randomChoice}. Better luck next time! Your balance is ${agentWallet.checkUsdcBalance()} USDC.`,
    );
  }
  await context.executeSkill("/guess");
}
