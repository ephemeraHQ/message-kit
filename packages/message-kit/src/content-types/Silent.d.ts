import { ContentCodec, ContentTypeId, EncodedContent } from "@xmtp/content-type-primitives";
import { CommandGroup, User } from "../helpers/types";
export declare const ContentTypeSilent: ContentTypeId;
export type SilentMetadata = {
    type: "request_access" | "ping" | "grant_access" | "deny_access" | "commands" | "usernames" | null;
    commands?: CommandGroup[];
    usernames?: User[];
};
export type Silent = {
    metadata: SilentMetadata;
};
export declare class SilentCodec implements ContentCodec<Silent> {
    get contentType(): ContentTypeId;
    encode(silent: Silent): {
        type: ContentTypeId;
        parameters: {};
        content: Uint8Array;
    };
    decode(encodedContent: EncodedContent): Silent;
    fallback(): undefined;
    shouldPush(): boolean;
}
//# sourceMappingURL=Silent.d.ts.map