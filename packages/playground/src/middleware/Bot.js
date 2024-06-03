import { ContentTypeId } from "@xmtp/xmtp-js";

export const ContentTypeBotMessage = new ContentTypeId({
  authorityId: "xmtp.org",
  typeId: "bot",
  versionMajor: 1,
  versionMinor: 0,
});

export class BotMessageCodec {
  get contentType() {
    return ContentTypeBotMessage;
  }

  encode(message) {
    const { sender, receivers, content, context, reference } = message; // Include receivers in the destructuring

    return {
      type: ContentTypeBotMessage,
      parameters: {},
      content: new TextEncoder().encode(
        JSON.stringify({ sender, receivers, content, context, reference }), // Include receivers in the JSON string
      ),
    };
  }

  decode(encodedContent) {
    const decodedContent = new TextDecoder().decode(encodedContent.content);

    try {
      const message = JSON.parse(decodedContent);
      const { sender, receivers, content, context, reference } = message; // Include receivers in the destructuring
      return { sender, receivers, content, context, reference }; // Return receivers along with other properties
    } catch (e) {
      const parameters = encodedContent.parameters;
      return {
        sender: parameters.sender,
        receivers: parameters.receivers, // Fallback to receivers in parameters if JSON parsing fails
        content: decodedContent,
        context: parameters.context,
        reference: parameters.reference,
      };
    }
  }

  fallback(content) {
    return "Bot message";
  }

  shouldPush(content) {
    return false;
  }
}
