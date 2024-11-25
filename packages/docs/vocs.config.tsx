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
  rootDir: ".",
  iconUrl: {
    light: "/messagekit-logo.png",
    dark: "/messagekit-logo.png",
  },
  theme: {
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
  topNav: [{ text: "v1.2.6", link: "/changelog" }],
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
          text: "Groups",
          link: "/concepts/groups",
        },
        {
          text: "Usernames",
          link: "/concepts/usernames",
        },
        {
          text: "Frames",
          link: "/concepts/frames",
        },
      ],
    },
    {
      text: "AI Skills",
      items: [
        {
          text: "Example",
          link: "/templates/agent",
        },
        {
          text: "Library",
          link: "/skills/library",
        },
        {
          text: "Overview",
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
          text: "Deployment",
          link: "/middleware/railway",
        },
      ],
    },
    {
      text: "Changelog",
      link: "/changelog",
    },
    {
      text: "Guidelines",
      link: "/concepts/guidelines",
    },
  ],
});
