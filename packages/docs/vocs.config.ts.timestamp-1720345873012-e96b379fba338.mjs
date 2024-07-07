// vocs.config.ts
import { defineConfig } from "file:///Users/fabrizioguespe/DevRel/message-kit/packages/docs/node_modules/vocs/_lib/index.js";
var vocs_config_default = defineConfig({
  title: "MessageKit",
  rootDir: ".",
  theme: {
    colorScheme: "dark",
    accentColor: {
      light: "#F04D23",
      dark: "#F04D23"
    }
  },
  socials: [
    {
      icon: "github",
      link: "https://github.com/xmtp-labs/message-kit"
    }
  ],
  editLink: {
    pattern: "https://github.com/xmtp-labs/message-kit/packages/docs/main/:path",
    text: "Suggest changes to this page"
  },
  sidebar: [
    {
      text: "Installation",
      link: "/installation"
    },
    {
      text: "App directory",
      link: "/directory"
    },
    {
      text: "Deployment",
      link: "/deployment"
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
            { text: "Text", link: "/concepts/content-types/text" },
            { text: "Reaction", link: "/concepts/content-types/reaction" },
            { text: "Reply", link: "/concepts/content-types/reply" },
            { text: "Command", link: "/concepts/content-types/command" },
            { text: "Attachment", link: "/concepts/content-types/attachment" },
            {
              text: "Group update",
              link: "/concepts/content-types/group-update"
            }
          ]
        },
        {
          text: "Commands",
          link: "/concepts/commands"
        },
        {
          text: "Agents",
          link: "/concepts/agents"
        },
        {
          text: "Groups",
          link: "/concepts/groups"
        }
        /*
        {
          text: "Access",
          link: "/concepts/access",
        },*/
      ]
    },
    {
      text: "Use cases",
      collapsed: false,
      items: [
        {
          text: "Group chat",
          link: "/use-cases/group",
          items: [
            {
              text: "Agents",
              link: "/use-cases/group/agents"
            },
            {
              text: "Tipping",
              link: "/use-cases/group/tipping"
            },
            {
              text: "Betting",
              link: "/use-cases/group/betting"
            },
            {
              text: "Games",
              link: "/use-cases/group/games"
            },
            {
              text: "Transactions",
              link: "/use-cases/group/transactions"
            },
            {
              text: "Split Payments",
              link: "/use-cases/group/payments"
            },
            {
              text: "Admin",
              link: "/use-cases/group/admin"
            }
          ]
        },
        {
          text: "One-to-one",
          link: "/use-cases/one-to-one",
          items: [
            {
              text: "Subscribe",
              link: "/use-cases/one-to-one/subscribe"
            },
            {
              text: "Broadcast",
              link: "/use-cases/one-to-one/broadcast"
            }
          ]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZmFicml6aW9ndWVzcGUvRGV2UmVsL21lc3NhZ2Uta2l0L3BhY2thZ2VzL2RvY3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9mYWJyaXppb2d1ZXNwZS9EZXZSZWwvbWVzc2FnZS1raXQvcGFja2FnZXMvZG9jcy92b2NzLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvZmFicml6aW9ndWVzcGUvRGV2UmVsL21lc3NhZ2Uta2l0L3BhY2thZ2VzL2RvY3Mvdm9jcy5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidm9jc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICB0aXRsZTogXCJNZXNzYWdlS2l0XCIsXG4gIHJvb3REaXI6IFwiLlwiLFxuICB0aGVtZToge1xuICAgIGNvbG9yU2NoZW1lOiBcImRhcmtcIixcbiAgICBhY2NlbnRDb2xvcjoge1xuICAgICAgbGlnaHQ6IFwiI0YwNEQyM1wiLFxuICAgICAgZGFyazogXCIjRjA0RDIzXCIsXG4gICAgfSxcbiAgfSxcbiAgc29jaWFsczogW1xuICAgIHtcbiAgICAgIGljb246IFwiZ2l0aHViXCIsXG4gICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS94bXRwLWxhYnMvbWVzc2FnZS1raXRcIixcbiAgICB9LFxuICBdLFxuICBlZGl0TGluazoge1xuICAgIHBhdHRlcm46XG4gICAgICBcImh0dHBzOi8vZ2l0aHViLmNvbS94bXRwLWxhYnMvbWVzc2FnZS1raXQvcGFja2FnZXMvZG9jcy9tYWluLzpwYXRoXCIsXG4gICAgdGV4dDogXCJTdWdnZXN0IGNoYW5nZXMgdG8gdGhpcyBwYWdlXCIsXG4gIH0sXG4gIHNpZGViYXI6IFtcbiAgICB7XG4gICAgICB0ZXh0OiBcIkluc3RhbGxhdGlvblwiLFxuICAgICAgbGluazogXCIvaW5zdGFsbGF0aW9uXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkFwcCBkaXJlY3RvcnlcIixcbiAgICAgIGxpbms6IFwiL2RpcmVjdG9yeVwiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJEZXBsb3ltZW50XCIsXG4gICAgICBsaW5rOiBcIi9kZXBsb3ltZW50XCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkNvbmNlcHRzXCIsXG4gICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiU3RydWN0dXJlXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMvc3RydWN0dXJlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk1lc3NhZ2VzXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMvbWVzc2FnZXNcIixcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgeyB0ZXh0OiBcIlRleHRcIiwgbGluazogXCIvY29uY2VwdHMvY29udGVudC10eXBlcy90ZXh0XCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJSZWFjdGlvblwiLCBsaW5rOiBcIi9jb25jZXB0cy9jb250ZW50LXR5cGVzL3JlYWN0aW9uXCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJSZXBseVwiLCBsaW5rOiBcIi9jb25jZXB0cy9jb250ZW50LXR5cGVzL3JlcGx5XCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJDb21tYW5kXCIsIGxpbms6IFwiL2NvbmNlcHRzL2NvbnRlbnQtdHlwZXMvY29tbWFuZFwiIH0sXG4gICAgICAgICAgICB7IHRleHQ6IFwiQXR0YWNobWVudFwiLCBsaW5rOiBcIi9jb25jZXB0cy9jb250ZW50LXR5cGVzL2F0dGFjaG1lbnRcIiB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkdyb3VwIHVwZGF0ZVwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9jb25jZXB0cy9jb250ZW50LXR5cGVzL2dyb3VwLXVwZGF0ZVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJDb21tYW5kc1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbmNlcHRzL2NvbW1hbmRzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkFnZW50c1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbmNlcHRzL2FnZW50c1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJHcm91cHNcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb25jZXB0cy9ncm91cHNcIixcbiAgICAgICAgfSxcbiAgICAgICAgLypcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiQWNjZXNzXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMvYWNjZXNzXCIsXG4gICAgICAgIH0sKi9cbiAgICAgIF0sXG4gICAgfSxcblxuICAgIHtcbiAgICAgIHRleHQ6IFwiVXNlIGNhc2VzXCIsXG4gICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiR3JvdXAgY2hhdFwiLFxuICAgICAgICAgIGxpbms6IFwiL3VzZS1jYXNlcy9ncm91cFwiLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiQWdlbnRzXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3VzZS1jYXNlcy9ncm91cC9hZ2VudHNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiVGlwcGluZ1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2UtY2FzZXMvZ3JvdXAvdGlwcGluZ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJCZXR0aW5nXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3VzZS1jYXNlcy9ncm91cC9iZXR0aW5nXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkdhbWVzXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3VzZS1jYXNlcy9ncm91cC9nYW1lc1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJUcmFuc2FjdGlvbnNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNlLWNhc2VzL2dyb3VwL3RyYW5zYWN0aW9uc1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJTcGxpdCBQYXltZW50c1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2UtY2FzZXMvZ3JvdXAvcGF5bWVudHNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiQWRtaW5cIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNlLWNhc2VzL2dyb3VwL2FkbWluXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk9uZS10by1vbmVcIixcbiAgICAgICAgICBsaW5rOiBcIi91c2UtY2FzZXMvb25lLXRvLW9uZVwiLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiU3Vic2NyaWJlXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3VzZS1jYXNlcy9vbmUtdG8tb25lL3N1YnNjcmliZVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJCcm9hZGNhc3RcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNlLWNhc2VzL29uZS10by1vbmUvYnJvYWRjYXN0XCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJGcmFtZXNcIixcbiAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICBsaW5rOiBcIi9mcmFtZXNcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkludHJvZHVjdGlvblwiLFxuICAgICAgICAgIGxpbms6IFwiL2ZyYW1lc1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJGcmFtZXdvcmtzXCIsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJPbmNoYWluS2l0XCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL2ZyYW1lcy9mcmFtZXdvcmtzL29uY2hhaW5raXRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiRnJhbWVzLmpzXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL2ZyYW1lcy9mcmFtZXdvcmtzL2ZyYW1lc2pzXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkZyb2dcIixcbiAgICAgICAgICAgICAgbGluazogXCIvZnJhbWVzL2ZyYW1ld29ya3MvZnJvZ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJUdXRvcmlhbHNcIixcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlN1YnNjcmliZVwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9mcmFtZXMvdHV0b3JpYWxzL3N1YnNjcmliZVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJUcmFuc2FjdGlvbnNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvZnJhbWVzL3R1dG9yaWFscy90cmFuc2FjdGlvbnNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVixTQUFTLG9CQUFvQjtBQUVqWCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPO0FBQUEsRUFDUCxTQUFTO0FBQUEsRUFDVCxPQUFPO0FBQUEsSUFDTCxhQUFhO0FBQUEsSUFDYixhQUFhO0FBQUEsTUFDWCxPQUFPO0FBQUEsTUFDUCxNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFVBQVU7QUFBQSxJQUNSLFNBQ0U7QUFBQSxJQUNGLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sV0FBVztBQUFBLE1BQ1gsT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07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
