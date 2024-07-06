import { CommandGroup, User, CommandHandlers, AgentHandlers } from "./types";
export declare function parseIntent(content: string, commands: CommandGroup[], members: User[], commandHandlers?: CommandHandlers, agentHandlers?: AgentHandlers): {
    command: string | undefined;
    params: {
        [key: string]: any;
    };
    content: string;
} | {
    content: string;
};
export declare function extractCommandValues(content: string, commands: CommandGroup[], members: User[]): {
    command: string | undefined;
    params: {
        [key: string]: any;
    };
};
//# sourceMappingURL=commands.d.ts.map