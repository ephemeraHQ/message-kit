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
  outputDir: "dist", // Specify 'dist' as the output directory

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
      text: "Concepts",
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
        {
          text: "Deployment",
          link: "/concepts/deployment/railway",
        },
      ],
    },

    {
      text: "Examples",
      items: [
        {
          text: "Introduction",
          link: "/examples/introduction",
        },
        {
          text: "Templates",
          items: [
            {
              text: "Subscription",
              link: "/examples/templates/Subscription",
            },
            {
              text: "GPT",
              link: "/examples/templates/gpt",
            },
            {
              text: "Group",
              link: "/examples/templates/group",
            },
          ],
        },
        {
          text: "Integrations",
          items: [
            {
              text: "Redis",
              link: "/examples/integrations/redis",
            },
            {
              text: "GPT",
              link: "/examples/integrations/gpt",
            },
            {
              text: "Cron",
              link: "/examples/integrations/cron",
            },
            {
              text: "Parse commands",
              link: "/examples/integrations/commands",
            },
          ],
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
  ],
});
