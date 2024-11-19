// vocs.config.tsx
import { defineConfig } from "file:///Users/fabrizioguespe/DevRel/message-kit/node_modules/vocs/_lib/index.js";
import { Fragment, jsx, jsxs } from "file:///Users/fabrizioguespe/DevRel/message-kit/node_modules/react/jsx-runtime.js";
var vocs_config_default = defineConfig({
  head: () => {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width" }),
      /* @__PURE__ */ jsx("meta", { property: "og:title", content: "MessageKit" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          property: "og:image",
          content: "https://messagekit.ephemerahq.com/hero.jpg"
        }
      ),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame", content: "vNext" }),
      /* @__PURE__ */ jsx("meta", { property: "of:version", content: "vNext" }),
      /* @__PURE__ */ jsx("meta", { property: "of:accepts:xmtp", content: "vNext" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          property: "of:image",
          content: "https://messagekit.ephemerahq.com/hero.jpg"
        }
      ),
      /* @__PURE__ */ jsx(
        "meta",
        {
          property: "fc:frame:image",
          content: "https://messagekit.ephemerahq.com/hero.jpg"
        }
      ),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame:button:1", content: "Docs" }),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame:button:1:action", content: "link" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          property: "fc:frame:button:1:target",
          content: "https://messagekit.ephemerahq.com/"
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
      /* @__PURE__ */ jsx(
        "script",
        {
          src: "https://plausible.io/js/script.outbound-links.js",
          "data-domain": "messagekit.ephemerahq.com",
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
  iconUrl: "/messagekit -logo.png",
  rootDir: ".",
  theme: {
    colorScheme: "dark",
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
  topNav: [
    { text: "Guidelines", link: "/concepts/guidelines" },
    { text: "1.1.9-beta.2", link: "/changelog" }
  ],
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
      text: "Examples",
      link: "/examples"
    },
    {
      text: "Concepts",
      items: [
        {
          text: "Structure",
          link: "/concepts/structure"
        },
        {
          text: "Messages",
          link: "/concepts/messages"
        },
        {
          text: "Types",
          link: "/concepts/types"
        },
        {
          text: "Groups",
          link: "/concepts/groups"
        },
        {
          text: "Usernames",
          link: "/concepts/usernames"
        },
        {
          text: "Deployment",
          link: "/concepts/deployment"
        },
        Middle
      ]
    },
    {
      text: "AI Skills",
      link: "/skills",
      items: [
        {
          text: "Reasoning",
          link: "/skills/reasoning"
        },
        {
          text: "Scenarios",
          link: "/skills/scenarios"
        },
        {
          text: "Prompting",
          link: "/skills/prompting"
        },
        {
          text: "Processing",
          link: "/skills/processing"
        },
        {
          text: "Parsing",
          link: "/skills/parsing"
        },
        {
          text: "Definition",
          link: "/skills/definition"
        }
      ]
    },
    {
      text: "Use cases",
      items: [
        {
          text: "Ens agent",
          link: "/templates/agent",
          items: [
            {
              text: "Check",
              link: "/templates/agent/handlers/check"
            },
            {
              text: "Info",
              link: "/templates/agent/handlers/info"
            },
            {
              text: "Cool",
              link: "/templates/agent/handlers/cool"
            },
            {
              text: "Register",
              link: "/templates/agent/handlers/register"
            },
            {
              text: "Renew",
              link: "/templates/agent/handlers/renew"
            },
            {
              text: "Reset",
              link: "/templates/agent/handlers/reset"
            },
            {
              text: "Tip",
              link: "/templates/agent/handlers/tip"
            }
          ]
        },
        {
          text: "Group bot",
          link: "/templates/group",
          items: [
            {
              text: "Tipping",
              link: "/templates/group/tipping"
            },
            {
              text: "Games",
              link: "/templates/group/games"
            },
            {
              text: "Payments",
              link: "/templates/group/payment"
            },
            {
              text: "Helpers",
              link: "/templates/group/helpers"
            }
          ]
        },
        {
          text: "Gpt",
          link: "/templates/gpt"
        }
      ]
    },
    {
      text: "Middleware",
      link: "/middleware",
      items: [
        {
          text: "Cron",
          link: "/middleware/cron"
        },
        {
          text: "Vision",
          link: "/middleware/vision"
        },
        {
          text: "Stackso",
          link: "/middleware/stackso"
        },
        {
          text: "Notion",
          link: "/middleware/notion"
        },
        {
          text: "LearnWeb3",
          link: "/middleware/learnweb3"
        },
        {
          text: "Lowdb",
          link: "/middleware/lowdb"
        },
        {
          text: "GPT",
          link: "/middleware/gpt"
        },
        {
          text: "Resolver",
          link: "/middleware/resolver"
        },
        {
          text: "XMTP Groups",
          link: "/middleware/xmtp"
        },
        {
          text: "Open Frames",
          items: [
            {
              text: "Frames.js",
              link: "/middleware/open-frames/framesjs"
            },
            {
              text: "OnchainKit",
              link: "/middleware/open-frames/onchainkit"
            },
            {
              text: "Frog",
              link: "/middleware/open-frames/frog"
            }
          ]
        }
      ]
    }
  ]
});
export {
  vocs_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidm9jc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBoZWFkOiAoKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDw+XG4gICAgICAgIDxtZXRhIGNoYXJTZXQ9XCJ1dGYtOFwiIC8+XG4gICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGhcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOnRpdGxlXCIgY29udGVudD1cIk1lc3NhZ2VLaXRcIiAvPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIHByb3BlcnR5PVwib2c6aW1hZ2VcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2VraXQuZXBoZW1lcmFocS5jb20vaGVyby5qcGdcIlxuICAgICAgICAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cImZjOmZyYW1lXCIgY29udGVudD1cInZOZXh0XCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZjp2ZXJzaW9uXCIgY29udGVudD1cInZOZXh0XCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZjphY2NlcHRzOnhtdHBcIiBjb250ZW50PVwidk5leHRcIiAvPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIHByb3BlcnR5PVwib2Y6aW1hZ2VcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2VraXQuZXBoZW1lcmFocS5jb20vaGVyby5qcGdcIlxuICAgICAgICAvPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIHByb3BlcnR5PVwiZmM6ZnJhbWU6aW1hZ2VcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2VraXQuZXBoZW1lcmFocS5jb20vaGVyby5qcGdcIlxuICAgICAgICAvPlxuXG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwiZmM6ZnJhbWU6YnV0dG9uOjFcIiBjb250ZW50PVwiRG9jc1wiIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwiZmM6ZnJhbWU6YnV0dG9uOjE6YWN0aW9uXCIgY29udGVudD1cImxpbmtcIiAvPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIHByb3BlcnR5PVwiZmM6ZnJhbWU6YnV0dG9uOjE6dGFyZ2V0XCJcbiAgICAgICAgICBjb250ZW50PVwiaHR0cHM6Ly9tZXNzYWdla2l0LmVwaGVtZXJhaHEuY29tL1wiXG4gICAgICAgIC8+XG5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246MlwiIGNvbnRlbnQ9XCJEcm9wIGEgXHUyQjUwXHVGRTBGXCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246MjphY3Rpb25cIiBjb250ZW50PVwibGlua1wiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246Mjp0YXJnZXRcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL2dpdGh1Yi5jb20vZXBoZW1lcmFIUS9tZXNzYWdlLWtpdFwiXG4gICAgICAgIC8+XG5cbiAgICAgICAgPHNjcmlwdFxuICAgICAgICAgIHNyYz1cImh0dHBzOi8vcGxhdXNpYmxlLmlvL2pzL3NjcmlwdC5vdXRib3VuZC1saW5rcy5qc1wiXG4gICAgICAgICAgZGF0YS1kb21haW49XCJtZXNzYWdla2l0LmVwaGVtZXJhaHEuY29tXCJcbiAgICAgICAgICBkZWZlclxuICAgICAgICAvPlxuICAgICAgPC8+XG4gICAgKTtcbiAgfSxcbiAgb2dJbWFnZVVybDoge1xuICAgIFwiL1wiOiBcIi9oZXJvLmpwZ1wiLFxuICAgIFwiL2RvY3NcIjogXCIvaGVyby5qcGdcIixcbiAgfSxcbiAgdGl0bGU6IFwiTWVzc2FnZUtpdFwiLFxuICBpY29uVXJsOiBcIi9tZXNzYWdla2l0IC1sb2dvLnBuZ1wiLFxuICByb290RGlyOiBcIi5cIixcbiAgdGhlbWU6IHtcbiAgICBjb2xvclNjaGVtZTogXCJkYXJrXCIsXG4gICAgYWNjZW50Q29sb3I6IHtcbiAgICAgIGxpZ2h0OiBcIiNGQTY5NzdcIixcbiAgICAgIGRhcms6IFwiI0ZBNjk3N1wiLFxuICAgIH0sXG4gIH0sXG4gIHNvY2lhbHM6IFtcbiAgICB7XG4gICAgICBpY29uOiBcImdpdGh1YlwiLFxuICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vZXBoZW1lcmFIUS9tZXNzYWdlLWtpdFwiLFxuICAgIH0sXG4gIF0sXG4gIHRvcE5hdjogW1xuICAgIHsgdGV4dDogXCJHdWlkZWxpbmVzXCIsIGxpbms6IFwiL2NvbmNlcHRzL2d1aWRlbGluZXNcIiB9LFxuICAgIHsgdGV4dDogXCIxLjEuOS1iZXRhLjJcIiwgbGluazogXCIvY2hhbmdlbG9nXCIgfSxcbiAgXSxcbiAgZWRpdExpbms6IHtcbiAgICBwYXR0ZXJuOlxuICAgICAgXCJodHRwczovL2dpdGh1Yi5jb20vZXBoZW1lcmFIUS9tZXNzYWdlLWtpdC9ibG9iL21haW4vcGFja2FnZXMvZG9jcy9wYWdlcy86cGF0aFwiLFxuICAgIHRleHQ6IFwiU3VnZ2VzdCBjaGFuZ2VzIHRvIHRoaXMgcGFnZVwiLFxuICB9LFxuICBzaWRlYmFyOiBbXG4gICAge1xuICAgICAgdGV4dDogXCJRdWlja3N0YXJ0XCIsXG4gICAgICBsaW5rOiBcIi9xdWlja3N0YXJ0XCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkV4YW1wbGVzXCIsXG4gICAgICBsaW5rOiBcIi9leGFtcGxlc1wiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJDb25jZXB0c1wiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiU3RydWN0dXJlXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMvc3RydWN0dXJlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk1lc3NhZ2VzXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMvbWVzc2FnZXNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiVHlwZXNcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb25jZXB0cy90eXBlc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJHcm91cHNcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb25jZXB0cy9ncm91cHNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiVXNlcm5hbWVzXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMvdXNlcm5hbWVzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkRlcGxveW1lbnRcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb25jZXB0cy9kZXBsb3ltZW50XCIsXG4gICAgICAgIH0sXG4gICAgICAgIE1pZGRsZVxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiQUkgU2tpbGxzXCIsXG4gICAgICBsaW5rOiBcIi9za2lsbHNcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlJlYXNvbmluZ1wiLFxuICAgICAgICAgIGxpbms6IFwiL3NraWxscy9yZWFzb25pbmdcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiU2NlbmFyaW9zXCIsXG4gICAgICAgICAgbGluazogXCIvc2tpbGxzL3NjZW5hcmlvc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJQcm9tcHRpbmdcIixcbiAgICAgICAgICBsaW5rOiBcIi9za2lsbHMvcHJvbXB0aW5nXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlByb2Nlc3NpbmdcIixcbiAgICAgICAgICBsaW5rOiBcIi9za2lsbHMvcHJvY2Vzc2luZ1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJQYXJzaW5nXCIsXG4gICAgICAgICAgbGluazogXCIvc2tpbGxzL3BhcnNpbmdcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiRGVmaW5pdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL3NraWxscy9kZWZpbml0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG5cbiAgICB7XG4gICAgICB0ZXh0OiBcIlVzZSBjYXNlc1wiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiRW5zIGFnZW50XCIsXG4gICAgICAgICAgbGluazogXCIvdGVtcGxhdGVzL2FnZW50XCIsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJDaGVja1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvYWdlbnQvaGFuZGxlcnMvY2hlY2tcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiSW5mb1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvYWdlbnQvaGFuZGxlcnMvaW5mb1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJDb29sXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3RlbXBsYXRlcy9hZ2VudC9oYW5kbGVycy9jb29sXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlJlZ2lzdGVyXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3RlbXBsYXRlcy9hZ2VudC9oYW5kbGVycy9yZWdpc3RlclwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJSZW5ld1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvYWdlbnQvaGFuZGxlcnMvcmVuZXdcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiUmVzZXRcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdGVtcGxhdGVzL2FnZW50L2hhbmRsZXJzL3Jlc2V0XCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlRpcFwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvYWdlbnQvaGFuZGxlcnMvdGlwXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkdyb3VwIGJvdFwiLFxuICAgICAgICAgIGxpbms6IFwiL3RlbXBsYXRlcy9ncm91cFwiLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiVGlwcGluZ1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvZ3JvdXAvdGlwcGluZ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJHYW1lc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvZ3JvdXAvZ2FtZXNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiUGF5bWVudHNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdGVtcGxhdGVzL2dyb3VwL3BheW1lbnRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiSGVscGVyc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvZ3JvdXAvaGVscGVyc1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJHcHRcIixcbiAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvZ3B0XCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG5cbiAgICB7XG4gICAgICB0ZXh0OiBcIk1pZGRsZXdhcmVcIixcbiAgICAgIGxpbms6IFwiL21pZGRsZXdhcmVcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkNyb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9taWRkbGV3YXJlL2Nyb25cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiVmlzaW9uXCIsXG4gICAgICAgICAgbGluazogXCIvbWlkZGxld2FyZS92aXNpb25cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiU3RhY2tzb1wiLFxuICAgICAgICAgIGxpbms6IFwiL21pZGRsZXdhcmUvc3RhY2tzb1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJOb3Rpb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9taWRkbGV3YXJlL25vdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJMZWFybldlYjNcIixcbiAgICAgICAgICBsaW5rOiBcIi9taWRkbGV3YXJlL2xlYXJud2ViM1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJMb3dkYlwiLFxuICAgICAgICAgIGxpbms6IFwiL21pZGRsZXdhcmUvbG93ZGJcIixcbiAgICAgICAgfSxcblxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJHUFRcIixcbiAgICAgICAgICBsaW5rOiBcIi9taWRkbGV3YXJlL2dwdFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJSZXNvbHZlclwiLFxuICAgICAgICAgIGxpbms6IFwiL21pZGRsZXdhcmUvcmVzb2x2ZXJcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiWE1UUCBHcm91cHNcIixcbiAgICAgICAgICBsaW5rOiBcIi9taWRkbGV3YXJlL3htdHBcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiT3BlbiBGcmFtZXNcIixcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkZyYW1lcy5qc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9taWRkbGV3YXJlL29wZW4tZnJhbWVzL2ZyYW1lc2pzXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIk9uY2hhaW5LaXRcIixcbiAgICAgICAgICAgICAgbGluazogXCIvbWlkZGxld2FyZS9vcGVuLWZyYW1lcy9vbmNoYWlua2l0XCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkZyb2dcIixcbiAgICAgICAgICAgICAgbGluazogXCIvbWlkZGxld2FyZS9vcGVuLWZyYW1lcy9mcm9nXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUFTLG9CQUFvQjtBQUt2QixtQkFDRSxLQURGO0FBSE4sSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTSxNQUFNO0FBQ1YsV0FDRSxpQ0FDRTtBQUFBLDBCQUFDLFVBQUssU0FBUSxTQUFRO0FBQUEsTUFDdEIsb0JBQUMsVUFBSyxNQUFLLFlBQVcsU0FBUSxzQkFBcUI7QUFBQSxNQUNuRCxvQkFBQyxVQUFLLFVBQVMsWUFBVyxTQUFRLGNBQWE7QUFBQSxNQUMvQztBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsVUFBUztBQUFBLFVBQ1QsU0FBUTtBQUFBO0FBQUEsTUFDVjtBQUFBLE1BQ0Esb0JBQUMsVUFBSyxVQUFTLFlBQVcsU0FBUSxTQUFRO0FBQUEsTUFDMUMsb0JBQUMsVUFBSyxVQUFTLGNBQWEsU0FBUSxTQUFRO0FBQUEsTUFDNUMsb0JBQUMsVUFBSyxVQUFTLG1CQUFrQixTQUFRLFNBQVE7QUFBQSxNQUNqRDtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsVUFBUztBQUFBLFVBQ1QsU0FBUTtBQUFBO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUFDO0FBQUE7QUFBQSxVQUNDLFVBQVM7QUFBQSxVQUNULFNBQVE7QUFBQTtBQUFBLE1BQ1Y7QUFBQSxNQUVBLG9CQUFDLFVBQUssVUFBUyxxQkFBb0IsU0FBUSxRQUFPO0FBQUEsTUFDbEQsb0JBQUMsVUFBSyxVQUFTLDRCQUEyQixTQUFRLFFBQU87QUFBQSxNQUN6RDtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsVUFBUztBQUFBLFVBQ1QsU0FBUTtBQUFBO0FBQUEsTUFDVjtBQUFBLE1BRUEsb0JBQUMsVUFBSyxVQUFTLHFCQUFvQixTQUFRLHVCQUFZO0FBQUEsTUFDdkQsb0JBQUMsVUFBSyxVQUFTLDRCQUEyQixTQUFRLFFBQU87QUFBQSxNQUN6RDtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsVUFBUztBQUFBLFVBQ1QsU0FBUTtBQUFBO0FBQUEsTUFDVjtBQUFBLE1BRUE7QUFBQSxRQUFDO0FBQUE7QUFBQSxVQUNDLEtBQUk7QUFBQSxVQUNKLGVBQVk7QUFBQSxVQUNaLE9BQUs7QUFBQTtBQUFBLE1BQ1A7QUFBQSxPQUNGO0FBQUEsRUFFSjtBQUFBLEVBQ0EsWUFBWTtBQUFBLElBQ1YsS0FBSztBQUFBLElBQ0wsU0FBUztBQUFBLEVBQ1g7QUFBQSxFQUNBLE9BQU87QUFBQSxFQUNQLFNBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULE9BQU87QUFBQSxJQUNMLGFBQWE7QUFBQSxJQUNiLGFBQWE7QUFBQSxNQUNYLE9BQU87QUFBQSxNQUNQLE1BQU07QUFBQSxJQUNSO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1A7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sRUFBRSxNQUFNLGNBQWMsTUFBTSx1QkFBdUI7QUFBQSxJQUNuRCxFQUFFLE1BQU0sZ0JBQWdCLE1BQU0sYUFBYTtBQUFBLEVBQzdDO0FBQUEsRUFDQSxVQUFVO0FBQUEsSUFDUixTQUNFO0FBQUEsSUFDRixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1A7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFFQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxVQUNOLE9BQU87QUFBQSxZQUNMO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFVBQ04sT0FBTztBQUFBLFlBQ0w7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFFQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBRUE7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE9BQU87QUFBQSxZQUNMO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
