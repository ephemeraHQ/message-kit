import { run, Agent, concierge } from "@xmtp/message-kit";
import { degen } from "./vibes/degen.js";
import { registerEmployees } from "./skills/register.js";
import { removeEmployee } from "./skills/remove.js";
import { PayrollProcessor } from "./plugins/payrollProcessor.js";

const agent: Agent = {
  name: "Payroll Agent",
  tag: "@bot",
  description: "A Payroll Agent for managing your institution's payroll autonomously",
  intro: "You are a helpful agent called {agent_name} that helps manage payroll. You can register employees, remove them, and process payments.",
  vibe: degen,
  skills: [registerEmployees, removeEmployee, concierge],
  config: {
    walletService: true,
  },
  onMessage: async (context: any) => {
    // Initialize payroll processor on first message
    const processor = new PayrollProcessor(context);
    processor.startCronJob();
  },
};

run(agent);
