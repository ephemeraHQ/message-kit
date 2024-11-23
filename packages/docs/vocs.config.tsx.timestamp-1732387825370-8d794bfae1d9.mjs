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
  topNav: [{ text: "v1.1.11-beta.1", link: "/changelog" }],
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
      text: "Library",
      link: "/library"
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
          text: "Groups",
          link: "/concepts/groups"
        },
        {
          text: "Usernames",
          link: "/concepts/usernames"
        },
        {
          text: "Frames",
          link: "/concepts/frames"
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
        }
      ]
    },
    {
      text: "Use cases",
      items: [
        {
          text: "Web3 agent",
          link: "/templates/agent"
        },
        {
          text: "Gated group",
          link: "/templates/gated"
        }
      ]
    },
    {
      text: "Middleware",
      items: [
        {
          text: "Overview",
          link: "/middleware"
        },
        {
          text: "Deployment",
          link: "/middleware/railway"
        }
      ]
    },
    {
      text: "Changelog",
      link: "/changelog"
    },
    {
      text: "Guidelines",
      link: "/concepts/guidelines"
    }
  ]
});
export {
  vocs_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidm9jc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBoZWFkOiAoKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDw+XG4gICAgICAgIDxtZXRhIGNoYXJTZXQ9XCJ1dGYtOFwiIC8+XG4gICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGhcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOnRpdGxlXCIgY29udGVudD1cIk1lc3NhZ2VLaXRcIiAvPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIHByb3BlcnR5PVwib2c6aW1hZ2VcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2VraXQuZXBoZW1lcmFocS5jb20vaGVyby5qcGdcIlxuICAgICAgICAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cImZjOmZyYW1lXCIgY29udGVudD1cInZOZXh0XCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZjp2ZXJzaW9uXCIgY29udGVudD1cInZOZXh0XCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZjphY2NlcHRzOnhtdHBcIiBjb250ZW50PVwidk5leHRcIiAvPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIHByb3BlcnR5PVwib2Y6aW1hZ2VcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2VraXQuZXBoZW1lcmFocS5jb20vaGVyby5qcGdcIlxuICAgICAgICAvPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIHByb3BlcnR5PVwiZmM6ZnJhbWU6aW1hZ2VcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2VraXQuZXBoZW1lcmFocS5jb20vaGVyby5qcGdcIlxuICAgICAgICAvPlxuXG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwiZmM6ZnJhbWU6YnV0dG9uOjFcIiBjb250ZW50PVwiRG9jc1wiIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwiZmM6ZnJhbWU6YnV0dG9uOjE6YWN0aW9uXCIgY29udGVudD1cImxpbmtcIiAvPlxuICAgICAgICA8bWV0YVxuICAgICAgICAgIHByb3BlcnR5PVwiZmM6ZnJhbWU6YnV0dG9uOjE6dGFyZ2V0XCJcbiAgICAgICAgICBjb250ZW50PVwiaHR0cHM6Ly9tZXNzYWdla2l0LmVwaGVtZXJhaHEuY29tL1wiXG4gICAgICAgIC8+XG5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246MlwiIGNvbnRlbnQ9XCJEcm9wIGEgXHUyQjUwXHVGRTBGXCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246MjphY3Rpb25cIiBjb250ZW50PVwibGlua1wiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246Mjp0YXJnZXRcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL2dpdGh1Yi5jb20vZXBoZW1lcmFIUS9tZXNzYWdlLWtpdFwiXG4gICAgICAgIC8+XG5cbiAgICAgICAgPHNjcmlwdFxuICAgICAgICAgIHNyYz1cImh0dHBzOi8vcGxhdXNpYmxlLmlvL2pzL3NjcmlwdC5vdXRib3VuZC1saW5rcy5qc1wiXG4gICAgICAgICAgZGF0YS1kb21haW49XCJtZXNzYWdla2l0LmVwaGVtZXJhaHEuY29tXCJcbiAgICAgICAgICBkZWZlclxuICAgICAgICAvPlxuICAgICAgPC8+XG4gICAgKTtcbiAgfSxcbiAgb2dJbWFnZVVybDoge1xuICAgIFwiL1wiOiBcIi9oZXJvLmpwZ1wiLFxuICAgIFwiL2RvY3NcIjogXCIvaGVyby5qcGdcIixcbiAgfSxcbiAgdGl0bGU6IFwiTWVzc2FnZUtpdFwiLFxuICByb290RGlyOiBcIi5cIixcbiAgaWNvblVybDoge1xuICAgIGxpZ2h0OiBcIi9tZXNzYWdla2l0LWxvZ28ucG5nXCIsXG4gICAgZGFyazogXCIvbWVzc2FnZWtpdC1sb2dvLnBuZ1wiLFxuICB9LFxuICB0aGVtZToge1xuICAgIGFjY2VudENvbG9yOiB7XG4gICAgICBsaWdodDogXCIjRkE2OTc3XCIsXG4gICAgICBkYXJrOiBcIiNGQTY5NzdcIixcbiAgICB9LFxuICB9LFxuICBzb2NpYWxzOiBbXG4gICAge1xuICAgICAgaWNvbjogXCJnaXRodWJcIixcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2VwaGVtZXJhSFEvbWVzc2FnZS1raXRcIixcbiAgICB9LFxuICBdLFxuICB0b3BOYXY6IFt7IHRleHQ6IFwidjEuMS4xMS1iZXRhLjFcIiwgbGluazogXCIvY2hhbmdlbG9nXCIgfV0sXG4gIGVkaXRMaW5rOiB7XG4gICAgcGF0dGVybjpcbiAgICAgIFwiaHR0cHM6Ly9naXRodWIuY29tL2VwaGVtZXJhSFEvbWVzc2FnZS1raXQvYmxvYi9tYWluL3BhY2thZ2VzL2RvY3MvcGFnZXMvOnBhdGhcIixcbiAgICB0ZXh0OiBcIlN1Z2dlc3QgY2hhbmdlcyB0byB0aGlzIHBhZ2VcIixcbiAgfSxcbiAgc2lkZWJhcjogW1xuICAgIHtcbiAgICAgIHRleHQ6IFwiUXVpY2tzdGFydFwiLFxuICAgICAgbGluazogXCIvcXVpY2tzdGFydFwiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJFeGFtcGxlc1wiLFxuICAgICAgbGluazogXCIvZXhhbXBsZXNcIixcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiTGlicmFyeVwiLFxuICAgICAgbGluazogXCIvbGlicmFyeVwiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJDb25jZXB0c1wiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiU3RydWN0dXJlXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMvc3RydWN0dXJlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk1lc3NhZ2VzXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMvbWVzc2FnZXNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiR3JvdXBzXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMvZ3JvdXBzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlVzZXJuYW1lc1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbmNlcHRzL3VzZXJuYW1lc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJGcmFtZXNcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb25jZXB0cy9mcmFtZXNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQUkgU2tpbGxzXCIsXG4gICAgICAgICAgbGluazogXCIvc2tpbGxzXCIsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJSZWFzb25pbmdcIixcbiAgICAgICAgICAgICAgbGluazogXCIvc2tpbGxzL3JlYXNvbmluZ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJTY2VuYXJpb3NcIixcbiAgICAgICAgICAgICAgbGluazogXCIvc2tpbGxzL3NjZW5hcmlvc1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJQcm9tcHRpbmdcIixcbiAgICAgICAgICAgICAgbGluazogXCIvc2tpbGxzL3Byb21wdGluZ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJQcm9jZXNzaW5nXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3NraWxscy9wcm9jZXNzaW5nXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlBhcnNpbmdcIixcbiAgICAgICAgICAgICAgbGluazogXCIvc2tpbGxzL3BhcnNpbmdcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiRGVmaW5pdGlvblwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9za2lsbHMvZGVmaW5pdGlvblwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiVXNlIGNhc2VzXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJXZWIzIGFnZW50XCIsXG4gICAgICAgICAgbGluazogXCIvdGVtcGxhdGVzL2FnZW50XCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkdhdGVkIGdyb3VwXCIsXG4gICAgICAgICAgbGluazogXCIvdGVtcGxhdGVzL2dhdGVkXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG5cbiAgICB7XG4gICAgICB0ZXh0OiBcIk1pZGRsZXdhcmVcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk92ZXJ2aWV3XCIsXG4gICAgICAgICAgbGluazogXCIvbWlkZGxld2FyZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJEZXBsb3ltZW50XCIsXG4gICAgICAgICAgbGluazogXCIvbWlkZGxld2FyZS9yYWlsd2F5XCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJDaGFuZ2Vsb2dcIixcbiAgICAgIGxpbms6IFwiL2NoYW5nZWxvZ1wiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJHdWlkZWxpbmVzXCIsXG4gICAgICBsaW5rOiBcIi9jb25jZXB0cy9ndWlkZWxpbmVzXCIsXG4gICAgfSxcbiAgXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBLFNBQVMsb0JBQW9CO0FBS3ZCLG1CQUNFLEtBREY7QUFITixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNLE1BQU07QUFDVixXQUNFLGlDQUNFO0FBQUEsMEJBQUMsVUFBSyxTQUFRLFNBQVE7QUFBQSxNQUN0QixvQkFBQyxVQUFLLE1BQUssWUFBVyxTQUFRLHNCQUFxQjtBQUFBLE1BQ25ELG9CQUFDLFVBQUssVUFBUyxZQUFXLFNBQVEsY0FBYTtBQUFBLE1BQy9DO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQyxVQUFTO0FBQUEsVUFDVCxTQUFRO0FBQUE7QUFBQSxNQUNWO0FBQUEsTUFDQSxvQkFBQyxVQUFLLFVBQVMsWUFBVyxTQUFRLFNBQVE7QUFBQSxNQUMxQyxvQkFBQyxVQUFLLFVBQVMsY0FBYSxTQUFRLFNBQVE7QUFBQSxNQUM1QyxvQkFBQyxVQUFLLFVBQVMsbUJBQWtCLFNBQVEsU0FBUTtBQUFBLE1BQ2pEO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQyxVQUFTO0FBQUEsVUFDVCxTQUFRO0FBQUE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsVUFBUztBQUFBLFVBQ1QsU0FBUTtBQUFBO0FBQUEsTUFDVjtBQUFBLE1BRUEsb0JBQUMsVUFBSyxVQUFTLHFCQUFvQixTQUFRLFFBQU87QUFBQSxNQUNsRCxvQkFBQyxVQUFLLFVBQVMsNEJBQTJCLFNBQVEsUUFBTztBQUFBLE1BQ3pEO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQyxVQUFTO0FBQUEsVUFDVCxTQUFRO0FBQUE7QUFBQSxNQUNWO0FBQUEsTUFFQSxvQkFBQyxVQUFLLFVBQVMscUJBQW9CLFNBQVEsdUJBQVk7QUFBQSxNQUN2RCxvQkFBQyxVQUFLLFVBQVMsNEJBQTJCLFNBQVEs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
