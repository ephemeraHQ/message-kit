import { Context } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";

// Example skill structure
export const cryptoPrice: Skill[] = [
  {
    skill: "price",
    handler: handler,
    examples: ["/price BTC USD", "/price ETH EUR"],
    description: "Get the current exchange rate for a cryptocurrency.",
    params: {
      crypto: {
        type: "string",
      },
      currency: {
        type: "string",
        default: "USD",
      },
    },
  },
];

async function handler(context: Context) {
  const {
    message: {
      content: {
        params: { crypto, currency },
      },
    },
  } = context;

  try {
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/price?fsym=${crypto}&tsyms=${currency}`,
    );

    if (!response.ok) {
      return {
        code: response.status,
        message: `Unable to fetch exchange rate: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as Record<string, number>;

    if (!data[currency]) {
      return {
        code: 400,
        message: `Could not find exchange rate for ${crypto}/${currency}`,
      };
    }

    return {
      code: 200,
      message: `1 ${crypto} = ${data[currency]} ${currency}`,
    };
  } catch (error: any) {
    return {
      code: 500,
      message: `Error fetching exchange rate: ${error.message}`,
    };
  }
}
