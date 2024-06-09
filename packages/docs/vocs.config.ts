import { defineConfig } from "vocs";

export default defineConfig({
  title: "Botkit",
  theme: {
    colorScheme: "dark",
    accentColor: {
      light: "#F04D23",
      dark: "#F04D23",
    },
  },
  outputDir: "dist",
  socials: [
    {
      icon: "github",
      link: "https://github.com/xmtp-labs/botkit",
    },
  ],
  editLink: {
    pattern: "https://github.com/xmtp-labs/botkit/packages/docs/main/:path",
    text: "Suggest changes to this page",
  },
  sidebar: [
    {
      text: "Installation",
      link: "/installation",
    },
    {
      text: "Deployment",
      link: "/concepts/deployment/railway",
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
          ],
        },
        {
          text: "Commands",
          link: "/concepts/commands",
        },

        {
          text: "Access",
          link: "/concepts/access",
        },
      ],
    },

    {
      text: "Examples",
      link: "/examples/",
      collapsed: false,
      items: [
        {
          text: "Introduction",
          link: "/examples/",
        },
        {
          text: "Subscription",
          link: "/examples/subscription",
          items: [
            {
              text: "Redis",
              link: "/examples/subscription/redis",
            },
            {
              text: "Cron",
              link: "/examples/subscription/cron",
            },
          ],
        },
        {
          text: "Group",
          link: "/examples/group",
          items: [
            {
              text: "GPT",
              link: "/examples/group/gpt",
            },
            {
              text: "Tipping",
              link: "/examples/group/tipping",
            },
            {
              text: "Bet",
              link: "/examples/group/bet",
            },
            {
              text: "Games",
              link: "/examples/group/games",
            },
            {
              text: "Frames",
              link: "/examples/group/frames",
            },
            {
              text: "Admin",
              link: "/examples/group/admin",
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
