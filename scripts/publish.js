const readlineSync = require("readline-sync");
const { execSync } = require("child_process");

// Get the version type from command line arguments
const versionType = process.argv[2] || "patch"; // Default to 'patch' if no argument is provided

execSync(
  `turbo run build --filter="./packages/*" --filter="!./packages/docs" && yarn copy && node scripts/update-version.js -t ${versionType} && changeset publish`,
  { stdio: "inherit" },
);
