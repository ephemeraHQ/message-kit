import { getUserInfo, XMTPContext } from "@xmtp/message-kit";

export async function handlePay(context: XMTPContext) {
  const {
    message: {
      content: { params },
    },
  } = context;
  const txpayUrl = "https://txpay.vercel.app";

  const { amount: amountSend, token: tokenSend, username } = params;
  let senderInfo = await getUserInfo(username);
  if (!amountSend || !tokenSend || !senderInfo) {
    context.reply(
      "Missing required parameters. Please provide amount, token, and username.",
    );
    return {
      code: 400,
      message:
        "Missing required parameters. Please provide amount, token, and username.",
    };
  }

  let sendUrl = `${txpayUrl}/?&amount=${amountSend}&token=${tokenSend}&receiver=${senderInfo.address}`;
  await context.send(`${sendUrl}`);
}
