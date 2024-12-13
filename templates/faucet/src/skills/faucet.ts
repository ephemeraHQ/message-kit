import { Context, chatMemory, Skill } from "@xmtp/message-kit";
import { getRedisClient } from "../plugins/redis.js";
import {
  FIVE_MINUTES,
  LearnWeb3Client,
  Network,
} from "../plugins/learnweb3.js";

export const faucet: Skill[] = [
  {
    skill: "faucet",
    handler: handleFaucet,
    examples: [
      "/faucet 0x1234567890123456789012345678901234567890 sepolia",
      "/faucet 0x1234567890123456789012345678901234567890 arbitrum_sepolia",
      "/faucet 0x1234567890123456789012345678901234567890 base_sepolia",
    ],
    description: "Get some testnet tokens.",
    params: {
      address: {
        type: "string",
      },
      network: {
        type: "string",
      },
    },
  },
  {
    skill: "networks",
    handler: handleFaucet,
    examples: ["/networks"],
    description: "Get the list of supported networks.",
  },
];

export async function handleFaucet(context: Context) {
  const { message } = context;
  const redisClient = await getRedisClient();
  const {
    content: { skill, params },
    sender,
  } = message;

  // Initialize LearnWeb3Client
  const learnWeb3Client = new LearnWeb3Client();

  // Fetch supported networks from Redis cache or API
  let supportedNetworks: Network[];
  const cachedSupportedNetworksData =
    await redisClient.get("supported-networks");
  supportedNetworks = JSON.parse(
    cachedSupportedNetworksData!,
  ).supportedNetworks;

  if (skill === "networks") {
    if (
      !cachedSupportedNetworksData ||
      Date.now() >
        parseInt(JSON.parse(cachedSupportedNetworksData).lastSyncedAt) +
          FIVE_MINUTES
    ) {
      console.log("Cleared cache");
      const updatedSupportedNetworksData = await learnWeb3Client.getNetworks();
      await redisClient.set(
        "supported-networks",
        JSON.stringify({
          lastSyncedAt: Date.now(),
          supportedNetworks: updatedSupportedNetworksData,
        }),
      );
      supportedNetworks = updatedSupportedNetworksData;
    } else {
      supportedNetworks = JSON.parse(
        cachedSupportedNetworksData!,
      ).supportedNetworks;
    }

    supportedNetworks = supportedNetworks.filter(
      (n) =>
        !n.networkId.toLowerCase().includes("starknet") &&
        !n.networkId.toLowerCase().includes("fuel") &&
        !n.networkId.toLowerCase().includes("mode"),
    );

    const networkList = supportedNetworks.map((n, index) => {
      return `${index + 1}. ${n.networkId
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())}`;
    });

    return {
      message: `Available networks:\n\n${networkList.join("\n")}`,
      code: 200,
    };
  } else if (skill === "faucet") {
    const { network } = params;
    const selectedNetwork = supportedNetworks.find(
      (n) => n.networkId === network,
    );

    if (!selectedNetwork) {
      await context.send("Invalid network. Please select a valid option.");
      return;
    }

    await context.send(
      "Your testnet tokens are being processed. Please wait a moment for the transaction to process.",
    );

    const result = await learnWeb3Client.dripTokens(
      selectedNetwork.networkId,
      sender.address,
    );

    if (!result.ok) {
      await context.send(
        `❌ Sorry, there was an error processing your request:\n\n"${result.error!}"`,
      );
      return;
    }

    await context.send("Here's your transaction receipt:");
    await context.send(
      `${process.env.FRAME_BASE_URL}?txLink=${result.value}&networkLogo=${
        selectedNetwork?.networkLogo
      }&networkName=${selectedNetwork?.networkName.replaceAll(
        " ",
        "-",
      )}&tokenName=${selectedNetwork?.tokenName}&amount=${
        selectedNetwork?.dripAmount
      }`,
    );
  } else {
    await context.send("Unknown skill. Please use 'list' or 'drip'.");
  }
}
