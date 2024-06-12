import { ContentCodec, ContentTypeId, EncodedContent } from "@xmtp/xmtp-js";
import { Metadata } from "../helpers/types";

export const ContentTypeSilent = new ContentTypeId({
  authorityId: "xmtp.org",
  typeId: "silent",
  versionMajor: 1,
  versionMinor: 0,
});

export type SilentMetadata = {
  type: "access" | "ping";
  access?: boolean;
} & Metadata;

export type Silent = {
  metadata?: SilentMetadata;
};

export class SilentCodec implements ContentCodec<Silent> {
  get contentType() {
    return ContentTypeSilent;
  }

  encode(silent: Silent) {
    const { metadata } = silent;

    return {
      type: this.contentType,
      parameters: {},
      content: new TextEncoder().encode(JSON.stringify({ metadata })),
    };
  }

  decode(encodedContent: EncodedContent): Silent {
    const decodedContent = new TextDecoder().decode(encodedContent.content);

    try {
      const silent = JSON.parse(decodedContent) as Silent;
      const { metadata } = silent;
      return { metadata };
    } catch (e) {
      return {};
    }
  }

  fallback() {
    return undefined;
  }

  shouldPush() {
    return false;
  }
}
