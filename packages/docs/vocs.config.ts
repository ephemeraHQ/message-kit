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
      text: "Structure",
      link: "/structure",
    },
    {
      text: "Commands",
      link: "/commands",
    },
    {
      text: "Access",
      link: "/access",
    },
    {
      text: "Examples",
      link: "/examples",
    },
    {
      text: "Content Types",
      items: [
        { text: "Text", link: "/content-types/text" },
        { text: "Reaction", link: "/content-types/reaction" },
        { text: "Reply", link: "/content-types/reply" },
        { text: "Bot", link: "/content-types/bot" },
        {
          text: "Deeplinks",
          link: "/content-types/deeplinks",
        },
      ],
    },
    {
      text: "Templates",
      items: [
        {
          text: "Subscription",
          link: "/templates/Subscription",
        },
        {
          text: "GPT",
          link: "/templates/gpt",
        },
        {
          text: "Group",
          link: "/templates/group",
        },
      ],
    },
    {
      text: "Middleware",
      items: [
        {
          text: "Redis",
          link: "/middleware/redis",
        },
        {
          text: "GPT",
          link: "/middleware/gpt",
        },
        {
          text: "Cron",
          link: "/middleware/cron",
        },
        {
          text: "Parse commands",
          link: "/middleware/commands",
        },
      ],
    },
    {
      text: "Open Frames",
      link: "/open-frames",
      items: [
        {
          text: "Introduction",
          link: "/open-frames",
        },
        {
          text: "Frameworks",
          items: [
            {
              text: "OnchainKit",
              link: "/open-frames/frameworks/onchainkit",
            },
            {
              text: "Frames.js",
              link: "/open-frames/frameworks/framesjs",
            },
            {
              text: "Frog",
              link: "/open-frames/frameworks/frog",
            },
          ],
        },
        {
          text: "Tutorials",
          items: [
            {
              text: "Subscribe",
              link: "/open-frames/tutorials/subscribe",
            },
            {
              text: "Transactions",
              link: "/open-frames/tutorials/transactions",
            },
          ],
        },
      ],
    },
    {
      text: "Deployment",
      items: [
        {
          text: "Railway",
          link: "/deployment/railway",
        },
      ],
    },
  ],
});
