import { ContentTypeId, } from "@xmtp/content-type-primitives";
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
        const { metadata } = silent;
        return {
            type: this.contentType,
            parameters: {},
            content: new TextEncoder().encode(JSON.stringify({ metadata })),
        };
    }
    decode(encodedContent) {
        const decodedContent = new TextDecoder().decode(encodedContent.content);
        try {
            const silent = JSON.parse(decodedContent);
            const { metadata } = silent;
            return { metadata };
        }
        catch (e) {
            return { metadata: { type: null } };
        }
    }
    fallback() {
        return undefined;
    }
    shouldPush() {
        return false;
    }
}
//# sourceMappingURL=Silent.js.map