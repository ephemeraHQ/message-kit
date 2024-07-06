import { Conversation, DecodedMessage, Client } from "@xmtp/mls-client";
import { CommandGroup, User, CommandHandlers, AgentHandlers, MessageAbstracted } from "../helpers/types.js";
import { NapiCreateGroupOptions } from "@xmtp/mls-client-bindings-node";
export default class HandlerContext {
    message: MessageAbstracted;
    conversation: Conversation;
    client: Client;
    commands?: CommandGroup[];
    members?: User[];
    commandHandlers?: CommandHandlers;
    agentHandlers?: AgentHandlers;
    getMessageById: (id: string) => DecodedMessage | null;
    newConversation: (accountAddresses: string[], options?: NapiCreateGroupOptions) => Promise<Conversation>;
    private constructor();
    static create(conversation: Conversation, message: DecodedMessage, client: Client, commands?: CommandGroup[], commandHandlers?: CommandHandlers, agentHandlers?: AgentHandlers): Promise<HandlerContext>;
    reply(message: string, receivers?: string[]): Promise<void>;
    botReply(message: string, receivers?: string[]): Promise<void>;
    handleAgent(text: string): Promise<string>;
    handleCommand(text: string): Promise<string>;
}
//# sourceMappingURL=handlerContext.d.ts.map