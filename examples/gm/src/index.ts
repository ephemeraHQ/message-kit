import { run, HandlerContext, xmtpClient } from "@xmtp/message-kit";

const appConfig_BITTU = {
  privateKey: process.env.KEY_BITTU,
  name: "bittu",
};

const { v2client: bittu, client: bittu3 } = await xmtpClient({privateKey:appConfig_BITTU);

run(async (context: HandlerContext) => {
  await context.send(`gm`);

  const { address } = params;

  await bittu3.conversations?.sync();
  const conversations = await bittu.conversations.list();
  let targetConversation = conversations.find(
    (conv) => conv.peerAddress.toLowerCase() === address.toLowerCase(),
  );

  if (!targetConversation) {
    targetConversation = await bittu.conversations.newConversation(
      address.toLowerCase(),
    );
  }

  // Send the message only once per receiver
  const msg = await targetConversation.send("Here is your POAP");
});
