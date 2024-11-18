import { ensUrl } from "../skills.js";
import { XMTPContext } from "@xmtp/message-kit";

export async function handleRenew(context: XMTPContext) {
  const { domain } = context.message.content.params;

  if (!domain) {
    return {
      code: 400,
      message: "Missing required parameters. Please provide domain.",
    };
  }

  let url_ens = `${ensUrl}${domain}`;
  context.send(`${url_ens}`);
  return { code: 200, message: `Renew your domain at: ${url_ens}` };
}
