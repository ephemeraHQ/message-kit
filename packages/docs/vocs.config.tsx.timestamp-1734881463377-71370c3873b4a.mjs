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
  topNav: [{ text: "Changelog", link: "/changelog" }],
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
      text: "UX",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidm9jc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBoZWFkOiAoKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDw+XG4gICAgICAgIDxtZXRhIGNoYXJTZXQ9XCJ1dGYtOFwiIC8+XG4gICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGhcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOnRpdGxlXCIgY29udGVudD1cIk1lc3NhZ2VLaXRcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOmltYWdlXCIgY29udGVudD1cImh0dHBzOi8vbWVzc2FnZS1raXQub3JnL2hlcm8uanBnXCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZVwiIGNvbnRlbnQ9XCJ2TmV4dFwiIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwib2Y6dmVyc2lvblwiIGNvbnRlbnQ9XCJ2TmV4dFwiIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwib2Y6YWNjZXB0czp4bXRwXCIgY29udGVudD1cInZOZXh0XCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZjppbWFnZVwiIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2Uta2l0Lm9yZy9oZXJvLmpwZ1wiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgcHJvcGVydHk9XCJmYzpmcmFtZTppbWFnZVwiXG4gICAgICAgICAgY29udGVudD1cImh0dHBzOi8vbWVzc2FnZS1raXQub3JnL2hlcm8uanBnXCJcbiAgICAgICAgLz5cblxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cImZjOmZyYW1lOmJ1dHRvbjoxXCIgY29udGVudD1cIkRvY3NcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cImZjOmZyYW1lOmJ1dHRvbjoxOmFjdGlvblwiIGNvbnRlbnQ9XCJsaW5rXCIgLz5cbiAgICAgICAgPG1ldGFcbiAgICAgICAgICBwcm9wZXJ0eT1cImZjOmZyYW1lOmJ1dHRvbjoxOnRhcmdldFwiXG4gICAgICAgICAgY29udGVudD1cImh0dHBzOi8vbWVzc2FnZS1raXQub3JnL1wiXG4gICAgICAgIC8+XG5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246MlwiIGNvbnRlbnQ9XCJEcm9wIGEgXHUyQjUwXHVGRTBGXCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246MjphY3Rpb25cIiBjb250ZW50PVwibGlua1wiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246Mjp0YXJnZXRcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL2dpdGh1Yi5jb20vZXBoZW1lcmFIUS9tZXNzYWdlLWtpdFwiXG4gICAgICAgIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6c2l0ZV9uYW1lXCIgY29udGVudD1cIk1lc3NhZ2VLaXRcIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpjYXJkXCIgY29udGVudD1cInN1bW1hcnlfbGFyZ2VfaW1hZ2VcIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpzaXRlXCIgY29udGVudD1cIkBNZXNzYWdlS2l0XCIgLz5cbiAgICAgICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6dGl0bGVcIiBjb250ZW50PVwiTWVzc2FnZUtpdFwiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgbmFtZT1cInR3aXR0ZXI6ZGVzY3JpcHRpb25cIlxuICAgICAgICAgIGNvbnRlbnQ9XCJNZXNzYWdlS2l0IGlzIGEgcG93ZXJmdWwgdG9vbCBmb3IgbWFuYWdpbmcgeW91ciBtZXNzYWdlcy5cIlxuICAgICAgICAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjppbWFnZVwiIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2Uta2l0Lm9yZy9oZXJvLmpwZ1wiIC8+XG4gICAgICAgIDxzY3JpcHRcbiAgICAgICAgICBzcmM9XCJodHRwczovL3BsYXVzaWJsZS5pby9qcy9zY3JpcHQub3V0Ym91bmQtbGlua3MuanNcIlxuICAgICAgICAgIGRhdGEtZG9tYWluPVwibWVzc2FnZS1raXQub3JnXCJcbiAgICAgICAgICBkZWZlclxuICAgICAgICAvPlxuICAgICAgPC8+XG4gICAgKTtcbiAgfSxcbiAgb2dJbWFnZVVybDoge1xuICAgIFwiL1wiOiBcIi9oZXJvLmpwZ1wiLFxuICAgIFwiL2RvY3NcIjogXCIvaGVyby5qcGdcIixcbiAgfSxcbiAgdGl0bGU6IFwiTWVzc2FnZUtpdFwiLFxuICByb290RGlyOiBcIi5cIixcbiAgaWNvblVybDoge1xuICAgIGxpZ2h0OiBcIi9tZXNzYWdla2l0LWxvZ28ucG5nXCIsXG4gICAgZGFyazogXCIvbWVzc2FnZWtpdC1sb2dvLnBuZ1wiLFxuICB9LFxuICB0aGVtZToge1xuICAgIGFjY2VudENvbG9yOiB7XG4gICAgICBsaWdodDogXCIjRkE2OTc3XCIsXG4gICAgICBkYXJrOiBcIiNGQTY5NzdcIixcbiAgICB9LFxuICB9LFxuICBzb2NpYWxzOiBbXG4gICAge1xuICAgICAgaWNvbjogXCJnaXRodWJcIixcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2VwaGVtZXJhSFEvbWVzc2FnZS1raXRcIixcbiAgICB9LFxuICBdLFxuICB0b3BOYXY6IFt7IHRleHQ6IFwiQ2hhbmdlbG9nXCIsIGxpbms6IFwiL2NoYW5nZWxvZ1wiIH1dLFxuICBlZGl0TGluazoge1xuICAgIHBhdHRlcm46XG4gICAgICBcImh0dHBzOi8vZ2l0aHViLmNvbS9lcGhlbWVyYUhRL21lc3NhZ2Uta2l0L2Jsb2IvbWFpbi9wYWNrYWdlcy9kb2NzL3BhZ2VzLzpwYXRoXCIsXG4gICAgdGV4dDogXCJTdWdnZXN0IGNoYW5nZXMgdG8gdGhpcyBwYWdlXCIsXG4gIH0sXG4gIHNpZGViYXI6IFtcbiAgICB7XG4gICAgICB0ZXh0OiBcIlF1aWNrc3RhcnRcIixcbiAgICAgIGxpbms6IFwiL3F1aWNrc3RhcnRcIixcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiVVhcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkNvbmNpZXJnZVwiLFxuICAgICAgICAgIGxpbms6IFwiL3NraWxscy9jb25jaWVyZ2VcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiRnJhbWVzXCIsXG4gICAgICAgICAgbGluazogXCIvdXgvZnJhbWVzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIldhbGxldCBzZXJ2aWNlXCIsXG4gICAgICAgICAgbGluazogXCIvdXgvd2FsbGV0LXNlcnZpY2VcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiR3JvdXBzXCIsXG4gICAgICAgICAgbGluazogXCIvdXgvZ3JvdXBzXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJDb21tdW5pdHlcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlNraWxsc1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbW11bml0eS9za2lsbHNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiUGx1Z2luc1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbW11bml0eS9wbHVnaW5zXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlRlbXBsYXRlc1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbW11bml0eS90ZW1wbGF0ZXNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiVmliZXNcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb21tdW5pdHkvdmliZXNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiUHJvamVjdHNcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb21tdW5pdHkvcHJvamVjdHNcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkZ1bmRhdGlvbnNcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkFnZW50c1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbmNlcHRzL2FnZW50c1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJTa2lsbHNcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb25jZXB0cy9za2lsbHNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiWE1UUFwiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbmNlcHRzL3htdHBcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiVXNlcm5hbWVzXCIsXG4gICAgICAgICAgbGluazogXCIvcGx1Z2lucy9yZXNvbHZlclwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiQ29udHJpYnV0ZVwiLFxuICAgICAgbGluazogXCIvY29udHJpYnV0ZVwiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJEZXBsb3ltZW50XCIsXG4gICAgICBsaW5rOiBcIi9kZXBsb3ltZW50XCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkd1aWRlbGluZXNcIixcbiAgICAgIGxpbms6IFwiL2d1aWRlbGluZXNcIixcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiQ2hhbmdlbG9nXCIsXG4gICAgICBsaW5r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
