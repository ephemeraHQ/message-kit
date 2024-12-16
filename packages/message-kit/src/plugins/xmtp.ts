import { Context } from "../lib/core";
import {
  Conversation,
  DecodedMessage,
  Client as V3Client,
} from "@xmtp/node-sdk";
import {
  DecodedMessage as DecodedMessageV2,
  Client as V2Client,
  Conversation as V2Conversation,
} from "@xmtp/xmtp-js";
import { MessageAbstracted, GroupAbstracted } from "../helpers/types.js";

export class XmtpPlugin {
  private v2client: V2Client;
  private client: V3Client;
  private refConv: Conversation | V2Conversation | undefined;
  private conversation: Conversation | V2Conversation | undefined;
  private group: GroupAbstracted | undefined; // Replace with the correct group type if applicable
  private message: MessageAbstracted | undefined;
  private version: "v2" | "v3";

  constructor(context: Context) {
    this.client = context.client;
    this.v2client = context.v2client;
    this.version = context.version;
    this.refConv = context.refConv;
    this.conversation = context.conversation;
    this.group = context.group;
    this.message = context.message;
  }

  async createGroup(
    client: V3Client,
    senderAddress: string,
    clientAddress: string,
  ) {
    try {
      let senderInboxId = "";
      await client.conversations.sync();
      const group = await client?.conversations.newGroup([
        senderAddress,
        clientAddress,
      ]);
      console.log("Group created", group?.id);
      const members = await group.members();
      const senderMember = members.find((member) =>
        member.accountAddresses.includes(senderAddress.toLowerCase()),
      );
      if (senderMember) {
        senderInboxId = senderMember.inboxId;
        console.log("Sender's inboxId:", senderInboxId);
      } else {
        console.log("Sender not found in members list");
      }
      await group.addSuperAdmin(senderInboxId);
      console.log(
        "Sender is superAdmin",
        await group.isSuperAdmin(senderInboxId),
      );
      await group.send(`Welcome to the new group!`);
      await group.send(
        `You are now the admin of this group as well as the bot`,
      );
      return group;
    } catch (error) {
      console.log("Error creating group", error);
      return undefined;
    }
  }

  async removeFromGroup(
    groupId: string,
    client: V3Client,
    senderAddress: string,
  ): Promise<{ code: number; message: string }> {
    try {
      let lowerAddress = senderAddress.toLowerCase();
      const { v2, v3 } = await this.isOnXMTP(lowerAddress);
      console.warn("Checking if on XMTP: v2", v2, "v3", v3);
      if (!v3)
        return {
          code: 400,
          message: "You don't seem to have a v3 identity ",
        };
      const conversation =
        await client.conversations.getConversationById(groupId);
      console.warn("removing from group", conversation?.id);
      await conversation?.sync();
      await conversation?.removeMembers([lowerAddress]);
      console.warn("Removed member from group");
      await conversation?.sync();
      const members = await conversation?.members();
      console.warn("Number of members", members?.length);

      let wasRemoved = true;
      if (members) {
        for (const member of members) {
          let lowerMemberAddress = member.accountAddresses[0].toLowerCase();
          if (lowerMemberAddress === lowerAddress) {
            wasRemoved = false;
            break;
          }
        }
      }
      return {
        code: wasRemoved ? 200 : 400,
        message: wasRemoved
          ? "You have been removed from the group"
          : "Failed to remove from group",
      };
    } catch (error) {
      console.log("Error removing from group", error);
      return {
        code: 400,
        message: "Failed to remove from group",
      };
    }
  }

  async getV2ConversationBySender(sender: string) {
    try {
      if (!this.isV2Conversation(this.conversation)) {
        return this.conversation;
      }
      const conversations = await this.v2client.conversations.list();
      return conversations.find(
        (conv) => conv.peerAddress.toLowerCase() === sender.toLowerCase(),
      );
    } catch (error) {
      console.error("Error getting V2 conversation by sender:", error);
      return undefined;
    }
  }

  async getV2MessageById(
    conversationId: string,
    reference: string,
  ): Promise<DecodedMessageV2 | undefined> {
    /*Takes to long, deprecated*/
    try {
      const conversations = await this.v2client.conversations.list();
      const conversation = conversations.find(
        (conv) => conv.topic === conversationId,
      );
      if (!conversation) return undefined;
      const messages = await conversation.messages();
      return messages.find((m) => m.id === reference) as DecodedMessageV2;
    } catch (error) {
      console.error("Error getting V2 message by id:", error);
      return undefined;
    }
  }

  getConversationKey() {
    const conversation = this.refConv || this.conversation || this.group;
    return `${(conversation as V2Conversation)?.topic || (conversation as Conversation)?.id}`;
  }

  getUserConversationKey() {
    const conversation = this.refConv || this.conversation || this.group;
    const awaitingSender =
      this.message?.sender?.inboxId || this.message?.sender?.address;
    return `${(conversation as V2Conversation)?.topic || (conversation as Conversation)?.id}:${awaitingSender}`;
  }

  isV2Conversation(
    conversation: Conversation | V2Conversation | undefined,
  ): conversation is V2Conversation {
    return (conversation as V2Conversation)?.topic !== undefined;
  }

  isV3Conversation(
    conversation: Conversation | V2Conversation | undefined,
  ): conversation is Conversation {
    return (conversation as Conversation)?.id !== undefined;
  }

  async getMessageById(reference: string) {
    return this.client.conversations?.getMessageById?.bind(
      this.client.conversations,
    )(reference);
  }

  async getLastMessageById(reference: string) {
    let msg = await (this.version === "v3"
      ? this.getMessageById(reference)
      : this.conversation &&
        this.getV2MessageById(
          (this.conversation as V2Conversation).topic,
          reference,
        ));
    msg = msg?.content;
    return msg;
  }

  async addToGroup(
    groupId: string,
    client: V3Client,
    address: string,
    asAdmin: boolean = false,
  ): Promise<{ code: number; message: string }> {
    try {
      let lowerAddress = address.toLowerCase();
      const { v2, v3 } = await this.isOnXMTP(lowerAddress);
      if (!v3)
        return {
          code: 400,
          message: "You don't seem to have a v3 identity ",
        };
      const group = await client.conversations.getConversationById(groupId);
      console.warn("Adding to group", group?.id);
      await group?.sync();
      await group?.addMembers([lowerAddress]);
      console.warn("Added member to group");
      await group?.sync();
      if (asAdmin) {
        await group?.addSuperAdmin(lowerAddress);
      }
      const members = await group?.members();
      console.warn("Number of members", members?.length);

      if (members) {
        for (const member of members) {
          let lowerMemberAddress = member.accountAddresses[0].toLowerCase();
          if (lowerMemberAddress === lowerAddress) {
            console.warn("Member exists", lowerMemberAddress);
            return {
              code: 200,
              message: "You have been added to the group",
            };
          }
        }
      }
      return {
        code: 400,
        message: "Failed to add to group",
      };
    } catch (error) {
      return {
        code: 400,
        message: "Failed to add to group",
      };
    }
  }
  async isOnXMTP(address: string): Promise<{ v2: boolean; v3: boolean }> {
    try {
      const [v2, v3] = await Promise.all([
        this.v2client ? this.v2client.canMessage(address) : false,
        this.client ? this.client.canMessage([address]) : false,
      ]);
      return {
        v2: v2 || false,
        v3: v3 ? (v3 as Map<string, boolean>).get(address) || false : false,
      };
    } catch (error) {
      console.error("Error checking XMTP availability:", error);
      return { v2: false, v3: false }; // Return default values on error
    }
  }
}
