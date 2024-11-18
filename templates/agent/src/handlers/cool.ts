import { XMTPContext } from "@xmtp/message-kit";

export async function handleCool(context: XMTPContext) {
  const { domain } = context.message.content.params;

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
  if (!domain) {
    return {
      code: 400,
      message: "Missing required parameters. Please provide domain.",
    };
  }

  // Remove .eth if present
  const baseName = domain.replace(".eth", "");

  // Generate some cool alternatives
  const alternatives = [
    `${baseName}.eth`,
    `${baseName}eth.eth`,
    `${baseName}.base`,
    `${baseName}base.eth`,
    `${baseName}.op`,
  ];

  const message = `Cool alternatives for ${domain}:\n${alternatives.join("\n")}`;
  context.send(message);
  return { code: 200, message };
}
