// vocs.config.ts
import { defineConfig } from "file:///Users/fabrizioguespe/DevRel/message-kit/packages/docs/node_modules/vocs/_lib/index.js";
var vocs_config_default = defineConfig({
  title: "MessageKit",
  rootDir: ".",
  theme: {
    colorScheme: "dark",
    accentColor: {
      light: "#F04D23",
      dark: "#F04D23",
    },
  },
  socials: [
    {
      icon: "github",
      link: "https://github.com/xmtp-labs/message-kit",
    },
  ],
  editLink: {
    pattern:
      "https://github.com/xmtp-labs/message-kit/packages/docs/main/:path",
    text: "Suggest changes to this page",
  },
  sidebar: [
    {
      text: "Installation",
      link: "/installation",
    },
    {
      text: "App directory",
      link: "/directory",
    },
    {
      text: "Deployment",
      link: "/deployment",
    },
    {
      text: "Concepts",
      collapsed: false,
      items: [
        {
          text: "Structure",
          link: "/concepts/structure",
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
              link: "/concepts/content-types/group-update",
            },
          ],
        },
        {
          text: "Commands",
          link: "/concepts/commands",
        },
        {
          text: "Groups",
          link: "/concepts/groups",
        },
        /*
        {
          text: "Access",
          link: "/concepts/access",
        },*/
      ],
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
              link: "/use-cases/group/agents",
            },
            {
              text: "Tipping",
              link: "/use-cases/group/tipping",
            },
            {
              text: "Betting",
              link: "/use-cases/group/betting",
            },
            {
              text: "Games",
              link: "/use-cases/group/games",
            },
            {
              text: "Transactions",
              link: "/use-cases/group/transactions",
            },
            {
              text: "Split Payments",
              link: "/use-cases/group/payments",
            },
            {
              text: "Admin",
              link: "/use-cases/group/admin",
            },
            {
              text: "Loyalty",
              link: "/use-cases/group/loyalty",
            },
          ],
        },
        {
          text: "One-to-one",
          link: "/use-cases/one-to-one",
          items: [
            {
              text: "Subscribe",
              link: "/use-cases/one-to-one/subscribe",
            },
            {
              text: "Broadcast",
              link: "/use-cases/one-to-one/broadcast",
            },
          ],
        },
      ],
    },
    {
      text: "Frames",
      collapsed: false,
      link: "/frames",
      items: [
        {
          text: "Introduction",
          link: "/frames",
        },
        {
          text: "Frameworks",
          items: [
            {
              text: "OnchainKit",
              link: "/frames/frameworks/onchainkit",
            },
            {
              text: "Frames.js",
              link: "/frames/frameworks/framesjs",
            },
            {
              text: "Frog",
              link: "/frames/frameworks/frog",
            },
          ],
        },
        {
          text: "Tutorials",
          items: [
            {
              text: "Subscribe",
              link: "/frames/tutorials/subscribe",
            },
            {
              text: "Transactions",
              link: "/frames/tutorials/transactions",
            },
          ],
        },
      ],
    },
  ],
});
export { vocs_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZmFicml6aW9ndWVzcGUvRGV2UmVsL21lc3NhZ2Uta2l0L3BhY2thZ2VzL2RvY3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9mYWJyaXppb2d1ZXNwZS9EZXZSZWwvbWVzc2FnZS1raXQvcGFja2FnZXMvZG9jcy92b2NzLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvZmFicml6aW9ndWVzcGUvRGV2UmVsL21lc3NhZ2Uta2l0L3BhY2thZ2VzL2RvY3Mvdm9jcy5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidm9jc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICB0aXRsZTogXCJNZXNzYWdlS2l0XCIsXG4gIHJvb3REaXI6IFwiLlwiLFxuICB0aGVtZToge1xuICAgIGNvbG9yU2NoZW1lOiBcImRhcmtcIixcbiAgICBhY2NlbnRDb2xvcjoge1xuICAgICAgbGlnaHQ6IFwiI0YwNEQyM1wiLFxuICAgICAgZGFyazogXCIjRjA0RDIzXCIsXG4gICAgfSxcbiAgfSxcbiAgc29jaWFsczogW1xuICAgIHtcbiAgICAgIGljb246IFwiZ2l0aHViXCIsXG4gICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS94bXRwLWxhYnMvbWVzc2FnZS1raXRcIixcbiAgICB9LFxuICBdLFxuICBlZGl0TGluazoge1xuICAgIHBhdHRlcm46XG4gICAgICBcImh0dHBzOi8vZ2l0aHViLmNvbS94bXRwLWxhYnMvbWVzc2FnZS1raXQvcGFja2FnZXMvZG9jcy9tYWluLzpwYXRoXCIsXG4gICAgdGV4dDogXCJTdWdnZXN0IGNoYW5nZXMgdG8gdGhpcyBwYWdlXCIsXG4gIH0sXG4gIHNpZGViYXI6IFtcbiAgICB7XG4gICAgICB0ZXh0OiBcIkluc3RhbGxhdGlvblwiLFxuICAgICAgbGluazogXCIvaW5zdGFsbGF0aW9uXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkFwcCBkaXJlY3RvcnlcIixcbiAgICAgIGxpbms6IFwiL2RpcmVjdG9yeVwiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJEZXBsb3ltZW50XCIsXG4gICAgICBsaW5rOiBcIi9kZXBsb3ltZW50XCIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkNvbmNlcHRzXCIsXG4gICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiU3RydWN0dXJlXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMvc3RydWN0dXJlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIk1lc3NhZ2VzXCIsXG4gICAgICAgICAgbGluazogXCIvY29uY2VwdHMvbWVzc2FnZXNcIixcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgeyB0ZXh0OiBcIlRleHRcIiwgbGluazogXCIvY29uY2VwdHMvY29udGVudC10eXBlcy90ZXh0XCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJSZWFjdGlvblwiLCBsaW5rOiBcIi9jb25jZXB0cy9jb250ZW50LXR5cGVzL3JlYWN0aW9uXCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJSZXBseVwiLCBsaW5rOiBcIi9jb25jZXB0cy9jb250ZW50LXR5cGVzL3JlcGx5XCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJDb21tYW5kXCIsIGxpbms6IFwiL2NvbmNlcHRzL2NvbnRlbnQtdHlwZXMvY29tbWFuZFwiIH0sXG4gICAgICAgICAgICB7IHRleHQ6IFwiQXR0YWNobWVudFwiLCBsaW5rOiBcIi9jb25jZXB0cy9jb250ZW50LXR5cGVzL2F0dGFjaG1lbnRcIiB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkdyb3VwIHVwZGF0ZVwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9jb25jZXB0cy9jb250ZW50LXR5cGVzL2dyb3VwLXVwZGF0ZVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJDb21tYW5kc1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbmNlcHRzL2NvbW1hbmRzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkdyb3Vwc1wiLFxuICAgICAgICAgIGxpbms6IFwiL2NvbmNlcHRzL2dyb3Vwc1wiLFxuICAgICAgICB9LFxuICAgICAgICAvKlxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJBY2Nlc3NcIixcbiAgICAgICAgICBsaW5rOiBcIi9jb25jZXB0cy9hY2Nlc3NcIixcbiAgICAgICAgfSwqL1xuICAgICAgXSxcbiAgICB9LFxuXG4gICAge1xuICAgICAgdGV4dDogXCJVc2UgY2FzZXNcIixcbiAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJHcm91cCBjaGF0XCIsXG4gICAgICAgICAgbGluazogXCIvdXNlLWNhc2VzL2dyb3VwXCIsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJBZ2VudHNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNlLWNhc2VzL2dyb3VwL2FnZW50c1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJUaXBwaW5nXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3VzZS1jYXNlcy9ncm91cC90aXBwaW5nXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkJldHRpbmdcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNlLWNhc2VzL2dyb3VwL2JldHRpbmdcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiR2FtZXNcIixcbiAgICAgICAgICAgICAgbGluazogXCIvdXNlLWNhc2VzL2dyb3VwL2dhbWVzXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlRyYW5zYWN0aW9uc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2UtY2FzZXMvZ3JvdXAvdHJhbnNhY3Rpb25zXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlNwbGl0IFBheW1lbnRzXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3VzZS1jYXNlcy9ncm91cC9wYXltZW50c1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJBZG1pblwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2UtY2FzZXMvZ3JvdXAvYWRtaW5cIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiTG95YWx0eVwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2UtY2FzZXMvZ3JvdXAvbG95YWx0eVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJPbmUtdG8tb25lXCIsXG4gICAgICAgICAgbGluazogXCIvdXNlLWNhc2VzL29uZS10by1vbmVcIixcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIlN1YnNjcmliZVwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi91c2UtY2FzZXMvb25lLXRvLW9uZS9zdWJzY3JpYmVcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiQnJvYWRjYXN0XCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL3VzZS1jYXNlcy9vbmUtdG8tb25lL2Jyb2FkY2FzdFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiRnJhbWVzXCIsXG4gICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgbGluazogXCIvZnJhbWVzXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJJbnRyb2R1Y3Rpb25cIixcbiAgICAgICAgICBsaW5rOiBcIi9mcmFtZXNcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiRnJhbWV3b3Jrc1wiLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiT25jaGFpbktpdFwiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9mcmFtZXMvZnJhbWV3b3Jrcy9vbmNoYWlua2l0XCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkZyYW1lcy5qc1wiLFxuICAgICAgICAgICAgICBsaW5rOiBcIi9mcmFtZXMvZnJhbWV3b3Jrcy9mcmFtZXNqc1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJGcm9nXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL2ZyYW1lcy9mcmFtZXdvcmtzL2Zyb2dcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6IFwiVHV0b3JpYWxzXCIsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJTdWJzY3JpYmVcIixcbiAgICAgICAgICAgICAgbGluazogXCIvZnJhbWVzL3R1dG9yaWFscy9zdWJzY3JpYmVcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiVHJhbnNhY3Rpb25zXCIsXG4gICAgICAgICAgICAgIGxpbms6IFwiL2ZyYW1lcy90dXRvcmlhbHMvdHJhbnNhY3Rpb25zXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1YsU0FBUyxvQkFBb0I7QUFFalgsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLEVBQ1AsU0FBUztBQUFBLEVBQ1QsT0FBTztBQUFBLElBQ0wsYUFBYTtBQUFBLElBQ2IsYUFBYTtBQUFBLE1BQ1gsT0FBTztBQUFBLE1BQ1AsTUFBTTtBQUFBLElBQ1I7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxFQUNGO0FBQUEsRUFDQSxVQUFVO0FBQUEsSUFDUixTQUNFO0FBQUEsSUFDRixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1A7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU87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
