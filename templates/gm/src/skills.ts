import type { SkillGroup } from "@xmtp/message-kit";

export const skills: SkillGroup[] = [
  {
    name: "Group bot",
    tag: "@bot",
    description: "Group bot for tipping and transactions.",
    skills: [
      {
        skill: "/tip [usernames] [amount] [token]",
        triggers: ["/tip"],
        examples: ["/tip @vitalik 10 usdc"],
        description: "Tip users in a specified token.",
        handler: undefined,
        params: {
          username: {
            default: "",
            plural: true,
            type: "username",
          },
          amount: {
            default: 10,
            type: "number",
          },
        },
      },
    ],
  },
];
