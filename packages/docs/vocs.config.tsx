import { defineConfig } from "vocs";

export default defineConfig({
  head: () => {
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

        <meta property="fc:frame:button:2" content="Drop a ⭐️" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta
          property="fc:frame:button:2:target"
          content="https://github.com/ephemeraHQ/message-kit"
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
    { text: "XMTP", link: "https://docs.xmtp.org/" },
    { text: "1.1.7-beta.32", link: "/changelog" },
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
      text: "Concepts",

      items: [
        {
          text: "Structure",
          link: "/concepts/structure",
        },
        {
          text: "Messages",
          link: "/concepts/messages",
          collapsed: undefined,
          items: [
            { text: "Text", link: "/concepts/messages/text" },
            { text: "Reply", link: "/concepts/messages/reply" },
            { text: "Skill", link: "/concepts/messages/skill" },
            { text: "Attachment", link: "/concepts/messages/attachment" },
          ],
        },
        {
          text: "Groups",
          link: "/concepts/groups",
        },
        {
          text: "AI Skills",
          link: "/skills",
          items: [
            {
              text: "Reasoning",
              link: "/skills/reasoning",
            },
            {
              text: "Fine Tuning",
              link: "/skills/fine-tuning",
            },
            {
              text: "Prompting",
              link: "/skills/prompting",
            },
            {
              text: "Processing",
              link: "/skills/processing",
            },
            {
              text: "Parsing",
              link: "/skills/parsing",
            },
            {
              text: "Definition",
              link: "/skills/definition",
            },
          ],
        },
      ],
    },

    {
      text: "Use cases",
      items: [
        {
          text: "Gm",
          link: "/templates/gm",
        },
        {
          text: "Agent",
          link: "/templates/agent",
          collapsed: true,
          items: [
            {
              text: "Handlers",
              items: [
                {
                  text: "ENS",
                  link: "/templates/agent/handlers/ens",
                },
              ],
            },
            {
              text: "Skills",
              link: "/templates/agent/skills",
            },
            {
              text: "Prompt",
              link: "/templates/agent/prompt",
            },
            {
              text: "Index",
              link: "/templates/agent",
            },
          ],
        },
        {
          text: "Group",
          link: "/templates/group",
          collapsed: true,
          items: [
            {
              text: "Handlers",
              items: [
                {
                  text: "Tipping",
                  link: "/templates/group/handlers/tipping",
                },
                {
                  text: "Games",
                  link: "/templates/group/handlers/games",
                },
                {
                  text: "Transactions",
                  link: "/templates/group/handlers/transactions",
                },
                {
                  text: "Helpers",
                  link: "/templates/group/handlers/helpers",
                },
              ],
            },
            {
              text: "Skills",
              link: "/templates/group/skills",
            },
            {
              text: "Prompt",
              link: "/templates/group/prompt",
            },
            {
              text: "Index",
              link: "/templates/group",
            },
          ],
        },
      ],
    },

    {
      text: "Middlewares",
      items: [
        {
          text: "Cron",
          link: "/middlewares/cron",
        },
        {
          text: "Redis",
          link: "/middlewares/redis",
        },
        {
          text: "Vision",
          link: "/middlewares/vision",
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
          text: "LearnWeb3",
          link: "/middlewares/learnweb3",
        },
        {
          text: "Lowdb",
          link: "/middlewares/lowdb",
        },
        {
          text: "Gpt",
          link: "/middlewares/gpt",
        },
        {
          text: "Resolver",
          link: "/middlewares/resolver",
        },
      ],
    },
    {
      text: "Open Frames",
      link: "/frames",
      collapsed: true,
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
