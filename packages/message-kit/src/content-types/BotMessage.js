import { ContentTypeId, } from "@xmtp/content-type-primitives";
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
        const { receivers, content, metadata } = message; // Include receivers in the destructuring
        return {
            type: this.contentType,
            parameters: {},
            content: new TextEncoder().encode(JSON.stringify({ receivers, content, metadata })),
        };
    }
    decode(encodedContent) {
        const decodedContent = new TextDecoder().decode(encodedContent.content);
        try {
            const message = JSON.parse(decodedContent);
            const { receivers, content, metadata } = message;
            return { receivers, content, metadata };
        }
        catch (e) {
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
//# sourceMappingURL=BotMessage.js.map