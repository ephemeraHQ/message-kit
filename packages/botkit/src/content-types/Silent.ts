// @ts-nocheck
import { ContentTypeId } from "@xmtp/xmtp-js";

export const ContentTypeSilent = new ContentTypeId({
  authorityId: "xmtp.org",
  typeId: "silent",
  versionMajor: 1,
  versionMinor: 0,
});

export class SilentCodec {
  get contentType() {
    return ContentTypeSilent;
  }

  encode(silent) {
    const { sender, reference, content, metadata } = silent;

    return {
      type: ContentTypeSilent,
      parameters: {},
      content: new TextEncoder().encode(
        JSON.stringify({ sender, reference, content, metadata }),
      ),
    };
  }

  decode(encodedContent) {
    const decodedContent = new TextDecoder().decode(encodedContent.content);

    try {
      const silent = JSON.parse(decodedContent);
      const { sender, reference, content, metadata } = silent;
      return { sender, reference, content, metadata };
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
    return undefined;
  }

  shouldPush(content) {
    return false;
  }
}
