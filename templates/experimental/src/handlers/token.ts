import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";

export const registerSkill: Skill[] = [
  {
    skill: "/token [symbol]",
    handler: handler,
    examples: ["/token bitcoin", "/token ethereum"],
    description: "Get real time price of a any token.",
    params: {
      symbol: {
        type: "string",
      },
    },
  },
];
export async function handler(context: XMTPContext) {
  const {
    message: {
      content: {
        params: { symbol },
      },
    },
  } = context;
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${symbol}`,
  );
  if (!response.ok) {
    context.send("Token not found");
    context.send("try with its full name, instead of btc it would be bitcoin");
    return;
  }
  const data = (await response.json()) as any;
  const token = data[0];

  const tokenInfo = {
    name: token.name,
    symbol: token.symbol.toUpperCase(),
    price: token.current_price,
    image: token.image,
    link: `https://www.coingecko.com/en/coins/${token.id}`,
  };

  let frame = {
    title: tokenInfo.name,
    buttons: [
      { content: "Buy", action: "link", target: tokenInfo.link },
      {
        content: `Price (${tokenInfo.price})`,
        action: "link",
        target: tokenInfo.link,
      },
    ],
    image: tokenInfo.image,
  };
  await context.sendCustomFrame(frame);
}
