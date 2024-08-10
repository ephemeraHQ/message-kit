import { HandlerContext } from "@xmtp/message-kit";

export async function handler(context: HandlerContext) {
  const intro =
    "Decentralized secure messaging. Built for crypto.\n" +
    "Welcome to the Apps Directory\n\n" +
    "- 🚀 trendingmints.eth : Subscribe to get real-time trending mints on Base\n\n\n" +
    "- 💧 faucetbot.eth : Delivers Faucet funds to devs on Testnet\n\n\n" +
    "- 📅 dailywordle.eth : Play daily to the WORDLE game through messaging.\n\n\n" +
    "- 🪨 mintframe - 0xB7d51dD8331551D2FA0d185F8Ba08DcCd71499aD : Turn a Zora url into a mint frame.\n\n\n" +
    "- 🎰 betbot - 0x3c4784a8dcc73ac41bd8bf7a118e68e01e2aa0bb : Create bets with your friends.\n\n\n" +
    "To learn how to build your own app, visit MessageKit: https://message-kit.vercel.app/\n\n" +
    "To publish your app, visit Directory: https://message-kit.vercel.app/directory\n\n" +
    "You are currently inside Message Kit Group Starter. You can type /help command to see available commands and /apps to trigger the directory.";

  context.send(intro);
  return;
}
