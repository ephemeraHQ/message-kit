// vocs.config.tsx
import { defineConfig } from "file:///Users/fabrizioguespe/DevRel/message-kit/packages/docs/node_modules/vocs/_lib/index.js";
import { Fragment, jsx, jsxs } from "file:///Users/fabrizioguespe/DevRel/message-kit/packages/docs/node_modules/react/jsx-runtime.js";
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
      /* @__PURE__ */ jsx("meta", { property: "fc:frame:button:2", content: "Directory" }),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame:button:2:action", content: "link" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          property: "fc:frame:button:2:target",
          content: "https://messagekit.ephemerahq.com/"
        }
      ),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame:button:3", content: "Templates" }),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame:button:3:action", content: "link" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          property: "fc:frame:button:3:target",
          content: "https://messagekit.ephemerahq.com/templates"
        }
      ),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame:button:4", content: "Concepts" }),
      /* @__PURE__ */ jsx("meta", { property: "fc:frame:button:4:action", content: "link" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          property: "fc:frame:button:4:target",
          content: "https://messagekit.ephemerahq.com/concepts"
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
  iconUrl: "/messagekit-logo.png",
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
    {
      text: "Converse app",
      link: "https://converse.xyz"
    },
    { text: "XMTP", link: "https://docs.xmtp.org/" },
    { text: "1.1.5-beta.13", link: "/changelog" }
  ],
  editLink: {
    pattern: "https://github.com/ephemeraHQ/message-kit/packages/docs/main/:path",
    text: "Suggest changes to this page"
  },
  sidebar: [
    {
      text: "Installation",
      link: "/installation"
    },
    {
      text: "Directory",
      link: "/directory"
    },
    {
      text: "Quickstarts",
      link: "/quickstarts"
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
      text: "Concepts",
      collapsed: false,
      items: [
        {
          text: "Structure",
          link: "/concepts/structure"
        },
        {
          text: "Messages",
          link: "/concepts/messages",
          items: [
            { text: "Text", link: "/concepts/messages/text" },
            { text: "Reply", link: "/concepts/messages/reply" },
            { text: "Command", link: "/concepts/messages/command" },
            { text: "Attachment", link: "/concepts/messages/attachment" }
          ]
        },
        {
          text: "AI Skills",
          link: "/skills",
          items: [
            {
              text: "Commands",
              link: "/skills/commands"
            },
            {
              text: "Natural Language",
              link: "/skills/natural"
            },
            {
              text: "Parsing new lines",
              link: "/skills/multi-skills"
            },
            {
              text: "Fine Tuning",
              link: "/skills/fine-tuning"
            },
            {
              text: "Reasoning",
              link: "/skills/reasoning"
            }
          ]
        },
        {
          text: "Groups",
          link: "/concepts/groups"
        }
      ]
    },
    {
      text: "Use cases",
      items: [
        {
          text: "Gm bot",
          link: "/templates/gm"
        },
        {
          text: "Agent",
          link: "/templates/agent",
          items: [
            {
              text: "Skill",
              link: "/templates/agent/skills"
            },
            {
              text: "ENS Handler",
              link: "/templates/agent/ens"
            },
            {
              text: "Prompt",
              link: "/templates/agent/prompt"
            }
          ]
        },
        {
          text: "Group bot",
          link: "/templates/group",
          items: [
            {
              text: "Agents",
              link: "/templates/group/agents"
            },
            {
              text: "Tipping",
              link: "/templates/group/tipping"
            },
            {
              text: "Games",
              link: "/templates/group/games"
            },
            {
              text: "Transactions",
              link: "/templates/group/transactions"
            },
            {
              text: "Loyalty",
              link: "/templates/group/loyalty"
            },
            {
              text: "Helpers",
              link: "/templates/group/helpers"
            }
          ]
        }
      ]
    },
    {
      text: "Middlewares",
      collapsed: false,
      items: [
        {
          text: "Cron",
          link: "/middlewares/cron"
        },
        {
          text: "Redis",
          link: "/middlewares/redis"
        },
        {
          text: "Vision",
          link: "/middlewares/vision"
        },
        {
          text: "Stackso",
          link: "/middlewares/stackso"
        },
        {
          text: "Notion",
          link: "/middlewares/notion"
        },
        {
          text: "LearnWeb3",
          link: "/middlewares/learnweb3"
        }
      ]
    },
    {
      text: "Frames",
      collapsed: false,
      link: "/frames",
      items: [
        {
          text: "Introduction",
          link: "/frames"
        },
        {
          text: "Frameworks",
          items: [
            {
              text: "OnchainKit",
              link: "/frames/frameworks/onchainkit"
            },
            {
              text: "Frames.js",
              link: "/frames/frameworks/framesjs"
            },
            {
              text: "Frog",
              link: "/frames/frameworks/frog"
            }
          ]
        },
        {
          text: "Tutorials",
          items: [
            {
              text: "Subscribe",
              link: "/frames/tutorials/subscribe"
            },
            {
              text: "Transactions",
              link: "/frames/tutorials/transactions"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidm9jc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBoZWFkOiAoKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDw+XG4gICAgICAgIDxtZXRhIGNoYXJTZXQ9XCJ1dGYtOFwiIC8+XG4gICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGhcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOnRpdGxlXCIgY29udGVudD1cIk1lc3NhZ2VLaXRcIiAvPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIHByb3BlcnR5PVwib2c6aW1hZ2VcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2VraXQuZXBoZW1lcmFocS5jb20vaGVyby5qcGdcIlxuICAgICAgICAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cImZjOmZyYW1lXCIgY29udGVudD1cInZOZXh0XCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZjp2ZXJzaW9uXCIgY29udGVudD1cInZOZXh0XCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZjphY2NlcHRzOnhtdHBcIiBjb250ZW50PVwidk5leHRcIiAvPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIHByb3BlcnR5PVwib2Y6aW1hZ2VcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2VraXQuZXBoZW1lcmFocS5jb20vaGVyby5qcGdcIlxuICAgICAgICAvPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIHByb3BlcnR5PVwiZmM6ZnJhbWU6aW1hZ2VcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2VraXQuZXBoZW1lcmFocS5jb20vaGVyby5qcGdcIlxuICAgICAgICAvPlxuXG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwiZmM6ZnJhbWU6YnV0dG9uOjFcIiBjb250ZW50PVwiRG9jc1wiIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwiZmM6ZnJhbWU6YnV0dG9uOjE6YWN0aW9uXCIgY29udGVudD1cImxpbmtcIiAvPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIHByb3BlcnR5PVwiZmM6ZnJhbWU6YnV0dG9uOjE6dGFyZ2V0XCJcbiAgICAgICAgICBjb250ZW50PVwiaHR0cHM6Ly9tZXNzYWdla2l0LmVwaGVtZXJhaHEuY29tL1wiXG4gICAgICAgIC8+XG5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246MlwiIGNvbnRlbnQ9XCJEaXJlY3RvcnlcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cImZjOmZyYW1lOmJ1dHRvbjoyOmFjdGlvblwiIGNvbnRlbnQ9XCJsaW5rXCIgLz5cbiAgICAgICAgPG1ldGFcbiAgICAgICAgICBwcm9wZXJ0eT1cImZjOmZyYW1lOmJ1dHRvbjoyOnRhcmdldFwiXG4gICAgICAgICAgY29udGVudD1cImh0dHBzOi8vbWVzc2FnZWtpdC5lcGhlbWVyYWhxLmNvbS9cIlxuICAgICAgICAvPlxuXG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwiZmM6ZnJhbWU6YnV0dG9uOjNcIiBjb250ZW50PVwiVGVtcGxhdGVzXCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246MzphY3Rpb25cIiBjb250ZW50PVwibGlua1wiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246Mzp0YXJnZXRcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2VraXQuZXBoZW1lcmFocS5jb20vdGVtcGxhdGVzXCJcbiAgICAgICAgLz5cblxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cImZjOmZyYW1lOmJ1dHRvbjo0XCIgY29udGVudD1cIkNvbmNlcHRzXCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246NDphY3Rpb25cIiBjb250ZW50PVwibGlua1wiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246NDp0YXJnZXRcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2VraXQuZXBoZW1lcmFocS5jb20vY29uY2VwdHNcIlxuICAgICAgICAvPlxuXG4gICAgICAgIDxzY3JpcHRcbiAgICAgICAgICBzcmM9XCJodHRwczovL3BsYXVzaWJsZS5pby9qcy9zY3JpcHQub3V0Ym91bmQtbGlua3MuanNcIlxuICAgICAgICAgIGRhdGEtZG9tYWluPVwibWVzc2FnZWtpdC5lcGhlbWVyYWhxLmNvbVwiXG4gICAgICAgICAgZGVmZXJcbiAgICAgICAgLz5cbiAgICAgIDwvPlxuICAgICk7XG4gIH0sXG4gIG9nSW1hZ2VVcmw6IHtcbiAgICBcIi9cIjogXCIvaGVyby5qcGdcIixcbiAgICBcIi9kb2NzXCI6IFwiL2hlcm8uanBnXCIsXG4gIH0sXG4gIHRpdGxlOiBcIk1lc3NhZ2VLaXRcIixcbiAgaWNvblVybDogXCIvbWVzc2FnZWtpdC1sb2dvLnBuZ1wiLFxuICByb290RGlyOiBcIi5cIixcbiAgdGhlbWU6IHtcbiAgICBjb2xvclNjaGVtZTogXCJkYXJrXCIsXG4gICAgYWNjZW50Q29sb3I6IHtcbiAgICAgIGxpZ2h0OiBcIiNGQTY5NzdcIixcbiAgICAgIGRhcms6IFwiI0ZBNjk3N1wiLFxuICAgIH0sXG4gIH0sXG4gIHNvY2lhbHM6IFtcbiAgICB7XG4gICAgICBpY29uOiBcImdpdGh1YlwiLFxuICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vZXBoZW1lcmFIUS9tZXNzYWdlLWtpdFwiLFxuICAgIH0sXG4gIF0sXG4gIHRvcE5hdjogW1xuICAgIHtcbiAgICAgIHRleHQ6IFwiQ29udmVyc2UgYXBwXCIsXG4gICAgICBsaW5rOiBcImh0dHBzOi8vY29udmVyc2UueHl6XCIsXG4gICAgfSxcbiAgICB7IHRleHQ6IFwiWE1UUFwiLCBsaW5rOiBcImh0dHBzOi8vZG9jcy54bXRwLm9yZy9cIiB9LFxuICAgIHsgdGV4dDogXCIxLjEuNS1iZXRhLjEzXCIsIGxpbms6IFwiL2NoYW5nZWxvZ1wiIH0sXG4gIF0sXG4gIGVkaXRMaW5rOiB7XG4gICAgcGF0dGVybjpcbiAgICAgIFwiaHR0cHM6Ly9naXRodWIuY29tL2VwaGVtZXJhSFEvbWVzc2FnZS1raXQvcGFja2FnZXMvZG9jcy9tYWluLzpwYXRoXCIsXG4gICAgdGV4dDogXCJTdWdnZXN0IGNoYW5nZXMgdG8gdGhpcyBwYWdlXCIsXG4gIH0sXG4gIHNpZGViYXI6IFtcbiAgICB7XG4gICAgICB0ZXh0OiBcIkluc3RhbGxhdGlvblwiLFxuICAgICAgbGluazogXCIvaW5zdGFsbGF0aW9uXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkRpcmVjdG9yeVwiLFxuICAgICAgbGluazogXCIvZGlyZWN0b3J5XCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIlF1aWNrc3RhcnRzXCIsXG4gICAgICBsaW5rOiBcIi9xdWlja3N0YXJ0c1wiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJEZXBsb3ltZW50XCIsXG4gICAgICBsaW5rOiBcIi9kZXBsb3ltZW50XCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkd1aWRlbGluZXNcIixcbiAgICAgIGxpbms6IFwiL2d1aWRlbGluZXNcIixcbiAgICB9LFxuXG4gICAge1xuICAgICAgdGV4dDogXCJDb25jZXB0c1wiLFxuICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlN0cnVjdHVyZVwiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbmNlcHRzL3N0cnVjdHVyZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJNZXNzYWdlc1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbmNlcHRzL21lc3NhZ2VzXCIsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHsgdGV4dDogXCJUZXh0XCIsIGxpbms6IFwiL2NvbmNlcHRzL21lc3NhZ2VzL3RleHRcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIlJlcGx5XCIsIGxpbms6IFwiL2NvbmNlcHRzL21lc3NhZ2VzL3JlcGx5XCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJDb21tYW5kXCIsIGxpbms6IFwiL2NvbmNlcHRzL21lc3NhZ2VzL2NvbW1hbmRcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIkF0dGFjaG1lbnRcIiwgbGluazogXCIvY29uY2VwdHMvbWVzc2FnZXMvYXR0YWNobWVudFwiIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQUkgU2tpbGxzXCIsXG4gICAgICAgICAgbGluazogXCIvc2tpbGxzXCIsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJDb21tYW5kc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9za2lsbHMvY29tbWFuZHNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiTmF0dXJhbCBMYW5ndWFnZVwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9za2lsbHMvbmF0dXJhbFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJQYXJzaW5nIG5ldyBsaW5lc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9za2lsbHMvbXVsdGktc2tpbGxzXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkZpbmUgVHVuaW5nXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3NraWxscy9maW5lLXR1bmluZ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJSZWFzb25pbmdcIixcbiAgICAgICAgICAgICAgbGluazogXCIvc2tpbGxzL3JlYXNvbmluZ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJHcm91cHNcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb25jZXB0cy9ncm91cHNcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcblxuICAgIHtcbiAgICAgIHRleHQ6IFwiVXNlIGNhc2VzXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJHbSBib3RcIixcbiAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvZ21cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQWdlbnRcIixcbiAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvYWdlbnRcIixcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlNraWxsXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3RlbXBsYXRlcy9hZ2VudC9za2lsbHNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiRU5TIEhhbmRsZXJcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdGVtcGxhdGVzL2FnZW50L2Vuc1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJQcm9tcHRcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdGVtcGxhdGVzL2FnZW50L3Byb21wdFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJHcm91cCBib3RcIixcbiAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvZ3JvdXBcIixcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkFnZW50c1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvZ3JvdXAvYWdlbnRzXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlRpcHBpbmdcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdGVtcGxhdGVzL2dyb3VwL3RpcHBpbmdcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiR2FtZXNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdGVtcGxhdGVzL2dyb3VwL2dhbWVzXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlRyYW5zYWN0aW9uc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvZ3JvdXAvdHJhbnNhY3Rpb25zXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkxveWFsdHlcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdGVtcGxhdGVzL2dyb3VwL2xveWFsdHlcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiSGVscGVyc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi90ZW1wbGF0ZXMvZ3JvdXAvaGVscGVyc1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuXG4gICAge1xuICAgICAgdGV4dDogXCJNaWRkbGV3YXJlc1wiLFxuICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkNyb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9taWRkbGV3YXJlcy9jcm9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlJlZGlzXCIsXG4gICAgICAgICAgbGluazogXCIvbWlkZGxld2FyZXMvcmVkaXNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiVmlzaW9uXCIsXG4gICAgICAgICAgbGluazogXCIvbWlkZGxld2FyZXMvdmlzaW9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlN0YWNrc29cIixcbiAgICAgICAgICBsaW5rOiBcIi9taWRkbGV3YXJlcy9zdGFja3NvXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk5vdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL21pZGRsZXdhcmVzL25vdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJMZWFybldlYjNcIixcbiAgICAgICAgICBsaW5rOiBcIi9taWRkbGV3YXJlcy9sZWFybndlYjNcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkZyYW1lc1wiLFxuICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgIGxpbms6IFwiL2ZyYW1lc1wiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiSW50cm9kdWN0aW9uXCIsXG4gICAgICAgICAgbGluazogXCIvZnJhbWVzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkZyYW1ld29ya3NcIixcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIk9uY2hhaW5LaXRcIixcbiAgICAgICAgICAgICAgbGluazogXCIvZnJhbWVzL2ZyYW1ld29ya3Mvb25jaGFpbmtpdFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJGcmFtZXMuanNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvZnJhbWVzL2ZyYW1ld29ya3MvZnJhbWVzanNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiRnJvZ1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9mcmFtZXMvZnJhbWV3b3Jrcy9mcm9nXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlR1dG9yaWFsc1wiLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiU3Vic2NyaWJlXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL2ZyYW1lcy90dXRvcmlhbHMvc3Vic2NyaWJlXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlRyYW5zYWN0aW9uc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9mcmFtZXMvdHV0b3JpYWxzL3RyYW5zYWN0aW9uc1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICBdLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsU0FBUyxvQkFBb0I7QUFLdkIsbUJBQ0UsS0FERjtBQUhOLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU0sTUFBTTtBQUNWLFdBQ0UsaUNBQ0U7QUFBQSwwQkFBQyxVQUFLLFNBQVEsU0FBUTtBQUFBLE1BQ3RCLG9CQUFDLFVBQUssTUFB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UUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFVBQ04sT0FBTztBQUFBLFlBQ0w7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFVBQ04sT0FBTztBQUFBLFlBQ0w7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUVBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixXQUFXO0FBQUEsTUFDWCxPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixXQUFXO0FBQUEsTUFDWCxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
