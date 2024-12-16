import { run, Agent, concierge, agentReply } from "@xmtp/message-kit";
import { degen } from "./vibes/degen.js";
import { registerEmployees } from "./skills/register.js";
import { removeEmployee } from "./skills/remove.js";
import { PayrollProcessor } from "./plugins/payrollProcessor.js";

let processor: PayrollProcessor | null = null;

const testPayroll: Skill[] = [{
  skill: "test-payroll",
  description: "Test payroll processing",
  handler: async (context) => {
    if (!processor) {
      processor = new PayrollProcessor(context);
    }
    await processor.testPayrollProcessing();
    return {
      code: 200,
      message: "Triggered payroll processing",
    };
  }
}];

const agent: Agent = {
  name: "Payroll Agent",
  tag: "@bot",
  description:
    "A Payroll Agent for managing your institution's payroll autonomously",
  intro:
    "You are a helpful agent called {agent_name} that helps manage payroll. You can register employees, remove them, and process payments.",
  vibe: degen,
  skills: [registerEmployees, removeEmployee, concierge, testPayroll],
  config: {
    walletService: true,
  },
  onMessage: async (context: any) => {
    // Initialize payroll processor on first message
    if (!processor) {
      processor = new PayrollProcessor(context);
      processor.startCronJob();
    }
    await agentReply(context);
  },
};

run(agent);
