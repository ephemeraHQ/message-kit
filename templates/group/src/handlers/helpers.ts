import { XMTPContext } from "@xmtp/message-kit";

import type { skillAction } from "@xmtp/message-kit";

export const registerSkill: skillAction[] = [
  {
    skill: "/help",
    examples: ["/help"],
    handler: handleHelp,
    description: "Get help with the bot.",
    params: {},
  },
  {
    skill: "/id",
    examples: ["/id"],
    handler: handleHelp,
    description: "Get the group ID.",
    params: {},
  },
];

export async function handleHelp(context: XMTPContext) {
  const {
    message: {
      content: { skill },
    },
    group,
    skills,
  } = context;

  if (skill == "help") {
    const intro =
      "Available experiences:\n" +
      skills
        ?.flatMap((app) => app.skills)
        .map((skill) => `${skill.skill} - ${skill.description}`)
        .join("\n") +
      "\nUse these skills to interact with specific apps.";
    context.send(intro);
  } else if (skill == "id") {
    if (!group?.id) {
      context.send("This skill only works in group chats.");
      return;
    }
    context.send(group?.id);
  }
}
