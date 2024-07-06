import { ContentCodec, ContentTypeId, EncodedContent } from "@xmtp/content-type-primitives";
export declare const ContentTypeBotMessage: ContentTypeId;
export type BotMessage = {
    receivers: string[];
    content: string;
    metadata?: Record<string, string>;
};
export declare class BotMessageCodec implements ContentCodec<BotMessage> {
    get contentType(): ContentTypeId;
    encode(message: BotMessage): {
        type: ContentTypeId;
        parameters: {};
        content: Uint8Array;
    };
    decode(encodedContent: EncodedContent): BotMessage;
    fallback(): string;
    shouldPush(): boolean;
}
//# sourceMappingURL=BotMessage.d.ts.map