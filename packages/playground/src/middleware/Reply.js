import { ContentTypeId } from "@xmtp/xmtp-js";
import { content as proto } from "@xmtp/proto";

export const ContentTypeReply = new ContentTypeId({
  authorityId: "xmtp.org",
  typeId: "reply",
  versionMajor: 1,
  versionMinor: 0,
});

export class ReplyCodec {
  get contentType() {
    return ContentTypeReply;
  }

  encode(content, codecs) {
    const codec = codecs.codecFor(content.contentType);
    if (!codec) {
      throw new Error(
        `missing codec for content type "${content.contentType.toString()}"`,
      );
    }

    const encodedContent = codec.encode(content.content, codecs);
    const bytes = proto.EncodedContent.encode(encodedContent).finish();
    console.log({
      parameters: {
        reference: content.reference,
        receiver: content.receiver,
      },
    });
    return {
      type: ContentTypeReply,
      parameters: {
        reference: content.reference,
        receiver: content.receiver,
      },
      content: bytes,
    };
  }

  decode(content, codecs) {
    const decodedContent = proto.EncodedContent.decode(content.content);
    if (!decodedContent.type) {
      throw new Error("missing content type");
    }
    const contentType = new ContentTypeId(decodedContent.type);
    const codec = codecs.codecFor(contentType);
    if (!codec) {
      throw new Error(
        `missing codec for content type "${contentType.toString()}"`,
      );
    }

    return {
      reference: content.parameters.reference,
      contentType,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      content: codec.decode(decodedContent, codecs),
      receiver: content.parameters.receiver,
    };
  }

  fallback(content) {
    if (typeof content.content === "string") {
      return `Replied with “${content.content}” to an earlier message`;
    }
    return "Replied to an earlier message";
  }

  shouldPush() {
    return true;
  }
}
