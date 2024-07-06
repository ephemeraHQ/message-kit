import { ContentTypeBotMessage, } from "../content-types/BotMessage.js";
import { populateUsernames } from "../helpers/usernames.js";
import { ContentTypeText } from "@xmtp/content-type-text";
import { parseIntent } from "../helpers/commands.js";
import { ContentTypeReply } from "@xmtp/content-type-reply";
import { ContentTypeRemoteAttachment, RemoteAttachmentCodec, } from "@xmtp/content-type-remote-attachment";
export default class HandlerContext {
    message;
    conversation;
    client;
    commands;
    members;
    commandHandlers;
    agentHandlers;
    getMessageById;
    newConversation;
    constructor(conversation, message, client, commands, commandHandlers, agentHandlers) {
        this.client = client;
        this.conversation = conversation;
        this.commandHandlers = commandHandlers;
        this.agentHandlers = agentHandlers;
        this.commands = commands;
    }
    static async create(conversation, message, client, commands, commandHandlers, agentHandlers) {
        const context = new HandlerContext(conversation, message, client, commands, commandHandlers, agentHandlers);
        context.members = await populateUsernames(conversation.members, client.accountAddress, message.senderInboxId);
        context.newConversation = client.conversations.newConversation.bind(client.conversations);
        context.getMessageById = client.conversations.getMessageById.bind(client.conversations);
        let content = message.content;
        if (message.contentType.sameAs(ContentTypeText)) {
            content = parseIntent(message?.content, commands ?? [], context.members ?? []);
        }
        else if (message.contentType.sameAs(ContentTypeReply)) {
            content = {
                ...content,
                typeId: message.content.contentType.typeId,
            };
        }
        else if (message.contentType.sameAs(ContentTypeRemoteAttachment)) {
            const attachment = await RemoteAttachmentCodec.load(message.content, client);
            content = {
                ...content,
                attachment: attachment,
            };
        }
        context.message = {
            id: message.id,
            content: content,
            sender: context.members?.find((member) => member.inboxId === message.senderInboxId),
            typeId: message.contentType.typeId,
            sent: message.sentAt,
        };
        return context;
    }
    async reply(message, receivers) {
        if (process?.env?.MSG_LOG === "true") {
            console.log(`reply`, message);
        }
        await this.conversation.send(message);
    }
    async botReply(message, receivers) {
        const { typeId } = this.message;
        if (typeId === "silent")
            return;
        const content = {
            receivers: receivers ?? [],
            content: message,
        };
        await this.conversation.send(content, ContentTypeBotMessage);
    }
    async handleAgent(text) {
        if (text.startsWith("@")) {
            const handler = this.agentHandlers?.[text.split(" ")[0]];
            if (handler) {
                await handler(this);
            }
            else {
                this.reply("Unknown command. Type /help for a list of available commands.");
            }
        }
        else {
            await this.reply(`${text}`);
        }
        return text;
    }
    async handleCommand(text) {
        const { commands, members, message: { id, sender, sent }, } = this;
        if (text.startsWith("/")) {
            let content = parseIntent(text, commands ?? [], members ?? []);
            // Mock context for command execution
            const mockContext = {
                ...this,
                message: {
                    ...this.message,
                    content,
                },
                reply: this.reply.bind(this),
                botReply: this.botReply.bind(this),
                handleAgent: this.handleAgent.bind(this),
                handleCommand: this.handleCommand.bind(this),
            };
            const handler = this.commandHandlers?.[text.split(" ")[0]];
            if (handler) {
                await handler(mockContext);
            }
            else {
                this.reply("Unknown command. Type /help for a list of available commands.");
            }
        }
        else {
            await this.reply(`${text}`);
        }
        return text;
    }
}
//# sourceMappingURL=handlerContext.js.map