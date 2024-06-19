import {
  ContentCodec,
  ContentTypeId,
  EncodedContent,
} from "@xmtp/content-type-primitives";
import { CommandGroup, User } from "../helpers/types";

export const ContentTypeBotMessage = new ContentTypeId({
  authorityId: "xmtp.org",
  typeId: "bot",
  versionMajor: 1,
  versionMinor: 0,
});

export type BotMessageMetadata = {
  users?: User[];
  commands?: CommandGroup[];
};

export type BotMessage = {
  receivers: string[];
  content: string;
  metadata?: BotMessageMetadata;
};

export class BotMessageCodec implements ContentCodec<BotMessage> {
  get contentType() {
    return ContentTypeBotMessage;
  }

  encode(message: BotMessage) {
    const { receivers, content, metadata } = message; // Include receivers in the destructuring

    return {
      type: this.contentType,
      parameters: {},
      content: new TextEncoder().encode(
        JSON.stringify({ receivers, content, metadata }), // Include receivers in the JSON string
      ),
    };
  }

  decode(encodedContent: EncodedContent): BotMessage {
    const decodedContent = new TextDecoder().decode(encodedContent.content);

    try {
      const message = JSON.parse(decodedContent) as BotMessage;
      const { receivers, content, metadata } = message;
      return { receivers, content, metadata };
    } catch (e) {
      return {
        receivers: [],
        content: "",
      };
    }
  }

  fallback() {
    return "Message sent by a bot";
  }

  shouldPush() {
    return true;
  }
}
