import { CommandGroup, AccessHandler } from "./types.js";
import { Conversation } from "@xmtp/mls-client";
export declare function grantAccess(conversation: Conversation, accessHandler: AccessHandler, context: any): Promise<void>;
export declare function commands(conversation: Conversation, commands: CommandGroup[]): Promise<void>;
//# sourceMappingURL=context.d.ts.map