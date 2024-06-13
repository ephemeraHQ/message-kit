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
    // Copy the .gitignore file from the template directory to the new project directory
    const gitignoreSourcePath = path.join(templatePath, ".gitignore");
    const gitignoreDestinationPath = path.join(projectPath, ".gitignore");
    if (fs.existsSync(gitignoreSourcePath)) {
      await fs.copy(gitignoreSourcePath, gitignoreDestinationPath);
      console.log(".gitignore file copied.");
    } else {
      console.error(
        ".gitignore file does not exist in the template directory.",
      );
    }

    console.log("Your new project is ready!");
    console.log(
      `Run 'cd ${name}' and install the dependencies with your preferred package manager.\n\nRun the 'build:watch' command to build the bot and watch for changes.\n\nRun the 'start:watch' command in another terminal to start your project.`,
    );
  });

program.parse(process.argv);
