import { ContentTypeSilent } from "../content-types/Silent.js";
export async function grantAccess(conversation, accessHandler, context) {
    // Send a ping with access handler status
    let accept = await accessHandler(context);
    let content = {
        metadata: {
            type: accept ? "grant_access" : "deny_access",
        },
    };
    await conversation.send(content, ContentTypeSilent);
    return;
}
export async function commands(conversation, commands) {
    // Send a ping with access handler status
    let content = {
        metadata: {
            type: "commands",
            commands: commands,
        },
    };
    await conversation.send(content, ContentTypeSilent);
    return;
}
//# sourceMappingURL=context.js.map