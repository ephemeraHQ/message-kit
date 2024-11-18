import { ensUrl } from "../skills.js";
import { XMTPContext } from "@xmtp/message-kit";

export async function handleRegister(context: XMTPContext) {
  const {
    message: {
      content: { params: domain },
    },
  } = context;

  if (!domain) {
    return {
      code: 400,
      message: "Missing required parameters. Please provide domain.",
    };
  }
  // Generate URL for the ens
  let url_ens = ensUrl + domain;
  context.send(`${url_ens}`);
  return { code: 200, message: `${url_ens}` };
}
