import { defineConfig } from "vocs";

export default defineConfig({
  head: () => {
    // console.log(`Generating head content... ${new Date().toISOString()}`)
    return (
      <>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <meta property="og:title" content="MessageKit" />
        <meta
          property="og:image"
          content="https://messagekit.ephemerahq.com/hero.jpg"
        />
        <meta property="fc:frame" content="vNext" />
        <meta property="of:version" content="vNext" />
        <meta property="of:accepts:xmtp" content="vNext" />
        <meta
          property="of:image"
          content="https://messagekit.ephemerahq.com/hero.jpg"
        />
        <meta
          property="fc:frame:image"
          content="https://messagekit.ephemerahq.com/hero.jpg"
        />

        <meta property="fc:frame:button:1" content="Docs" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta
          property="fc:frame:button:1:target"
          content="https://messagekit.ephemerahq.com/"
        />

        <meta property="fc:frame:button:2" content="Examples" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta
          property="fc:frame:button:2:target"
          content="https://messagekit.ephemerahq.com/"
        />

        <script
          src="https://plausible.io/js/script.outbound-links.js"
          data-domain="messagekit.ephemerahq.com"
          defer
        />
      </>
    );
  },
  ogImageUrl: {
    "/": "/hero.jpg",
    "/docs": "/hero.jpg",
  },
  title: "MessageKit",
  iconUrl: "/messagekit-logo.png",
  rootDir: ".",
  theme: {
    colorScheme: "dark",
    accentColor: {
      light: "#FA6977",
      dark: "#FA6977",
    },
  },
  socials: [
    {
      icon: "github",
      link: "https://github.com/ephemeraHQ/message-kit",
    },
  ],
  topNav: [
    {
      text: "Converse app",
      link: "https://converse.xyz",
    },
    { text: "XMTP Docs", link: "https://docs.xmtp.org/" },
  ],
  editLink: {
    pattern:
      "https://github.com/ephemeraHQ/message-kit/packages/docs/main/:path",
    text: "Suggest changes to this page",
  },
  sidebar: [
    {
      text: "Installation",
      link: "/installation",
    },
    {
      text: "Directory",
      link: "/directory",
    },
    {
      text: "Quickstarts",
      link: "/quickstarts",
    },
    {
      text: "Deployment",
      link: "/deployment",
    },
    {
      text: "Guidelines",
      link: "/guidelines",
    },
    {
      text: "Templates",
      items: [
        {
          text: "Gm bot",
          link: "/templates/gm",
        },
        {
          text: "Ens agent",
          link: "/templates/ens-agent",
        },
        {
          text: "Group chat",
          link: "/templates/group",
          items: [
            {
              text: "Agents",
              link: "/templates/group/agents",
            },
            {
              text: "Tipping",
              link: "/templates/group/tipping",
            },
            {
              text: "Games",
              link: "/templates/group/games",
            },
            {
              text: "Transactions",
              link: "/templates/group/transactions",
            },
            {
              text: "Split Payments",
              link: "/templates/group/splitpayments",
            },
            {
              text: "Loyalty",
              link: "/templates/group/loyalty",
            },
          ],
        },
      ],
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
            { text: "Reply", link: "/concepts/messages/reply" },
            { text: "Command", link: "/concepts/messages/command" },
            { text: "Attachment", link: "/concepts/messages/attachment" },
          ],
        },
        {
          text: "Commands",
          link: "/concepts/commands",
        },
        {
          text: "Intent",
          link: "/concepts/intent",
        },
        {
          text: "Groups",
          link: "/concepts/groups",
        },
      ],
    },

    {
      text: "Middlewares",
      collapsed: false,
      items: [
        {
          text: "OpenAI",
          link: "/middlewares/openai",
        },
        {
          text: "Cron",
          link: "/middlewares/cron",
        },
        {
          text: "Redis",
          link: "/middlewares/redis",
        },
        {
          text: "Stackso",
          link: "/middlewares/stackso",
        },
        {
          text: "Notion",
          link: "/middlewares/notion",
        },
        {
          text: "Resolver",
          link: "/middlewares/resolver",
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
