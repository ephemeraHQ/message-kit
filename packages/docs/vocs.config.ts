import { defineConfig } from "vocs";

export default defineConfig({
  title: "MessageKit",
  rootDir: ".",
  theme: {
    colorScheme: "dark",
    accentColor: {
      light: "#F04D23",
      dark: "#F04D23",
    },
  },
  socials: [
    {
      icon: "github",
      link: "https://github.com/xmtp-labs/message-kit",
    },
  ],
  editLink: {
    pattern:
      "https://github.com/xmtp-labs/message-kit/packages/docs/main/:path",
    text: "Suggest changes to this page",
  },
  sidebar: [
    {
      text: "Installation",
      link: "/installation",
    },
    {
      text: "Quickstart",
      link: "/quickstart",
    },
    {
      text: "App Directory",
      link: "/directory",
    },
    {
      text: "Deployment",
      link: "/deployment",
    },
    {
      text: "Concepts",
      collapsed: false,
      items: [
        {
          text: "Structure",
          link: "/concepts/structure",
        },
        {
          text: "Messages",
          link: "/concepts/messages",
        },
        {
          text: "Types",
          items: [
            { text: "Text", link: "/concepts/content-types/text" },
            { text: "Reaction", link: "/concepts/content-types/reaction" },
            { text: "Reply", link: "/concepts/content-types/reply" },
            { text: "Command", link: "/concepts/content-types/command" },
            { text: "Group updates", link: "/concepts/content-types/updates" },
          ],
        },
        {
          text: "Commands",
          link: "/concepts/commands",
        },
        {
          text: "Conversations",
          link: "/concepts/conversations",
        },

        {
          text: "Access",
          link: "/concepts/access",
        },
      ],
    },

    {
      text: "Use cases",
      collapsed: false,
      items: [
        {
          text: "Group",
          link: "/use-cases/group",
          items: [
            {
              text: "GPT",
              link: "/use-cases/group/gpt",
            },
            {
              text: "Tipping",
              link: "/use-cases/group/tipping",
            },
            {
              text: "Betting",
              link: "/use-cases/group/betting",
            },
            {
              text: "Games",
              link: "/use-cases/group/games",
            },
            {
              text: "Frames",
              link: "/use-cases/group/frames",
            },
            {
              text: "Admin",
              link: "/use-cases/group/admin",
            },
          ],
        },
        {
          text: "Subscription",
          link: "/use-cases/subscription",
          items: [
            {
              text: "Database",
              link: "/use-cases/subscription/database",
            },
            {
              text: "Cron",
              link: "/use-cases/subscription/cron",
            },
          ],
        },
      ],
    },
    {
      text: "Frames",
      collapsed: false,
      link: "/frames",
      items: [
        {
          text: "Introduction",
          link: "/frames",
        },
        {
          text: "Frameworks",
          items: [
            {
              text: "OnchainKit",
              link: "/frames/frameworks/onchainkit",
            },
            {
              text: "Frames.js",
              link: "/frames/frameworks/framesjs",
            },
            {
              text: "Frog",
              link: "/frames/frameworks/frog",
            },
          ],
        },
        {
          text: "Tutorials",
          items: [
            {
              text: "Subscribe",
              link: "/frames/tutorials/subscribe",
            },
            {
              text: "Transactions",
              link: "/frames/tutorials/transactions",
            },
          ],
        },
      ],
    },
  ],
});
