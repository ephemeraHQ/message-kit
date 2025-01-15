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
      text: "CLI",
      link: "/cli"
    },
    {
      text: "paymentagent.eth",
      link: "/templates/paymentagent"
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
      text: "Build agents",
      items: [
        {
          text: "Get started",
          link: "/agents/get-started"
        },
        {
          text: "Agent SDK",
          link: "/agents/agent-sdk"
        },
        {
          text: "Groups",
          link: "/agents/groups"
        },
        {
          text: "Identity",
          link: "/agents/identity"
        },
        {
          text: "Gated group",
          link: "/agents/gated-group"
        },
        {
          text: "Build with MessageKit",
          link: "https://message-kit.org/"
        },
        {
          text: "Guidelines",
          link: "/agents/guidelines"
        }
      ]
    },
    {
      text: "Framework",
      items: [
        {
          text: "Overview",
          link: "/framework/overview"
        },
        {
          text: "Skills",
          link: "/framework/skills"
        },
        {
          text: "Deployment",
          link: "/framework/deployment"
        },
        {
          text: "Contribute",
          link: "/framework/contribute"
        },
        {
          text: "Changelog",
          link: "/framework/changelog"
        }
      ]
    }
  ]
});
export {
  vocs_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidm9jc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBoZWFkOiAoKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDw+XG4gICAgICAgIDxtZXRhIGNoYXJTZXQ9XCJ1dGYtOFwiIC8+XG4gICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGhcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOnRpdGxlXCIgY29udGVudD1cIk1lc3NhZ2VLaXRcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOmltYWdlXCIgY29udGVudD1cImh0dHBzOi8vbWVzc2FnZS1raXQub3JnL2hlcm8uanBnXCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZVwiIGNvbnRlbnQ9XCJ2TmV4dFwiIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwib2Y6dmVyc2lvblwiIGNvbnRlbnQ9XCJ2TmV4dFwiIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwib2Y6YWNjZXB0czp4bXRwXCIgY29udGVudD1cInZOZXh0XCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZjppbWFnZVwiIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2Uta2l0Lm9yZy9oZXJvLmpwZ1wiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgcHJvcGVydHk9XCJmYzpmcmFtZTppbWFnZVwiXG4gICAgICAgICAgY29udGVudD1cImh0dHBzOi8vbWVzc2FnZS1raXQub3JnL2hlcm8uanBnXCJcbiAgICAgICAgLz5cblxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cImZjOmZyYW1lOmJ1dHRvbjoxXCIgY29udGVudD1cIkRvY3NcIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cImZjOmZyYW1lOmJ1dHRvbjoxOmFjdGlvblwiIGNvbnRlbnQ9XCJsaW5rXCIgLz5cbiAgICAgICAgPG1ldGFcbiAgICAgICAgICBwcm9wZXJ0eT1cImZjOmZyYW1lOmJ1dHRvbjoxOnRhcmdldFwiXG4gICAgICAgICAgY29udGVudD1cImh0dHBzOi8vbWVzc2FnZS1raXQub3JnL1wiXG4gICAgICAgIC8+XG5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246MlwiIGNvbnRlbnQ9XCJEcm9wIGEgXHUyQjUwXHVGRTBGXCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246MjphY3Rpb25cIiBjb250ZW50PVwibGlua1wiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgcHJvcGVydHk9XCJmYzpmcmFtZTpidXR0b246Mjp0YXJnZXRcIlxuICAgICAgICAgIGNvbnRlbnQ9XCJodHRwczovL2dpdGh1Yi5jb20vZXBoZW1lcmFIUS9tZXNzYWdlLWtpdFwiXG4gICAgICAgIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6c2l0ZV9uYW1lXCIgY29udGVudD1cIk1lc3NhZ2VLaXRcIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpjYXJkXCIgY29udGVudD1cInN1bW1hcnlfbGFyZ2VfaW1hZ2VcIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpzaXRlXCIgY29udGVudD1cIkBNZXNzYWdlS2l0XCIgLz5cbiAgICAgICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6dGl0bGVcIiBjb250ZW50PVwiTWVzc2FnZUtpdFwiIC8+XG4gICAgICAgIDxtZXRhXG4gICAgICAgICAgbmFtZT1cInR3aXR0ZXI6ZGVzY3JpcHRpb25cIlxuICAgICAgICAgIGNvbnRlbnQ9XCJNZXNzYWdlS2l0IGlzIGEgcG93ZXJmdWwgdG9vbCBmb3IgbWFuYWdpbmcgeW91ciBtZXNzYWdlcy5cIlxuICAgICAgICAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjppbWFnZVwiIGNvbnRlbnQ9XCJodHRwczovL21lc3NhZ2Uta2l0Lm9yZy9oZXJvLmpwZ1wiIC8+XG4gICAgICAgIDxzY3JpcHRcbiAgICAgICAgICBzcmM9XCJodHRwczovL3BsYXVzaWJsZS5pby9qcy9zY3JpcHQub3V0Ym91bmQtbGlua3MuanNcIlxuICAgICAgICAgIGRhdGEtZG9tYWluPVwibWVzc2FnZS1raXQub3JnXCJcbiAgICAgICAgICBkZWZlclxuICAgICAgICAvPlxuICAgICAgPC8+XG4gICAgKTtcbiAgfSxcbiAgb2dJbWFnZVVybDoge1xuICAgIFwiL1wiOiBcIi9oZXJvLmpwZ1wiLFxuICAgIFwiL2RvY3NcIjogXCIvaGVyby5qcGdcIixcbiAgfSxcbiAgdGl0bGU6IFwiTWVzc2FnZUtpdFwiLFxuICByb290RGlyOiBcIi5cIixcbiAgaWNvblVybDoge1xuICAgIGxpZ2h0OiBcIi9tZXNzYWdla2l0LWxvZ28ucG5nXCIsXG4gICAgZGFyazogXCIvbWVzc2FnZWtpdC1sb2dvLnBuZ1wiLFxuICB9LFxuICB0aGVtZToge1xuICAgIGFjY2VudENvbG9yOiB7XG4gICAgICBsaWdodDogXCIjRkE2OTc3XCIsXG4gICAgICBkYXJrOiBcIiNGQTY5NzdcIixcbiAgICB9LFxuICB9LFxuICBzb2NpYWxzOiBbXG4gICAge1xuICAgICAgaWNvbjogXCJnaXRodWJcIixcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2VwaGVtZXJhSFEvbWVzc2FnZS1raXRcIixcbiAgICB9LFxuICBdLFxuICB0b3BOYXY6IFt7IHRleHQ6IFwiQ2hhbmdlbG9nXCIsIGxpbms6IFwiL2NoYW5nZWxvZ1wiIH1dLFxuICBlZGl0TGluazoge1xuICAgIHBhdHRlcm46XG4gICAgICBcImh0dHBzOi8vZ2l0aHViLmNvbS9lcGhlbWVyYUhRL21lc3NhZ2Uta2l0L2Jsb2IvbWFpbi9wYWNrYWdlcy9kb2NzL3BhZ2VzLzpwYXRoXCIsXG4gICAgdGV4dDogXCJTdWdnZXN0IGNoYW5nZXMgdG8gdGhpcyBwYWdlXCIsXG4gIH0sXG4gIHNpZGViYXI6IFtcbiAgICB7XG4gICAgICB0ZXh0OiBcIkNMSVwiLFxuICAgICAgbGluazogXCIvY2xpXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcInBheW1lbnRhZ2VudC5ldGhcIixcbiAgICAgIGxpbms6IFwiL3RlbXBsYXRlcy9wYXltZW50YWdlbnRcIixcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiQ29tbXVuaXR5XCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJTa2lsbHNcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb21tdW5pdHkvc2tpbGxzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlBsdWdpbnNcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb21tdW5pdHkvcGx1Z2luc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJUZW1wbGF0ZXNcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb21tdW5pdHkvdGVtcGxhdGVzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlZpYmVzXCIsXG4gICAgICAgICAgbGluazogXCIvY29tbXVuaXR5L3ZpYmVzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlByb2plY3RzXCIsXG4gICAgICAgICAgbGluazogXCIvY29tbXVuaXR5L3Byb2plY3RzXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJCdWlsZCBhZ2VudHNcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkdldCBzdGFydGVkXCIsXG4gICAgICAgICAgbGluazogXCIvYWdlbnRzL2dldC1zdGFydGVkXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkFnZW50IFNES1wiLFxuICAgICAgICAgIGxpbms6IFwiL2FnZW50cy9hZ2VudC1zZGtcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiR3JvdXBzXCIsXG4gICAgICAgICAgbGluazogXCIvYWdlbnRzL2dyb3Vwc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJJZGVudGl0eVwiLFxuICAgICAgICAgIGxpbms6IFwiL2FnZW50cy9pZGVudGl0eVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJHYXRlZCBncm91cFwiLFxuICAgICAgICAgIGxpbms6IFwiL2FnZW50cy9nYXRlZC1ncm91cFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJCdWlsZCB3aXRoIE1lc3NhZ2VLaXRcIixcbiAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vbWVzc2FnZS1raXQub3JnL1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJHdWlkZWxpbmVzXCIsXG4gICAgICAgICAgbGluazogXCIvYWdlbnRzL2d1aWRlbGluZXNcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkZyYW1ld29ya1wiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiT3ZlcnZpZXdcIixcbiAgICAgICAgICBsaW5rOiBcIi9mcmFtZXdvcmsvb3ZlcnZpZXdcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiU2tpbGxzXCIsXG4gICAgICAgICAgbGluazogXCIvZnJhbWV3b3JrL3NraWxsc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJEZXBsb3ltZW50XCIsXG4gICAgICAgICAgbGluazogXCIvZnJhbWV3b3JrL2RlcGxveW1lbnRcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQ29udHJpYnV0ZVwiLFxuICAgICAgICAgIGxpbms6IFwiL2ZyYW1ld29yay9jb250cmlidXRlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkNoYW5nZWxvZ1wiLFxuICAgICAgICAgIGxpbms6IFwiL2ZyYW1ld29yay9jaGFuZ2Vsb2dcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBLFNBQVMsb0JBQW9CO0FBS3ZCLG1CQUNFLEtBREY7QUFITixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNLE1BQU07QUFDVixXQUNFLGlDQUNFO0FBQUEsMEJBQUMsVUFBSyxTQUFRLFNBQVE7QUFBQSxNQUN0QixvQkFBQyxVQUFLLE1BQUssWUFBVyxTQUFRLHNCQUFxQjtBQUFBLE1BQ25ELG9CQUFDLFVBQUssVUFBUyxZQUFXLFNBQVEsY0FBYTtBQUFBLE1BQy9DLG9CQUFDLFVBQUssVUFBUyxZQUFXLFNBQVEsb0NBQW1DO0FBQUEsTUFDckUsb0JBQUMsVUFBSyxVQUFTLFlBQVcsU0FBUSxTQUFRO0FBQUEsTUFDMUMsb0JBQUMsVUFBSyxVQUFTLGNBQWEsU0FBUSxTQUFRO0FBQUEsTUFDNUMsb0JBQUMsVUFBSyxVQUFTLG1CQUFrQixTQUFRLFNBQVE7QUFBQSxNQUNqRCxvQkFBQyxVQUFLLFVBQVMsWUFBVyxTQUFRLG9DQUFtQztBQUFBLE1BQ3JFO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQyxVQUFTO0FBQUEsVUFDVCxTQUFRO0FBQUE7QUFBQSxNQUNWO0FBQUEsTUFFQSxvQkFBQyxVQUFLLFVBQVMscUJBQW9CLFNBQVEsUUFBTztBQUFBLE1BQ2xELG9CQUFDLFVBQUssVUFBUyw0QkFBMkIsU0FBUSxRQUFPO0FBQUEsTUFDekQ7QUFBQSxRQUFDO0FBQUE7QUFB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
