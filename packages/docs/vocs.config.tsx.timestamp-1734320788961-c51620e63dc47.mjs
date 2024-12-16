// vocs.config.tsx
import { defineConfig } from "file:///Users/fabrizioguespe/DevRel/message-kit/node_modules/vocs/_lib/index.js";
import { Fragment, jsx, jsxs } from "file:///Users/fabrizioguespe/DevRel/message-kit/node_modules/react/jsx-runtime.js";
var vocs_config_default = defineConfig({
  head: () => {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width" }),
      /* @__PURE__ */ jsx("meta", { property: "og:title", content: "MessageKit" }),
      /* @__PURE__ */ jsx("meta", { property: "og:image", content: "https://message-kit.org/hero.jpg" }),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame", content: "vNext" }),
      /* @__PURE__ */ jsx("meta", { property: "of:version", content: "vNext" }),
      /* @__PURE__ */ jsx("meta", { property: "of:accepts:xmtp", content: "vNext" }),
      /* @__PURE__ */ jsx("meta", { property: "of:image", content: "https://message-kit.org/hero.jpg" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          property: "fc:frame:image",
          content: "https://message-kit.org/hero.jpg"
        }
      ),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame:button:1", content: "Docs" }),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame:button:1:action", content: "link" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          property: "fc:frame:button:1:target",
          content: "https://message-kit.org/"
        }
      ),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame:button:2", content: "Drop a \u2B50\uFE0F" }),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame:button:2:action", content: "link" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          property: "fc:frame:button:2:target",
          content: "https://github.com/ephemeraHQ/message-kit"
        }
      ),
      /* @__PURE__ */ jsx("meta", { property: "og:site_name", content: "MessageKit" }),
      /* @__PURE__ */ jsx("meta", { name: "twitter:card", content: "summary_large_image" }),
      /* @__PURE__ */ jsx("meta", { name: "twitter:site", content: "@MessageKit" }),
      /* @__PURE__ */ jsx("meta", { name: "twitter:title", content: "MessageKit" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          name: "twitter:description",
          content: "MessageKit is a powerful tool for managing your messages."
        }
      ),
      /* @__PURE__ */ jsx("meta", { name: "twitter:image", content: "https://message-kit.org/hero.jpg" }),
      /* @__PURE__ */ jsx(
        "script",
        {
          src: "https://plausible.io/js/script.outbound-links.js",
          "data-domain": "message-kit.org",
          defer: true
        }
      )
    ] });
  },
  ogImageUrl: {
    "/": "/hero.jpg",
    "/docs": "/hero.jpg"
  },
  title: "MessageKit",
  rootDir: ".",
  iconUrl: {
    light: "/messagekit-logo.png",
    dark: "/messagekit-logo.png"
  },
  theme: {
    accentColor: {
      light: "#FA6977",
      dark: "#FA6977"
    }
  },
  socials: [
    {
      icon: "github",
      link: "https://github.com/ephemeraHQ/message-kit"
    }
  ],
  topNav: [{ text: "v1.2.29", link: "/changelog" }],
  editLink: {
    pattern: "https://github.com/ephemeraHQ/message-kit/blob/main/packages/docs/pages/:path",
    text: "Suggest changes to this page"
  },
  sidebar: [
    {
      text: "Quickstart",
      link: "/quickstart"
    },
    {
      text: "Fun stuff",
      items: [
        {
          text: "Concierge",
          link: "/skills/concierge"
        },
        {
          text: "Frames",
          link: "/ux/frames"
        },
        {
          text: "Wallet service",
          link: "/ux/wallet-service"
        },
        {
          text: "Groups",
          link: "/ux/groups"
        }
      ]
    },
    {
      text: "Community",
      items: [
        {
          text: "Skills",
          link: "/community/skills"
        },
        {
          text: "Plugins",
          link: "/community/plugins"
        },
        {
          text: "Templates",
          link: "/community/templates"
        },
        {
          text: "Vibes",
          link: "/community/vibes"
        },
        {
          text: "Projects",
          link: "/community/projects"
        }
      ]
    },
    {
      text: "Fundations",
      items: [
        {
          text: "Agents",
          link: "/concepts/agents"
        },
        {
          text: "Skills",
          link: "/concepts/skills"
        },
        {
          text: "XMTP",
          link: "/concepts/xmtp"
        },
        {
          text: "Usernames",
          link: "/plugins/resolver"
        }
      ]
    },
    {
      text: "Contribute",
      link: "/contribute"
    },
    {
      text: "Deployment",
      link: "/deployment"
    },
    {
      text: "Guidelines",
      link: "/guidelines"
    },
    {
      text: "Changelog",
      link: "/changelog"
    }
  ]
});
export {
  vocs_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidm9jc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBoZWFkOiAoKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDw+XG4gICAgICAgIDxtZXRhIGNoYXJTZXQ9XCJ1dGYtOFwiIC8+XG4gICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGhcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOnRpdGxlXCIgY29udGVudD1cIk1lc3NhZ2VLaXRcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOmltYWdlXCIgY29udGVudD1cImh0dHBzOi8vbWVzc2FnZS1raXQub3JnL2hlcm8uanBnXCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZVwiIGNvbnRlbnQ9XCJ2TmV4dFwiIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwib2Y6dmVyc2lvblwiIGNvbnRlbnQ9XCJ2TmV4dFwiIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwib2Y6YWNjZXB0czp4bXRwXCIgY29udGVudD1cInZOZXh0XCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZjppbWFnZVwiIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2Uta2l0Lm9yZy9oZXJvLmpwZ1wiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgcHJvcGVydHk9XCJmYzpmcmFtZTppbWFnZVwiXG4gICAgICAgICAgY29udGVudD1cImh0dHBzOi8vbWVzc2FnZS1raXQub3JnL2hlcm8uanBnXCJcbiAgICAgICAgLz5cblxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cImZjOmZyYW1lOmJ1dHRvbjoxXCIgY29udGVudD1cIkRvY3NcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cImZjOmZyYW1lOmJ1dHRvbjoxOmFjdGlvblwiIGNvbnRlbnQ9XCJsaW5rXCIgLz5cbiAgICAgICAgPG1ldGFcbiAgICAgICAgICBwcm9wZXJ0eT1cImZjOmZyYW1lOmJ1dHRvbjoxOnRhcmdldFwiXG4gICAgICAgICAgY29udGVudD1cImh0dHBzOi8vbWVzc2FnZS1raXQub3JnL1wiXG4gICAgICAgIC8+XG5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246MlwiIGNvbnRlbnQ9XCJEcm9wIGEgXHUyQjUwXHVGRTBGXCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246MjphY3Rpb25cIiBjb250ZW50PVwibGlua1wiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246Mjp0YXJnZXRcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL2dpdGh1Yi5jb20vZXBoZW1lcmFIUS9tZXNzYWdlLWtpdFwiXG4gICAgICAgIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6c2l0ZV9uYW1lXCIgY29udGVudD1cIk1lc3NhZ2VLaXRcIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpjYXJkXCIgY29udGVudD1cInN1bW1hcnlfbGFyZ2VfaW1hZ2VcIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpzaXRlXCIgY29udGVudD1cIkBNZXNzYWdlS2l0XCIgLz5cbiAgICAgICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6dGl0bGVcIiBjb250ZW50PVwiTWVzc2FnZUtpdFwiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgbmFtZT1cInR3aXR0ZXI6ZGVzY3JpcHRpb25cIlxuICAgICAgICAgIGNvbnRlbnQ9XCJNZXNzYWdlS2l0IGlzIGEgcG93ZXJmdWwgdG9vbCBmb3IgbWFuYWdpbmcgeW91ciBtZXNzYWdlcy5cIlxuICAgICAgICAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjppbWFnZVwiIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2Uta2l0Lm9yZy9oZXJvLmpwZ1wiIC8+XG4gICAgICAgIDxzY3JpcHRcbiAgICAgICAgICBzcmM9XCJodHRwczovL3BsYXVzaWJsZS5pby9qcy9zY3JpcHQub3V0Ym91bmQtbGlua3MuanNcIlxuICAgICAgICAgIGRhdGEtZG9tYWluPVwibWVzc2FnZS1raXQub3JnXCJcbiAgICAgICAgICBkZWZlclxuICAgICAgICAvPlxuICAgICAgPC8+XG4gICAgKTtcbiAgfSxcbiAgb2dJbWFnZVVybDoge1xuICAgIFwiL1wiOiBcIi9oZXJvLmpwZ1wiLFxuICAgIFwiL2RvY3NcIjogXCIvaGVyby5qcGdcIixcbiAgfSxcbiAgdGl0bGU6IFwiTWVzc2FnZUtpdFwiLFxuICByb290RGlyOiBcIi5cIixcbiAgaWNvblVybDoge1xuICAgIGxpZ2h0OiBcIi9tZXNzYWdla2l0LWxvZ28ucG5nXCIsXG4gICAgZGFyazogXCIvbWVzc2FnZWtpdC1sb2dvLnBuZ1wiLFxuICB9LFxuICB0aGVtZToge1xuICAgIGFjY2VudENvbG9yOiB7XG4gICAgICBsaWdodDogXCIjRkE2OTc3XCIsXG4gICAgICBkYXJrOiBcIiNGQTY5NzdcIixcbiAgICB9LFxuICB9LFxuICBzb2NpYWxzOiBbXG4gICAge1xuICAgICAgaWNvbjogXCJnaXRodWJcIixcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2VwaGVtZXJhSFEvbWVzc2FnZS1raXRcIixcbiAgICB9LFxuICBdLFxuICB0b3BOYXY6IFt7IHRleHQ6IFwidjEuMi4yOVwiLCBsaW5rOiBcIi9jaGFuZ2Vsb2dcIiB9XSxcbiAgZWRpdExpbms6IHtcbiAgICBwYXR0ZXJuOlxuICAgICAgXCJodHRwczovL2dpdGh1Yi5jb20vZXBoZW1lcmFIUS9tZXNzYWdlLWtpdC9ibG9iL21haW4vcGFja2FnZXMvZG9jcy9wYWdlcy86cGF0aFwiLFxuICAgIHRleHQ6IFwiU3VnZ2VzdCBjaGFuZ2VzIHRvIHRoaXMgcGFnZVwiLFxuICB9LFxuICBzaWRlYmFyOiBbXG4gICAge1xuICAgICAgdGV4dDogXCJRdWlja3N0YXJ0XCIsXG4gICAgICBsaW5rOiBcIi9xdWlja3N0YXJ0XCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkZ1biBzdHVmZlwiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQ29uY2llcmdlXCIsXG4gICAgICAgICAgbGluazogXCIvc2tpbGxzL2NvbmNpZXJnZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJGcmFtZXNcIixcbiAgICAgICAgICBsaW5rOiBcIi91eC9mcmFtZXNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiV2FsbGV0IHNlcnZpY2VcIixcbiAgICAgICAgICBsaW5rOiBcIi91eC93YWxsZXQtc2VydmljZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJHcm91cHNcIixcbiAgICAgICAgICBsaW5rOiBcIi91eC9ncm91cHNcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkNvbW11bml0eVwiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiU2tpbGxzXCIsXG4gICAgICAgICAgbGluazogXCIvY29tbXVuaXR5L3NraWxsc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJQbHVnaW5zXCIsXG4gICAgICAgICAgbGluazogXCIvY29tbXVuaXR5L3BsdWdpbnNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiVGVtcGxhdGVzXCIsXG4gICAgICAgICAgbGluazogXCIvY29tbXVuaXR5L3RlbXBsYXRlc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJWaWJlc1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbW11bml0eS92aWJlc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJQcm9qZWN0c1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbW11bml0eS9wcm9qZWN0c1wiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiRnVuZGF0aW9uc1wiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQWdlbnRzXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMvYWdlbnRzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlNraWxsc1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbmNlcHRzL3NraWxsc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJYTVRQXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMveG10cFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJVc2VybmFtZXNcIixcbiAgICAgICAgICBsaW5rOiBcIi9wbHVnaW5zL3Jlc29sdmVyXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJDb250cmlidXRlXCIsXG4gICAgICBsaW5rOiBcIi9jb250cmlidXRlXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkRlcGxveW1lbnRcIixcbiAgICAgIGxpbms6IFwiL2RlcGxveW1lbnRcIixcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiR3VpZGVsaW5lc1wiLFxuICAgICAgbGluazogXCIvZ3VpZGVsaW5lc1wiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJDaGFuZ2Vsb2dcIixcbiAgICAg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
