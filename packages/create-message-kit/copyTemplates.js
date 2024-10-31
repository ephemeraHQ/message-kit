import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { default as fs } from "fs-extra";

const __dirname = dirname(fileURLToPath(import.meta.url));

const examples = ["group", "gm", "agent"];
const templateDir = resolve(__dirname, "examples");
async function copyExamples() {
  try {
    for (const example of examples) {
      const srcDir = resolve(__dirname, `../../templates/${example}`);
      const destDir = resolve(templateDir, example);
      if (fs.existsSync(srcDir)) {
        const itemsToCopy = ["package.json", "src", ".env.example"];
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
    console.log("All examples copied successfully.");
  } catch (error) {
    console.error("Error copying examples:", error);
  }
}
copyExamples();
