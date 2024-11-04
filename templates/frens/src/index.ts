import { mainHandler } from "./handlers/main.js";
import { botAddresses } from "./lib/bots.js";
import fs from "fs";

// ASCII art logo for FRENSDAY
const frensdayLogo = `\x1b[38;2;56;136;255m
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

███████╗██████╗ ███████╗███╗   ██╗███████╗██████╗  █████╗ ██╗   ██╗
██╔════╝██╔══██╗██╔════╝████╗  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝
█████╗  ██████╔╝█████╗  ██╔██╗ ██║███████╗██║  ██║███████║ ╚████╔╝ 
██╔══╝  ██╔══██╗██╔══╝  ██║╚██╗██║╚════██║██║  ██║██╔══██║  ╚██╔╝  
██║     ██║  ██║███████╗██║ ╚████║███████║██████╔╝██║  ██║   ██║   
╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚══════╝╚═════╝ ╚═╝  ╚═╝   ╚═╝   
\x1b[38;2;250;105;119m\Powered by MessageKit \x1b[0m`;

console.log(frensdayLogo);
const isDeployed = process.env.NODE_ENV === "production";

console.log("\n\nStatus:\n   - Characters initialized");
setupFiles();

Promise.all(botAddresses.map(async (bot) => await mainHandler(bot)));

console.log(
  botAddresses
    .map(
      (a) => `
  Send a message to ${
    a.terminalColor
  }${a.name.toUpperCase()}\x1b[0m on Converse:                              
  🔗 https://converse.xyz/dm/${isDeployed ? a.address : a.devAddress}`
    )
    .join("\n")
);

async function setupFiles() {
  if (fs.existsSync("src/data/db-new.json")) {
    const dbfile = fs.readFileSync("src/data/db-new.json", "utf8");
    fs.writeFileSync(".data/db.json", dbfile);
    //remove the new from title
    fs.renameSync("src/data/db-new.json", "src/data/db.json");
  } else if (!fs.existsSync(".data/db.json")) {
    const dbfile = fs.readFileSync("src/data/db.json", "utf8");
    fs.writeFileSync(".data/db.json", dbfile);
    console.log(`   - DB file created`);
  } else {
    console.log(`   - No DB changes`);
  }
}
