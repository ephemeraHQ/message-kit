import type { SkillGroup } from "@xmtp/message-kit";

export const skills: SkillGroup[] = [
  {
    name: "Group Id",
    description: "Create and get group id.",
    skills: [
      {
        skill: "/create",
        examples: ["/create"],
        adminOnly: true,
        params: {},
        description: "Create a new group.",
      },
      {
        skill: "/id",
        examples: ["/id"],
        adminOnly: true,
        params: {},
        description: "Get group id.",
      },
    ],
  },
];
