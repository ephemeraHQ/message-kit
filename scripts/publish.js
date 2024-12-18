import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Function to update the version in package.json
function updatePackageVersion(packagePath, versionType) {
  const packageJsonPath = path.join(packagePath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Extract current version
  const currentVersion = packageJson.version;
  console.log(`Current version of ${packageJson.name}: ${currentVersion}`);

  // Bump version (simplified logic, you might want to use a library like 'semver' for this)
  const versionParts = currentVersion.split(".").map(Number);
  if (versionType === "major") {
    versionParts[0] += 1;
    versionParts[1] = 0;
    versionParts[2] = 0;
  } else if (versionType === "minor") {
    versionParts[1] += 1;
    versionParts[2] = 0;
  } else {
    versionParts[2] += 1;
  }
  const newVersion = versionParts.join(".");
  packageJson.version = newVersion;

  // Write updated version back to package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`Updated version of ${packageJson.name} to: ${newVersion}`);
}

// Get the version type from command line arguments
const versionType = process.argv[2] || "patch"; // Default to 'patch' if no argument is provided

// Update versions for each package
const packages = [
  "packages/message-kit",
  "packages/agent",
  "packages/create-message-kit",
];

packages.forEach((packagePath) =>
  updatePackageVersion(packagePath, versionType),
);

// Execute the rest of the script
execSync(
  `yarn install && yarn build && yarn copy && node scripts/update-version.js -t ${versionType} && changeset publish`,
  { stdio: "inherit" },
);
