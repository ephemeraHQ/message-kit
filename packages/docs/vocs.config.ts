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
            { text: "Image", link: "/concepts/content-types/images" },
            {
              text: "Group update",
              link: "/concepts/content-types/group-update",
            },
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
          text: "Group chat",
          link: "/use-cases/group",
          items: [
            {
              text: "AI",
              link: "/use-cases/group/ai",
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
              text: "Transactions",
              link: "/use-cases/group/transactions",
            },
            {
              text: "Admin",
              link: "/use-cases/group/admin",
            },
          ],
        },
        {
          text: "One-to-one",
          link: "/use-cases/one-to-one",
          items: [
            {
              text: "Subscribe",
              link: "/use-cases/one-to-one/subscribe",
            },
            {
              text: "Broadcast",
              link: "/use-cases/one-to-one/broadcast",
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
