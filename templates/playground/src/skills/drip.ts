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
    await context.send("Invalid network. Please select a valid option.");
    return;
  }
  context.send("Fetching testnet tokens...");
  const redisClient = await getRedisClient();

  const learnWeb3Client = new LearnWeb3Client();
  // Fetch supported networks from Redis cache or API
  let supportedNetworks: Network[];
  const cachedSupportedNetworksData =
    await redisClient.get("supported-networks");
  supportedNetworks = JSON.parse(
    cachedSupportedNetworksData!,
  ).supportedNetworks;
  await context.send(
    "Your testnet tokens are being processed. Please wait a moment for the transaction to process.",
  );
  const selectedNetwork = supportedNetworks.find(
    (n) => n.networkId.toLowerCase() === network.toLowerCase(),
  );
  if (!selectedNetwork) {
    await context.send(
      "The network currently does not have funds provided by web3 api's\nTry again later...",
    );
    return;
  }
  const result = await learnWeb3Client.dripTokens(
    selectedNetwork!.networkId,
    sender.address,
  );

  if (!result.ok) {
    await context.send(
      `❌ Sorry, there was an error processing your request:\n\n"${result.error!}"`,
    );
    return;
  }

  await context.send("Here's your transaction receipt:");
  const url = await baselinks.sendReceipt(
    result.value!,
    selectedNetwork.dripAmount as number,
  );
  await context.dm(url);
  return;
}
