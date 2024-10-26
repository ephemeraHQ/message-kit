#!/usr/bin/env node
import { program } from "commander";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { intro, log, outro, text, select } from "@clack/prompts";
import { default as fs } from "fs-extra";
import { isCancel } from "@clack/prompts";
import pc from "picocolors";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read package.json to get the version
const packageJson = JSON.parse(
  fs.readFileSync(resolve(__dirname, "package.json"), "utf8"),
);
const version = packageJson.version;

program
  .name("byob")
  .description("CLI to initialize projects")
  .action(async () => {
    log.message(`\x1b[38;2;250;105;119m\
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    ███╗   ███╗███████╗███████╗███████╗ █████╗  ██████╗ ███████╗██╗  ██╗██╗████████╗
    ████╗ ████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝ ██╔════╝██║ ██╔╝██║╚══██╔══╝
    ██╔████╔██║█████╗  ███████╗███████╗███████║██║  ███╗█████╗  █████╔╝ ██║   ██║   
    ██║╚██╔╝██║██╔══╝  ╚════██║╚════██║██╔══██║██║   ██║██╔══╝  ██╔═██╗ ██║   ██║   
    ██║ ╚═╝ ██║███████╗███████║███████║██║  ██║╚██████╔╝███████╗██║  ██╗██║   ██║   
    ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝   
    powered by XMTP \x1b[0m`);

    const { templateType, displayName, destDir } = await gatherProjectInfo();

    // Replace dot files
    //replaceDotfiles(destDir);

    // Create .gitignore
    createGitignore(destDir);

    // Create .env file
    createEnvFile(destDir);

    // Create tsconfig.json file
    createTsconfig(destDir);

    // Replace package.json properties
    updatePackageJson(destDir, displayName);

    // Wrap up
    log.success(`Project launched in ${pc.red(destDir)}!`);

    const pkgManager = detectPackageManager();

    // Create README.md file
    createReadme(destDir, templateType, displayName, pkgManager);

    // Log next steps
    logNextSteps(displayName);

    outro(pc.red("Made with ❤️  by Ephemera"));
  });

program.parse(process.argv);

async function gatherProjectInfo() {
  const templateOptions = [
    { value: "gm", label: "GM" },
    { value: "agent", label: "Agent" },
    { value: "group", label: "Group" },
  ];

  const templateType = await select({
    message: "Select the type of template to initialize:",
    options: templateOptions,
  });

  if (isCancel(templateType)) {
    process.exit(0);
  }

  const templateDir = resolve(__dirname, `./examples/${templateType}`);

  // Ensure the template directory exists
  if (!fs.existsSync(templateDir)) {
    console.error("Template directory does not exist.");
    process.exit(1);
  }

  const displayName = await text({
    message: "What is the name of the project to initialize?",
    validate(value) {
      if (!value) return "Please enter a name.";
      return;
    },
  });

  if (isCancel(displayName)) {
    process.exit(0);
  }

  const name = kebabcase(displayName);
  const destDir = resolve(process.cwd(), name);

  // Copy template files
  fs.copySync(templateDir, destDir);

  return { templateType, displayName, destDir, templateDir };
}

function updateDependenciesToLatest(pkgJson) {
  const updateToLatest = (deps) => {
    for (const key in deps) {
      if (deps[key].startsWith("workspace:")) {
        deps[key] = "latest";
      }
    }
  };

  if (pkgJson.dependencies) {
    updateToLatest(pkgJson.dependencies);
  }

  if (pkgJson.devDependencies) {
    updateToLatest(pkgJson.devDependencies);
  }
}

function createTsconfig(destDir) {
  const tsconfigContent = {
    include: ["src/**/*"],
    compilerOptions: {
      outDir: "./dist",
      esModuleInterop: true,
      declaration: true,
      declarationMap: true,
      forceConsistentCasingInFileNames: true,
      isolatedModules: true,
      lib: ["ESNext"],
      module: "ESNext",
      moduleResolution: "node",
      resolveJsonModule: true,
      skipLibCheck: true,
      sourceMap: true,
      strict: true,
      target: "ESNext",
    },
  };

  fs.writeJsonSync(resolve(destDir, "tsconfig.json"), tsconfigContent, {
    spaces: 2,
  });
}
function replaceDotfiles(destDir) {
  for (const file of fs.readdirSync(destDir)) {
    if (!file.startsWith("_")) continue;
    fs.renameSync(
      resolve(destDir, file),
      resolve(destDir, `.${file.slice(1)}`),
    );
  }
}

function updatePackageJson(destDir, name) {
  const pkgJson = fs.readJsonSync(resolve(destDir, "package.json"));
  pkgJson.name = name;
  updateDependenciesToLatest(pkgJson);
  fs.writeJsonSync(resolve(destDir, "package.json"), pkgJson, { spaces: 2 });
}

function logNextSteps(name) {
  log.message("Next steps:");
  log.step(`1. ${pc.red(`cd ./${name}`)} - Navigate to project`);
  log.step(`2. ${pc.red(`code .`)} - Open with your favorite editor`);
  log.step(`3. ${pc.green("Start building!")}`);
}
function createGitignore(destDir) {
  const gitignoreContent = `
# Main
.env
node_modules/
.gitignore
.data/
dist/
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE files
.vscode/
.idea/

# packages
.yarn/
.pnpm/
.pnpm-workspace/`;

  fs.writeFileSync(resolve(destDir, ".gitignore"), gitignoreContent.trim());
}

function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent;
  if (!userAgent) return "npm";
  if (userAgent.includes("bun")) return "bun";
  if (userAgent.includes("yarn")) return "yarn";
  if (userAgent.includes("pnpm")) return "pnpm";
  if (userAgent.includes("npm")) return "npm";
  return "npm";
}

function kebabcase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function createEnvFile(destDir) {
  fs.writeFileSync(resolve(destDir, ".env"), "");
}

// Create README.md file
function createReadme(destDir, templateType, projectName, packageManager) {
  const envExampleContent = fs.readFileSync(
    resolve(destDir, ".env.example"),
    "utf8",
  );

  const readmeContent = `# ${projectName}

This project is powered by [MessageKit](https://messagekit.ephemerahq.com/) 

## Setup

Follow these steps to set up and run the project:

1. **Navigate to the project directory:**

\`\`\`sh
cd ./${projectName}
\`\`\`

2. **Set up your environment variables:**

\`\`\`sh
${envExampleContent}
\`\`\`

3. **Install dependencies:**

\`\`\`sh
${packageManager} install
\`\`\`

4. **Run the project:**

\`\`\`sh
${packageManager === "npm" ? "npm run" : packageManager} dev
\`\`\`

5. Enjoy!
---
Made with ❤️ by [XMTP](https://xmtp.org)
`;

  fs.writeFileSync(resolve(destDir, "README.md"), readmeContent.trim());
}
