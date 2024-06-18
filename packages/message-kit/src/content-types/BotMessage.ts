import {
  ContentCodec,
  ContentTypeId,
  EncodedContent,
} from "@xmtp/content-type-primitives";

export const ContentTypeBotMessage = new ContentTypeId({
  authorityId: "xmtp.org",
  typeId: "bot",
  versionMajor: 1,
  versionMinor: 0,
});

export type BotMessage = {
  receivers: string[];
  content: string;
};

export class BotMessageCodec implements ContentCodec<BotMessage> {
  get contentType() {
    return ContentTypeBotMessage;
  }

  encode(message: BotMessage) {
    const { receivers, content } = message; // Include receivers in the destructuring

    return {
      type: this.contentType,
      parameters: {},
      content: new TextEncoder().encode(
        JSON.stringify({ receivers, content }), // Include receivers in the JSON string
      ),
    };
  }

  decode(encodedContent: EncodedContent): BotMessage {
    const decodedContent = new TextDecoder().decode(encodedContent.content);

    try {
      const message = JSON.parse(decodedContent) as BotMessage;
      const { receivers, content } = message;
      return { receivers, content };
    } catch (e) {
      return {
        receivers: [],
        content: "",
      };
    }
  }

  fallback() {
    return undefined;
  }

  shouldPush() {
    return false;
  }
}
