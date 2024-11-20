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
  iconUrl: "/messagekit -logo.png",
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
    { text: "Guidelines", link: "/concepts/guidelines" },
    { text: "@xmtp/message-kit@1.1.10", link: "/changelog" },
  ],
  editLink: {
    pattern:
      "https://github.com/ephemeraHQ/message-kit/blob/main/packages/docs/pages/:path",
    text: "Suggest changes to this page",
  },
  sidebar: [
    {
      text: "Quickstart",
      link: "/quickstart",
    },
    {
      text: "Examples",
      link: "/examples",
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
          link: "/concepts/types",
        },
        {
          text: "Groups",
          link: "/concepts/groups",
        },
        {
          text: "Usernames",
          link: "/concepts/usernames",
        },
        {
          text: "Deployment",
          link: "/concepts/deployment",
        },
      ],
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
          text: "Scenarios",
          link: "/skills/scenarios",
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

    {
      text: "Use cases",
      items: [
        {
          text: "Ens agent",
          link: "/templates/agent",
        },
        {
          text: "Group bot",
          link: "/templates/group",
        },
        {
          text: "Gpt",
          link: "/templates/gpt",
        },
        {
          text: "Gated group",
          link: "/templates/gated",
        },
      ],
    },

    {
      text: "Middleware",
      items: [
        {
          text: "Overview",
          link: "/middleware",
        },
        {
          text: "Open Frames",
          items: [
            {
              text: "Frames.js",
              link: "/middleware/open-frames/framesjs",
            },
            {
              text: "OnchainKit",
              link: "/middleware/open-frames/onchainkit",
            },
            {
              text: "Frog",
              link: "/middleware/open-frames/frog",
            },
          ],
        },
      ],
    },
  ],
});
