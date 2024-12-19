import { concierge, agentReply, createAgent } from "@xmtp/message-kit";
import { degen } from "./vibes/degen.js";
import { registerEmployees } from "./skills/register.js";
import { removeEmployee } from "./skills/remove.js";
import { Payroll } from "./plugins/payroll.js";
import { listEmployees } from "./skills/list.js";

let processor: Payroll | null = null;

export const agent = createAgent({
  name: "Payroll Agent",
  tag: "@bot",
  description:
    "A Payroll Agent for managing your institution's payroll autonomously",
  intro:
    "You are a helpful agent called {agent_name} that helps manage payroll. You can register employees, remove them, and process payments.",
  vibe: degen,
  skills: [registerEmployees, removeEmployee, listEmployees, concierge],
  config: {
    walletService: true,
  },
  onMessage: async (context: any) => {
    // Initialize payroll processor on first message
    if (!processor) {
      processor = new Payroll(context);
      processor.startCronJob();
    }
    await agentReply(context);
  },
}).run();
