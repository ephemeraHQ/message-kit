import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs";
import { program } from "commander";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

program
  .option("-v, --version <type>", "version number to update")
  .option("-t, --type <type>", "type of version update: patch, minor, major")
  .parse(process.argv);

const options = program.opts();

if (!options.version && !options.type) {
  console.error(
    "Please specify a version number using the -v or --version flag, or specify a type using the -t or --type flag.",
  );
  process.exit(1);
}

let newVersion = options.version || options.type;

if (!newVersion) {
  const currentVersion = require(
    path.resolve(__dirname, "../packages/message-kit/package.json"),
  ).version;
  const [major, minor, patch] = currentVersion.split(".").map(Number);

  switch (options.type) {
    case "major":
      newVersion = `${major + 1}.0.0`;
      break;
    case "minor":
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case "patch":
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    default:
      console.error(
        "Invalid type specified. Use 'patch', 'minor', 'major', or a specific version number.",
      );
      process.exit(1);
  }
}

const filesToUpdate = [
  "../packages/message-kit/package.json",
  "../packages/create-message-kit/package.json",
  "../packages/docs/vocs.config.tsx",
  "../packages/create-message-kit/index.js",
];

filesToUpdate.forEach((filePath) => {
  const fullPath = path.resolve(__dirname, filePath);
  let content = fs.readFileSync(fullPath, "utf8");

  if (filePath.endsWith("package.json")) {
    const jsonContent = JSON.parse(content);
    jsonContent.version = newVersion;
    content = JSON.stringify(jsonContent, null, 2);
  } else if (filePath.endsWith("vocs.config.tsx")) {
    content = content.replace(/v\d+\.\d+\.\d+/g, `v${newVersion}`);
  } else if (filePath.endsWith("index.js")) {
    content = content.replace(
      /const defVersion = "(\d+\.\d+\.\d+)"/,
      `const defVersion = "${newVersion}"`,
    );
  }

  fs.writeFileSync(fullPath, content, "utf8");
  console.log(`Updated version in ${filePath}`);
});
