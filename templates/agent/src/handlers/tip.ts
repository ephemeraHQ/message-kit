import { txpayUrl } from "../skills.js";
import { XMTPContext, getUserInfo } from "@xmtp/message-kit";

export async function handleTip(context: XMTPContext) {
  const {
    message: {
      content: {
        params: { address },
      },
    },
  } = context;

  if (!address) {
    return {
      code: 400,
      message: "Please provide an address to tip.",
    };
  }
  const data = await getUserInfo(address);

  let sendUrl = `${txpayUrl}/?&amount=1&token=USDC&receiver=${address}`;

  return {
    code: 200,
    message: sendUrl,
  };
}
