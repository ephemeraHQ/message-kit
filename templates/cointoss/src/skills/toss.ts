import { v4 as uuidv4 } from "uuid";
import { Skill, XMTPContext, getUserInfo } from "@xmtp/message-kit";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { getRedisClient } from "../lib/redis.js";
import { createPublicClient, createWalletClient, http, parseUnits } from "viem";
import { COINTOSSBOT_ABI } from "../toremove/abi.js";
import { AgentWallet } from "../toremove/cdp-fake.js";

export const toss: Skill[] = [
  {
    skill: "/join [tossId]",
    description: "Join a toss.",
    params: {
      tossId: {
        type: "string",
      },
    },
    handler: handleJoinToss,
    examples: ["/join 72"],
  },
  {
    skill:
      "/toss [description] [options (separated by comma)] [amount] [judge(optional)] [endTime(optional)]",
    description:
      "Create a toss with a description, options, amount and judge(optional).",
    handler: handleTossCreation,
    examples: [
      "/toss 'Shane vs John at pickeball' 'Yes,No' 10",
      "/toss 'Will argentina win the world cup' 'Yes,No' 10",
      "/toss 'Race to the end' 'Fabri,John' 10 @fabri",
      "/toss 'Will argentina win the world cup' 'Yes,No' 5 '27 Oct 2023 23:59:59 GMT'",
      "/toss 'Will the niks win on sunday?' 'Yes,No' 10 vitalik.eth '27 Oct 2023 23:59:59 GMT'",
      "/toss 'Will it rain tomorrow' 'Yes,No' 0",
    ],
    params: {
      description: {
        type: "quoted",
      },
      options: {
        default: "Yes, No",
        type: "quoted",
      },
      amount: {
        type: "number",
      },
      judge: {
        type: "username",
      },
      endTime: {
        type: "quoted",
      },
    },
  },
];

export async function handleTossCreation(context: XMTPContext) {
  const {
    message: {
      content: { params },
      sender,
    },
  } = context;

  if (params.description && params.options && !isNaN(Number(params.amount))) {
    //await context.send("one sec...");
    let judge = params.judge ?? sender.address;
    if (params.judge) {
      judge = await getUserInfo(params.judge);
    }
    console.log(
      "Creating toss...",
      params.options,
      params.amount,
      params.description,
      judge?.address ?? sender.address,
      params?.endTime ?? BigInt(0),
    );
    const tossId = await createToss(
      context,
      params.options,
      params.amount,
      params.description,
      judge?.address ?? sender.address,
      params?.endTime ?? undefined,
    );
    if (tossId !== undefined) {
      await context.send(`Here is your toss!`);
      await context.send(
        `Here are the details:
Options - ${params.options}
Amount - ${params.amount}
Description - ${params.description}
Judge - ${judge?.address ?? sender.address}
End Time - ${params?.endTime ?? "Not specified (default 24 hours)"}
Toss ID - ${tossId}

Commands:
@cointoss join <tossId>
@cointoss leave <tossId>
@cointoss result <tossId>
@cointoss end <tossId>`,
      );
    } else {
      await context.send(
        `An error occurred while creating the toss. ${JSON.stringify(tossId)}`,
      );
    }
  }
}

export const createToss = async (
  context: XMTPContext,
  options: string,
  amount: string,
  description: string,
  judge: string,
  endTime?: string | bigint,
) => {
  try {
    const amountString = `${amount}`;
    const uuid = uuidv4();
    const redis = await getRedisClient();

    redis.set(
      uuid,
      JSON.stringify({
        description: description,
        options: options,
        amount: amount,
        admin: judge,
      }),
    );

    const account = privateKeyToAccount(process.env.KEY! as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    const parsedAmount = BigInt(parseUnits(amountString, 6));

    if (endTime) {
      const date = new Date(endTime as string);
      const timestamp = Math.floor(date.getTime() / 1000);
      if (isNaN(timestamp)) {
        console.error("Invalid endTime provided:", endTime);
        // Fix: Correctly set a default endTime if the provided one is invalid
        endTime = BigInt(Math.floor(new Date().getTime() / 1000) + 34 * 60);
      } else {
        endTime = BigInt(timestamp);
      }
    } else {
      // Fix: Set a default endTime if none is provided
      endTime = BigInt(Math.floor(new Date().getTime() / 1000) + 34 * 60);
    }
    const createTossTx = await walletClient.writeContract({
      account: account,
      abi: COINTOSSBOT_ABI,
      address: process.env.COINTOSS_CONTRACT_ADDRESS! as `0x${string}`,
      functionName: "createToss",
      args: [
        judge as `0x${string}`,
        description as string,
        (options as string).split(","),
        [parsedAmount, parsedAmount],
        endTime,
        BigInt(0),
      ],
    });
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    await publicClient.waitForTransactionReceipt({
      hash: createTossTx,
    });
    const tossId = await publicClient.readContract({
      address: process.env.COINTOSS_CONTRACT_ADDRESS! as `0x${string}`,
      abi: COINTOSSBOT_ABI,
      functionName: "tossId",
    });

    return tossId;
  } catch (error) {
    console.error("Error creating toss:", error);
    await context.send(
      "An error occurred while creating the toss. Please try again later.",
    );
  }
};

export async function handleJoinToss(context: XMTPContext) {
  const {
    message: {
      sender,
      content: {
        params: { tossId },
      },
    },
  } = context;
  const redis = await getRedisClient();
  console.log(redis, tossId);
  await context.send(`Joining toss ${tossId}`);
  const tossDataString = await redis.get(tossId);
  console.log(tossDataString);
  const tossData = tossDataString ? JSON.parse(tossDataString) : null;
  console.log(tossData);
  const agentWallet = new AgentWallet(sender.address);
  if (tossData) {
    const balance = await agentWallet.checkBalance();
    if (balance < BigInt(tossData.amount)) {
      await context.send("You don't have enough USDC to join the toss.");
      return;
    }
    await context.send("Toss found");
    console.log(toss);
  } else {
    await context.send("Toss not found");
  }
}

export const GROUP_MESSAGE_FIRST = `\n\nThe creator of the toss is one who can modify and settle the toss. \n\nThe pool will be split evenly with the winners. \n\nRemember, with great power comes great responsibility!`;
