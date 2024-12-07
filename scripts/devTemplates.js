console.log("Starting devTemplates script...");

import { execSync } from "child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs";
import { select } from "@clack/prompts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.resolve(__dirname, "../templates");
const templates = fs.readdirSync(templatesDir).filter((file) => {
  return fs.statSync(path.join(templatesDir, file)).isDirectory();
});

console.log("Templates found:", templates);

async function runSelectedTemplate() {
  const selectedTemplate = await select({
    message: "Select a template to run:",
    options: templates.map((template) => ({
      value: template,
      label: template,
    })),
  });

  if (!selectedTemplate) {
    console.log("No template selected. Exiting.");
    return;
  }

  const templatePath = path.resolve(
    __dirname,
    `../templates/${selectedTemplate}`,
  );
  try {
    console.log(`Running dev for ${selectedTemplate}...`);
    execSync(`cd ${templatePath} && yarn dev`, {
      stdio: "inherit",
    });
  } catch (error) {
    console.error(`Error running dev for ${selectedTemplate}:`, error);
  }
}

runSelectedTemplate();
