import { Context, baselinks } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
import { getRedisClient } from "../plugins/redis.js";
import { LearnWeb3Client, Network } from "../plugins/learnweb3.js";

export const registerSkill: Skill[] = [
  {
    skill: "drip",
    handler: handler,
    examples: [
      "/drip base_sepolia 0x123456789",
      "/drip base_goerli 0x123456789",
    ],
    description:
      "Drip a default amount of testnet tokens to a specified address.",
    params: {
      network: {
        default: "base_sepolia",
        type: "string",
        values: ["base_sepolia", "base_goerli"],
      },
      address: {
        default: "",
        type: "address",
      },
    },
  },
];

export async function handler(context: Context) {
  const {
    message: {
      content: {
        params: { network, address },
      },
      sender,
    },
  } = context;

  if (!network) {
    await context.send({
      message: "Invalid network. Please select a valid option.",
      originalMessage: context.message,
    });
    return;
  }
  await context.send({
    message: "Fetching testnet tokens...",
    originalMessage: context.message,
  });
  const redisClient = await getRedisClient();

  const learnWeb3Client = new LearnWeb3Client();
  // Fetch supported networks from Redis cache or API
  let supportedNetworks: Network[];
  const cachedSupportedNetworksData =
    await redisClient.get("supported-networks");
  supportedNetworks = JSON.parse(
    cachedSupportedNetworksData!,
  ).supportedNetworks;
  await context.send({
    message:
      "Your testnet tokens are being processed. Please wait a moment for the transaction to process.",
    originalMessage: context.message,
  });
  const selectedNetwork = supportedNetworks.find(
    (n) => n.networkId.toLowerCase() === network.toLowerCase(),
  );
  if (!selectedNetwork) {
    await context.send({
      message:
        "The network currently does not have funds provided by web3 api's\nTry again later...",
      originalMessage: context.message,
    });
    return;
  }
  const result = await learnWeb3Client.dripTokens(
    selectedNetwork!.networkId,
    sender.address,
  );

  if (!result.ok) {
    await context.send({
      message: `❌ Sorry, there was an error processing your request:\n\n"${result.error!}"`,
      originalMessage: context.message,
    });
    return;
  }

  await context.send({
    message: "Here's your transaction receipt:",
    originalMessage: context.message,
  });
  const url = baselinks.receiptLink(
    result.value!,
    selectedNetwork.dripAmount as number,
  );
  await context.send({
    message: url,
    originalMessage: context.message,
  });
  return;
}
