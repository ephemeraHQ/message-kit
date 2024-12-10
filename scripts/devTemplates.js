console.log("Starting devTemplates script...");

import { execSync } from "child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs";
import { select } from "@clack/prompts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add a flag to prevent multiple executions
let isRunning = false;

const templatesDir = path.resolve(__dirname, "../templates");
const templates = fs.readdirSync(templatesDir).filter((file) => {
  return fs.statSync(path.join(templatesDir, file)).isDirectory();
});

async function runSelectedTemplate() {
  // Prevent multiple executions
  if (isRunning) {
    console.log("Development server is already running.");
    return;
  }

  // Get template from command line argument if provided
  const directTemplate = process.argv[2];

  let selectedTemplate;
  if (directTemplate && templates.includes(directTemplate)) {
    selectedTemplate = directTemplate;
  } else {
    selectedTemplate = await select({
      message: "Select a template to run:",
      options: templates.map((template) => ({
        value: template,
        label: template,
      })),
    });
  }

  if (typeof selectedTemplate === "symbol" || !selectedTemplate) {
    console.log("No template selected. Exiting.");
    return;
  }

  const templatePath = path.resolve(
    __dirname,
    `../templates/${selectedTemplate}`,
  );

  try {
    isRunning = true;
    console.log(`Running dev for ${selectedTemplate}...`);
    execSync(`cd ${templatePath} && yarn dev`, {
      stdio: "inherit",
    });
  } catch (error) {
    console.error(`Error running dev for ${selectedTemplate}:`, error);
  } finally {
    isRunning = false;
  }
}

// Only run if this is the main module
if (import.meta.url === `file://${__filename}`) {
  runSelectedTemplate();
}
