import { Context, Skill } from "@xmtp/message-kit";
import { baselinks } from "../plugins/baselinks.js";

export const token: Skill[] = [
  {
    skill: "token",
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
export async function handler(context: Context) {
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
    context.send({
      message: "Token not found",
      originalMessage: context.message,
    });
    context.send({
      message: "try with its full name, instead of btc it would be bitcoin",
      originalMessage: context.message,
    });
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
  const url = baselinks.customFrame(frame);
  await context.send({ message: url, originalMessage: context.message });
}
