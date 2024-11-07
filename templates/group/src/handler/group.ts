import { HandlerContext } from "@xmtp/message-kit";

export async function handler(context: HandlerContext) {
  const {
    skills,
    group,
    message: {
      content: { command },
    },
  } = context;

  if (command == "help") {
    const intro =
      "Available experiences:\n" +
      skills
        ?.flatMap((app) => app.skills)
        .map((skill) => `${skill.command} - ${skill.description}`)
        .join("\n") +
      "\nUse these skills to interact with specific apps.";
    context.send(intro);
  } else if (command == "id") {
    context.send(context.group?.id);
  }
}
