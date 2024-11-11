import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { default as fs } from "fs-extra";

const __dirname = dirname(fileURLToPath(import.meta.url));

const templates = ["group", "gm", "agent"];
const templateDir = resolve(__dirname, "templates");
async function copyTemplates() {
  try {
    for (const template of templates) {
      const srcDir = resolve(__dirname, `../../templates/${template}`);
      const destDir = resolve(templateDir, template);
      if (fs.existsSync(srcDir)) {
        const itemsToCopy = ["src", ".env.example"];
        for (const item of itemsToCopy) {
          const srcItem = resolve(srcDir, item);
          const destItem = resolve(destDir, item);
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
