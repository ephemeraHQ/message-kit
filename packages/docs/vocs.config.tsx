import { defineConfig } from "vocs";

export default defineConfig({
  head: () => {
    return (
      <>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <meta property="og:title" content="MessageKit" />
        <meta property="og:image" content="https://message-kit.org/hero.jpg" />
        <meta property="fc:frame" content="vNext" />
        <meta property="of:version" content="vNext" />
        <meta property="of:accepts:xmtp" content="vNext" />
        <meta property="of:image" content="https://message-kit.org/hero.jpg" />
        <meta
          property="fc:frame:image"
          content="https://message-kit.org/hero.jpg"
        />

        <meta property="fc:frame:button:1" content="Docs" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta
          property="fc:frame:button:1:target"
          content="https://message-kit.org/"
        />

        <meta property="fc:frame:button:2" content="Drop a ⭐️" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta
          property="fc:frame:button:2:target"
          content="https://github.com/ephemeraHQ/message-kit"
        />
        <meta property="og:site_name" content="MessageKit" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@MessageKit" />
        <meta name="twitter:title" content="MessageKit" />
        <meta
          name="twitter:description"
          content="MessageKit is a powerful tool for managing your messages."
        />
        <meta name="twitter:image" content="https://message-kit.org/hero.jpg" />
        <script
          src="https://plausible.io/js/script.outbound-links.js"
          data-domain="message-kit.org"
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
  topNav: [{ text: "v1.2.30", link: "/changelog" }],
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
      text: "Fun stuff",
      items: [
        {
          text: "Concierge",
          link: "/skills/concierge",
        },
        {
          text: "Frames",
          link: "/ux/frames",
        },
        {
          text: "Wallet service",
          link: "/ux/wallet-service",
        },
        {
          text: "Groups",
          link: "/ux/groups",
        },
      ],
    },
    {
      text: "Community",
      items: [
        {
          text: "Skills",
          link: "/community/skills",
        },
        {
          text: "Plugins",
          link: "/community/plugins",
        },
        {
          text: "Templates",
          link: "/community/templates",
        },
        {
          text: "Vibes",
          link: "/community/vibes",
        },
        {
          text: "Projects",
          link: "/community/projects",
        },
      ],
    },
    {
      text: "Fundations",
      items: [
        {
          text: "Agents",
          link: "/concepts/agents",
        },
        {
          text: "Skills",
          link: "/concepts/skills",
        },
        {
          text: "XMTP",
          link: "/concepts/xmtp",
        },
        {
          text: "Usernames",
          link: "/plugins/resolver",
        },
      ],
    },
    {
      text: "Contribute",
      link: "/contribute",
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
      text: "Changelog",
      link: "/changelog",
    },
  ],
});
