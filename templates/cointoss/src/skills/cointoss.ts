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
  {
    skill: "/balance",
    handler: balanceHandler,
    examples: ["/balance"],
    params: {},
    description: "Check your balance.",
  },
  {
    skill: "/fake [amount]",
    handler: fakeFundHandler,
    examples: ["/fake {number} "],
    params: {
      amount: {
        type: "number",
      },
    },
    description:
      "If the user confirms or asks you to check his balance, fake fund his balance.",
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
      `Congratulations! You guessed correctly. It was ${currentGame.randomChoice}. You get to keep your 1 USDC! Your balance is ${agentWallet.checkBalance()} USDC.`,
    );
  } else {
    // Deduct 1 USDC from the user's balance
    const BURNER_ADDRESS = "0x0000000000000000000000000000000000000000";
    agentWallet.transfer(BURNER_ADDRESS, 1);
    await context.send(
      `Sorry, the correct choice was ${currentGame.randomChoice}. Better luck next time! Your balance is ${agentWallet.checkBalance()} USDC.`,
    );
  }
  await context.executeSkill("/guess");
}

async function balanceHandler(context: XMTPContext) {
  const {
    message: { sender },
  } = context;
  const agentWallet = new AgentWallet(sender.address);
  if (agentWallet.checkBalance() < 1) {
    await context.send(
      "Your balance is insufficient for the toss. You need to prefund your wallet.",
    );
    const response = await context.awaitResponse(
      "Please specify the amount of USDC to prefund. Max 10",
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    );
    await context.requestPayment(parseInt(response));
    await context.send(
      "After funding, let me know so i can check your balance.",
    );
    return;
  } else {
    return {
      code: 200,
      message: `Your balance is ${agentWallet.checkBalance()} USDC.`,
    };
  }
}
async function fakeFundHandler(context: XMTPContext) {
  const {
    message: {
      sender,
      content: {
        params: { amount },
      },
    },
  } = context;
  const agentWallet = new AgentWallet(sender.address);
  agentWallet.fakeFunding(amount);
  const balance = agentWallet.checkBalance();
  await context.send(
    `Your balance has been faked funded!. You now have ${balance} USDC.`,
  );
  await context.executeSkill("/guess");
}
