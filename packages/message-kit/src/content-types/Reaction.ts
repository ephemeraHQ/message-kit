// @ts-nocheck
import { ContentTypeId } from "@xmtp/xmtp-js";

export const ContentTypeReaction = new ContentTypeId({
  authorityId: "xmtp.org",
  typeId: "reaction",
  versionMajor: 1,
  versionMinor: 0,
});

export class ReactionCodec {
  get contentType() {
    return ContentTypeReaction;
  }

  encode(reaction) {
    const { action, reference, schema, content, receiver } = reaction;

    return {
      type: ContentTypeReaction,
      parameters: {},
      content: new TextEncoder().encode(
        JSON.stringify({ action, reference, schema, content, receiver }),
      ),
    };
  }

  decode(encodedContent) {
    const decodedContent = new TextDecoder().decode(encodedContent.content);

    try {
      const reaction = JSON.parse(decodedContent);
      const { action, reference, schema, content, receiver } = reaction;
      return { action, reference, schema, content, receiver };
    } catch (e) {
      const parameters = encodedContent.parameters;
      return {
        action: parameters.action,
        reference: parameters.reference,
        schema: parameters.schema,
        content: decodedContent,
        receiver: parameters.receiver,
      };
    }
  }

  fallback(content) {
    switch (content.action) {
      case "added":
        return `Reacted “${content.content}” to an earlier message`;
      case "removed":
        return `Removed “${content.content}” from an earlier message`;
      default:
        return undefined;
    }
  }

  shouldPush(content) {
    return false;
  }
}
