#!/usr/bin/env node
import { program } from "commander";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

program
  .name("byob")
  .description("CLI to initialize projects")
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the project to initialize?",
      },
    ]);
    const name = answers.name;
    const projectPath = path.join(process.cwd(), name);
    const templatePath = path.join(__dirname, "template");

    // Ensure the template directory exists
    if (!fs.existsSync(templatePath)) {
      console.error("Template directory does not exist.");
      process.exit(1);
    }

    // Copy template files
    await fs.copy(templatePath, projectPath);

    // Change directory to the new project path
    process.chdir(projectPath);

    // Copy the .env.example file to .env in the new project directory
    const envExamplePath = path.join(templatePath, ".env.example");
    const envPath = path.join(projectPath, ".env");
    if (fs.existsSync(envExamplePath)) {
      await fs.copy(envExamplePath, envPath);
      console.log("Environment file copied.");
    } else {
      console.error("Environment example file does not exist.");
    }

    //Git ignore
    const npmignoreSourcePath = path.join(projectPath, ".npmignore");
    const gitignoreDestinationPath = path.join(projectPath, ".gitignore");
    if (fs.existsSync(npmignoreSourcePath)) {
      await fs.rename(npmignoreSourcePath, gitignoreDestinationPath);
      console.log(".npmignore file renamed to .gitignore.");
    } else {
      console.error(".npmignore file does not exist in the project directory.");
    }

    console.log("Your new project is ready!");
  });

program.parse(process.argv);
