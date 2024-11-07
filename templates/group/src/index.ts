import { run, HandlerContext } from "@xmtp/message-kit";

// Main function to run the app
run(async (context: HandlerContext) => {
  const {
    message: { typeId },
    group,
  } = context;
  switch (typeId) {
    case "reply":
      handleReply(context);
      break;
  }
  if (!group) {
    context.send("This is a group bot, add this address to a group");
  }
});
async function handleReply(context: HandlerContext) {
  const {
    v2client,
    getReplyChain,
    version,
    message: {
      content: { reference },
    },
  } = context;

  const { chain, isSenderInChain } = await getReplyChain(
    reference,
    version,
    v2client.address,
  );
  //await context.skill(chain);
}
