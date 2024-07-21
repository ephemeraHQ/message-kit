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
      text: "App directory",
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
          items: [
            { text: "Text", link: "/concepts/messages/text" },
            { text: "Reaction", link: "/concepts/messages/reaction" },
            { text: "Reply", link: "/concepts/messages/reply" },
            { text: "Command", link: "/concepts/messages/command" },
            { text: "Attachment", link: "/concepts/messages/attachment" },
            {
              text: "Group update",
              link: "/concepts/messages/group-update",
            },
          ],
        },
        {
          text: "Commands",
          link: "/concepts/commands",
        },
        {
          text: "Groups",
          link: "/concepts/groups",
        },
        /*
        {
          text: "Access",
          link: "/concepts/access",
        },*/
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
              text: "Agents",
              link: "/use-cases/group/agents",
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
              text: "Split Payments",
              link: "/use-cases/group/payments",
            },
            {
              text: "Admin",
              link: "/use-cases/group/admin",
            },
            {
              text: "Loyalty",
              link: "/use-cases/group/loyalty",
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
