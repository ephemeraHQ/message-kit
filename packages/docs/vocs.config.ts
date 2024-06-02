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
      text: "Playground",
      link: "/playground",
    },
    {
      text: "Structure",
      link: "/structure",
    },
    {
      text: "Content Types",
      link: "/content-types",
      items: [
        { text: "Text", link: "/content-types/text" },
        { text: "Bot", link: "/content-types/bot" },
        { text: "Reaction", link: "/content-types/reaction" },
        { text: "Reply", link: "/content-types/reply" },
        {
          text: "Deeplinks",
          link: "/content-types/deeplinks",
        },
      ],
    },
    {
      text: "Templates",
      link: "/examples",
      items: [
        {
          text: "Gm",
          link: "/examples/gm",
        },
        {
          text: "Conversational",
          link: "/examples/conversational",
        },
        {
          text: "GPT",
          link: "/examples/gpt",
        },
        {
          text: "Group",
          link: "/examples/group",
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
          text: "Commands",
          link: "/middleware/commands",
        },
      ],
    },
    {
      text: "Open Frames",
      link: "/open-frames",
      items: [
        {
          text: "OnchainKit",
          link: "/open-frames/onchainkit",
        },
        {
          text: "Frames.js",
          link: "/open-frames/framesjs",
        },
        {
          text: "Frog",
          link: "/open-frames/frog",
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
