import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { exitCode } from "process";

// Function to update the version in package.json
function updatePackageVersion(packagePath, versionType) {
  const packageJsonPath = path.join(packagePath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Extract current version
  const currentVersion = packageJson.version;
  console.log(`Current version of ${packageJson.name}: ${currentVersion}`);

  // Bump version (simplified logic, you might want to use a library like 'semver' for this)
  const versionParts = currentVersion.split(".").map(Number);
  let newVersion = currentVersion;
  if (versionType === "major") {
    versionParts[0] += 1;
    versionParts[1] = 0;
    versionParts[2] = 0;
    newVersion = versionParts.join(".");
  } else if (versionType === "minor") {
    versionParts[1] += 1;
    versionParts[2] = 0;
    newVersion = versionParts.join(".");
  } else if (versionType === "patch") {
    versionParts[2] += 1;
    newVersion = versionParts.join(".");
  }

  packageJson.version = newVersion;
  // Write updated version back to package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`Updated version of ${packageJson.name} to: ${newVersion}`);
}

// Get the version type from command line arguments
const versionType = process.argv[2];

// Update versions for each package
const packages = [
  "packages/message-kit",
  "packages/agent-starter",
  "packages/create-message-kit",
];

packages.forEach((packagePath) => {
  updatePackageVersion(packagePath, versionType);
});

execSync(`changeset publish`, { stdio: "inherit" });
