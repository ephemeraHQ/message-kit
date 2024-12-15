import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.resolve(__dirname, "../templates");
const templateDestinationDir = path.resolve(
  __dirname,
  "../packages/create-message-kit/templates",
);
const templates = fs.readdirSync(templatesDir).filter((file) => {
  return (
    fs.statSync(path.join(templatesDir, file)).isDirectory() &&
    ["simple", "ens", "paymentagent"].includes(file)
  ); // Only include simple and ens templates
});

//test
async function copyTemplates() {
  try {
    // Remove destination directory if it exists
    if (fs.existsSync(templateDestinationDir)) {
      await fs.remove(templateDestinationDir);
      console.log(
        `Removed existing templates directory: ${templateDestinationDir}`,
      );
    }

    // Create fresh destination directory
    await fs.ensureDir(templateDestinationDir);

    // Copy templates
    for (const template of templates) {
      const srcDir = path.resolve(__dirname, `../templates/${template}`);
      const destDir = path.resolve(templateDestinationDir, template);

      // Create destination directory if it doesn't exist
      await fs.ensureDir(destDir);

      if (fs.existsSync(srcDir)) {
        const itemsToCopy = [
          "src",
          ".env.example",
          "package.json",
          "../../.yarnrc.yml",
          "../../.cursorrules",
        ];

        for (const item of itemsToCopy) {
          const srcItem = path.resolve(srcDir, item);
          const destItem = path.resolve(destDir, path.basename(item));

          if (fs.existsSync(srcItem)) {
            const stat = fs.statSync(srcItem);
            if (stat.isDirectory()) {
              await fs.copy(srcItem, destItem);
            } else {
              await fs.copyFile(srcItem, destItem);
            }
          } else {
            console.warn(`Item ${srcItem} does not exist.`);
          }
        }
        console.log(`Copied template ${template} to ${destDir}`);
      } else {
        console.warn(`Source directory ${srcDir} does not exist.`);
      }
    }

    console.log("All templates and templates.json copied successfully.");
  } catch (error) {
    console.error("Error copying templates:", error);
  }
}

copyTemplates();
