# Contributing to MessageKit

Welcome to the MessageKit community! We're excited to have you contribute to making MessageKit better. There are several ways you can contribute:

## Skills

Skills are the building blocks of MessageKit agents. Share your skills with the community:

```tsx
// Example skill structure
export const yourSkill: Skill[] = [
  {
    skill: "/yourskill [param]",
    handler: handler,
    examples: ["/yourskill example"],
    description: "Description of what your skill does",
    params: {
      param: {
        type: "string",
        description: "What this parameter does",
      },
    },
  },
];
```

### Guidelines

- Make it work in the playground

```bash
message-kit/
└── templates/
    └── playground/
        ├── skills/
        │   └── your-skill.ts
        ├── package.json
        └── README.md
```

- See how other skills are structured in the docs
- Add the skill to the [skills](https://github.com/ephemeraHQ/message-kit/blob/community/packages/docs/pages/community/skills.mdx) community page

```bash
message-kit/
└── packages/
    └── docs/
        └── pages/
            └── skills/
                └── your-skill.mdx
            └── community/
                └── skills.mdx
        ├── package.json
        └── README.md
```

## Templates

Templates help developers quickly bootstrap new agents. Here's how to contribute a template:

### Guidelines

- Make it work in the playground

```bash
message-kit/
└── templates/
    └── your-template/
        ├── src/
        │   ├── index.ts
        │   ├── prompt.ts
        │   └── skills/ # Optional
        │   └── plugins/ # Optional
        ├── package.json
        └── README.md
```

- See how other templates are structured in the docs
- Add the template to the [templates](https://github.com/ephemeraHQ/message-kit/blob/community/packages/docs/pages/community/templates.mdx) community page

```bash
message-kit/
└── packages/
    └── docs/
        └── pages/
            └── templates/
                └── your-template.mdx
            └── community/
                └── templates.mdx
        ├── package.json
        └── README.md
```

## Plugins

Plugins extend MessageKit's skills functionality. Here's how a plugin is structured:

### Guidelines

- Clear documentation of parameters
- Make it work in the playground

```bash
message-kit/
└── templates/
    └── playground/
        ├── plugins/
        │   └── your-plugin.ts
        ├── package.json
        └── README.md
```

- See how other plugins are structured in the docs
- Add the plugin to the [plugins](https://github.com/ephemeraHQ/message-kit/blob/community/packages/docs/pages/community/plugins.mdx) community page

```bash
message-kit/
└── packages/
    └── docs/
        └── pages/
            └── plugins/
                └── your-plugin.mdx
            └── community/
                └── plugins.mdx
        ├── package.json
        └── README.md
```

## Development workflow

#### Fork & Clone

```bash
git clone https://github.com/ephemeraHQ/message-kit.git
cd message-kit
```

#### Create a Branch

```bash
git checkout -b community/your-feature-name
```

#### Make Changes

- Write your code
- Add tests
- Update documentation

#### Build

```bash
# Install dependencies
yarn install

# Build
yarn build

# Run tests
yarn test
```

#### Submit PR

- Create a pull request
- Describe your changes
- Link related issues
