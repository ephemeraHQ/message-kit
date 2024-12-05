import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templates = ["gpt", "agent", "community"];
const templateDir = path.resolve(
  __dirname,
  "../packages/create-message-kit/templates",
);
//test
async function copyTemplates() {
  try {
    // Copy root .cursorrules to each template
    const rootCursorRules = path.resolve(__dirname, "../.cursorrules");

    for (const template of templates) {
      const srcDir = path.resolve(__dirname, `../templates/${template}`);
      const destDir = path.resolve(templateDir, template);

      // Create destination directory if it doesn't exist
      await fs.ensureDir(destDir);

      // Copy root .cursorrules if it exists
      if (fs.existsSync(rootCursorRules)) {
        const destCursorRules = path.resolve(destDir, ".cursorrules");
        await fs.copy(rootCursorRules, destCursorRules);
        console.log(`Copied root .cursorrules to ${destCursorRules}`);
      }

      if (fs.existsSync(srcDir)) {
        const itemsToCopy = [
          "src",
          ".env.example",
          "package.json",
          ".yarnrc.yml",
        ];

        for (const item of itemsToCopy) {
          const srcItem = path.resolve(srcDir, item);
          const destItem = path.resolve(destDir, item);
          if (fs.existsSync(srcItem)) {
            await fs.copy(srcItem, destItem);
            console.log(`Copied ${srcItem} to ${destItem}`);
          } else {
            console.warn(`Item ${srcItem} does not exist.`);
          }
        }
      } else {
        console.warn(`Source directory ${srcDir} does not exist.`);
      }
    }
    console.log("All templates copied successfully.");
  } catch (error) {
    console.error("Error copying templates:", error);
  }
}

copyTemplates();
