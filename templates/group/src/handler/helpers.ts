import { HandlerContext } from "@xmtp/message-kit";

export async function handler(context: HandlerContext) {
  const {
    skills,
    message: {
      content: { skill },
    },
    group,
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
