const fs = require("fs");
const path = require("path");
const { program } = require("commander");

program
  .option("-v, --version <type>", "version number to update")
  .parse(process.argv);

const options = program.opts();

if (!options.version) {
  console.error(
    "Please specify a version number using the -v or --version flag.",
  );
  process.exit(1);
}

const newVersion = options.version;

const filesToUpdate = [
  "packages/message-kit/package.json",
  "packages/create-message-kit/package.json",
  "packages/docs/vocs.config.tsx",
  "packages/create-message-kit/index.js",
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
