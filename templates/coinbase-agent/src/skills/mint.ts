import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
import { baseUrl } from "../index.js";

export const registerSkill: Skill[] = [
  {
    skill: "/mint [collection] [token_id] [url]",
    examples: [
      "/mint 0x73a333cb82862d4f66f0154229755b184fb4f5b0 1",
      "/mint https://zora.co/collect/base/0x123456789/1...",
    ],

    handler: handler,
    description: "Mint a specific token from a collection.",
    params: {
      collection: {
        default: "0x73a333cb82862d4f66f0154229755b184fb4f5b0",
        type: "string",
      },
      token_id: {
        default: "1",
        type: "number",
      },
      url: {
        type: "url",
      },
    },
  },
];
export async function handler(context: XMTPContext) {
  const {
    message: {
      content: { params },
    },
  } = context;

  if (params.url) {
    const MINT_URL = "https://xmtp-mintiaml.vercel.app";
    const { url } = context.message.content.params;

    const urlPatterns = [
      {
        pattern: /https?:\/\/zora\.co\/collect\/([^:]+):([^/]+)\/(\d+)/,
        transform: (chain: string, address: string, tokenId: string) =>
          `${MINT_URL}/${chain}/${address}/${tokenId}`,
      },
      {
        pattern:
          /https?:\/\/wallet\.coinbase\.com\/nft\/mint\/eip155:(\d+):erc721:([^:]+)/,
        transform: (chain: string, address: string) =>
          `${MINT_URL}/eip155/${chain}/erc721/${address}`,
      },
      {
        pattern:
          /https?:\/\/wallet\.coinbase\.com\/nft\/mint\/eip155:(\d+):erc1155:([^:]+):(\d+)/,
        transform: (chain: string, address: string, tokenId: string) =>
          `${MINT_URL}/eip155/${chain}/erc1155/${address}/${tokenId}`,
      },
    ];
    //https://wallet.coinbase.com/nft/mint/eip155:8453:erc1155:0x9a83e7b27b8a9b68e8dc665a0049f2f004287a20:1
    //https://wallet.coinbase.com/nft/mint/eip155:8453:erc721:0x2a8e46E78BA9667c661326820801695dcf1c403E
    //https://zora.co/collect/base:0xa902601ece8b81d906b7deceb67f5badcbdff7df/1

    //https://xmtp-mintiaml.vercel.app/eip155/8453/erc721/0xf16755b43eE1a458161f0faE5a9124729f4f6B1B
    let parsedUrl = null;
    for (const { pattern, transform } of urlPatterns) {
      const match = url.match(pattern);

      if (match) {
        parsedUrl = transform(match[1], match[2], match[3]);
        break;
      }
    }
    if (parsedUrl) {
      await context.send("Here is your Mint Frame URL: ");
      await context.send(parsedUrl);
      return;
    } else {
      await context.send(
        "Error: Unable to parse the provided URL. Please ensure you're sending a valid Zora or Coinbase Wallet URL.",
      );
      return;
    }
  } else {
    const { collection, token_id } = params;
    console.log(collection, token_id);
    if (!collection || !token_id) {
      context.reply(
        "Missing required parameters. Please provide collection and token_id.",
      );
      return;
    }
    let mintUrl = `${baseUrl}/?transaction_type=mint&collection=${collection}&token_id=${token_id}`;
    return {
      code: 200,
      message: mintUrl,
    };
  }
}
