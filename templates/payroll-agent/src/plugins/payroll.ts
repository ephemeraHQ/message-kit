import { getAllEmployees } from "./redis.js";
import { Context } from "@xmtp/message-kit";
import cron from "node-cron";
import { baselinks } from "./baselinks.js";

export class Payroll {
  private context: Context;
  private senderAddress: string;

  constructor(context: Context) {
    this.context = context;
    this.senderAddress = context.message.sender.address;
    console.log("Initializing Payroll for sender:", this.senderAddress);
    this.initializeWallet();
  }

  private async initializeWallet() {
    try {
      const { walletService } = this.context;
      const wallet = await walletService.getWallet(this.senderAddress);
      console.log("Agent wallet initialized:", wallet);
    } catch (error) {
      console.error("Failed to initialize wallet:", error);
      throw error;
    }
  }

  async processDailyPayroll() {
    console.log("Starting daily payroll processing...");

    try {
      const { walletService } = this.context;
      const today = new Date();
      const currentDay = today.getDate();

      console.log("Fetching employees from Redis...");
      const employees = await getAllEmployees(this.senderAddress);
      console.log(`Found ${employees.length} total employees`);

      const todayPayments = employees.filter(
        (emp) => emp.paymentDate === currentDay,
      );
      console.log(`${todayPayments.length} employees due for payment today`);

      if (todayPayments.length === 0) {
        console.log("No payments due today");
        return;
      }

      // Calculate total required amount
      const totalRequired = todayPayments.reduce(
        (sum, emp) => sum + emp.salary,
        0,
      );

      // Send payment summary message
      const summaryMessage =
        `🔔 Payroll Processing Summary - ${today.toDateString()}\n\n` +
        `Employees due for payment today:\n` +
        todayPayments
          .map((emp) => `• ${emp.name}: ${emp.salary} USDC`)
          .join("\n") +
        `\n\n💰 Total amount to be disbursed: ${totalRequired} USDC`;

      await this.context.send({
        message: summaryMessage,
        receivers: [this.senderAddress],
        originalMessage: this.context.message,
      });

      // Check wallet balance
      const { balance } = await walletService.checkBalance(this.senderAddress);
      console.log(`Current wallet balance: ${balance} USDC`);

      if (Number(balance) < totalRequired) {
        const wallet = await walletService.getWallet(this.senderAddress);
        const message = `⚠️ Insufficient funds for today's payroll!\nRequired: ${totalRequired} USDC\nAvailable: ${balance} USDC\nPlease fund your account.`;

        await this.context.send({
          message: message,
          receivers: [this.senderAddress],
          originalMessage: this.context.message,
        });
        const url = baselinks.paymentLink(wallet?.agent_address, totalRequired);
        await this.context.send({
          message: url,
          receivers: [this.senderAddress],
          originalMessage: this.context.message,
        });
        return;
      }

      console.log("Processing payments for each employee...");
      // Process payments
      for (const employee of todayPayments) {
        try {
          console.log(
            `Processing payment for ${employee.name} (${employee.address}): ${employee.salary} USDC`,
          );
          await walletService.transfer(
            this.senderAddress,
            employee.address,
            employee.salary,
          );
          await this.context.send({
            message: `✅ Processed salary payment of ${employee.salary} USDC to ${employee.name}`,
            receivers: [employee.address],
            originalMessage: this.context.message,
          });
        } catch (error: any) {
          console.error(`Payment failed for ${employee.name}:`, error);
          await this.context.send({
            message: `❌ Failed to process payment for ${employee.name}: ${error.message}`,
            receivers: [employee.address],
            originalMessage: this.context.message,
          });
        }
      }
      console.log("Daily payroll processing completed");
    } catch (error) {
      console.error("Error in payroll processing:", error);
      await this.context.send({
        message:
          "❌ An error occurred while processing payroll. Please check the logs.",
        originalMessage: this.context.message,
      });
    }
  }

  startCronJob() {
    console.log("Starting payroll cron job...");
    // Run every day at 9:00 AM
    cron.schedule("0 9 * * *", () => {
      console.log("Triggering scheduled payroll processing");
      this.processDailyPayroll().catch((error) => {
        console.error("Scheduled payroll processing failed:", error);
      });
    });
    console.log("Payroll cron job started successfully");
  }
}
