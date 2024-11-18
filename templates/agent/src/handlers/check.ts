import { ensUrl } from "../skills.js";
import { XMTPContext, getUserInfo } from "@xmtp/message-kit";

export async function handleCheck(context: XMTPContext) {
  const {
    message: {
      content: {
        params: { domain },
      },
    },
  } = context;

  const data = await getUserInfo(domain);
  if (!data?.address) {
    let message = `Looks like ${domain} is available! Here you can register it: ${ensUrl}${domain} or would you like to see some cool alternatives?`;
    return {
      code: 200,
      message,
    };
  } else {
    let message = `Looks like ${domain} is already registered!`;
    await context.executeSkill("/cool " + domain);
    return {
      code: 404,
      message,
    };
  }
}
