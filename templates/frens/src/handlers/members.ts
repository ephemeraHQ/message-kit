import dotenv from "dotenv";
dotenv.config();
import { HandlerContext } from "@xmtp/message-kit";
import { db } from "../lib/db.js";

const groupId = process.env.GROUP_ID as string;
export async function handleMembers(context: HandlerContext) {
  const {
    message: {
      content: { command },
      sender,
    },
    group,
    client,
  } = context;

  await db.read();
  if (command == "unsubscribe") {
    const subscribers = db?.data?.subscribers;
    const subscriber = subscribers?.find((s) => s.address === sender.address);
    if (subscriber) {
      subscriber.status = "unsubscribed";
    }
    await db.write();
    return {
      code: 200,
      message: "You have been unsubscribed from updates.",
    };
  } else if (command == "subscribe") {
    const subscribers = db?.data?.subscribers;
    if (!subscribers) {
      db.data.subscribers = [];
    }
    const subscriber = subscribers?.find((s) => s.address === sender.address);
    if (!subscriber) {
      db?.data?.subscribers?.push({
        address: sender.address,
        status: "subscribed",
      });
      await db.write();

      return {
        code: 200,
        message: "📣 You have been subscribed to updates.",
      };
    }
    return {
      code: 400,
      message: "Error subscribing to updates.",
    };
  } else if (group && command == "id") {
    console.log(group.id);
    return;
  } else if (command == "add") {
    const subscriberExists = db?.data?.subscribers?.find(
      (s) => s.address === sender.address
    );
    if (!subscriberExists) {
      const conversation = await client.conversations.getConversationById(
        groupId
      );
      if (conversation) await conversation.addMembers([sender.address]);

      return {
        code: 200,
        message: "You have been added to the group",
      };
    }
    return {
      code: 400,
      message: "You are already in the group",
    };
  } else if (command == "remove") {
    const subscriberExists = db?.data?.subscribers?.find(
      (s) => s.address === sender.address
    );
    if (subscriberExists) {
      const conversation = await client.conversations.getConversationById(
        groupId
      );

      //Remove from group
      const members = await conversation?.members();
      const member = members?.find((m) =>
        m.accountAddresses.includes(sender.address)
      );
      if (member)
        await conversation?.removeMembers([member.accountAddresses[0]]);

      db.data.subscribers = db?.data?.subscribers?.filter(
        (s) => s.address !== sender.address
      );
      await db.write();

      return {
        code: 200,
        message: "You have been removed to the group",
      };
    }
    return {
      code: 400,
      message: "Your removal request has been denied",
    };
  } else if (command == "exists") {
    const subscribers = db?.data?.subscribers;
    const subscriber = subscribers?.find((s) => s.address === sender.address);
    if (subscriber) {
      return {
        code: 200,
        message: "Address was onboarded",
      };
    } else {
      return {
        code: 400,
        message: "Address was not onboarded",
      };
    }
  } else if (command == "status") {
    await db.read();
    const poapTable = db?.data?.poaps;
    const claimed = poapTable.filter((poap) => poap.address);
    const subscribers = db?.data?.subscribers;
    const onboarded = subscribers.filter((subscriber) => subscriber.address);
    const subscribed = onboarded.filter(
      (subscriber) => subscriber.status === "subscribed"
    );
    context.send(
      `This is how frENSday is going:\n ${claimed.length} POAPs claimed out of ${poapTable.length}\n ${onboarded.length} users onboarded\n ${subscribed.length} users subscribed`
    );
  }
}
