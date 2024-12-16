import { getRedisClient, getAllEmployees } from "./redis.js";
import { Context } from "@xmtp/message-kit";
import cron from "node-cron";

export class PayrollProcessor {
  private context: Context;
  private senderAddress: string;

  constructor(context: Context) {
    this.context = context;
    this.senderAddress = context.message.sender.address;
    console.log("Initializing PayrollProcessor for sender:", this.senderAddress);
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
      console.log(`Total required amount: ${totalRequired} USDC`);

      // Check wallet balance
      const { balance } = await walletService.checkBalance(this.senderAddress);
      console.log(`Current wallet balance: ${balance} USDC`);

      if (Number(balance) < totalRequired) {
        const message = `⚠️ Insufficient funds for today's payroll!\nRequired: ${totalRequired} USDC\nAvailable: ${balance} USDC\nPlease fund your account.`;
        console.log(message);
        await this.context.send(message);
        return;
      }

      console.log("Processing payments for each employee...");
      // Process payments
      for (const employee of todayPayments) {
        try {
          console.log(`Processing payment for ${employee.name} (${employee.address}): ${employee.salary} USDC`);
          await walletService.transfer(
            this.senderAddress,
            employee.address,
            employee.salary,
          );
          await this.context.send(
            `✅ Processed salary payment of ${employee.salary} USDC to ${employee.name}`,
          );
        } catch (error: any) {
          console.error(`Payment failed for ${employee.name}:`, error);
          await this.context.send(
            `❌ Failed to process payment for ${employee.name}: ${error.message}`,
          );
        }
      }
      console.log("Daily payroll processing completed");
    } catch (error) {
      console.error("Error in payroll processing:", error);
      await this.context.send("❌ An error occurred while processing payroll. Please check the logs.");
    }
  }

  startCronJob() {
    console.log("Starting payroll cron job...");
    // Run every minute for testing
    cron.schedule("* * * * *", () => {
      console.log("Triggering scheduled payroll processing");
      this.processDailyPayroll().catch(error => {
        console.error("Scheduled payroll processing failed:", error);
      });
    });
    console.log("Payroll cron job started successfully");
  }

  // Add a method to manually trigger processing
  async testPayrollProcessing() {
    console.log("Manually triggering payroll processing...");
    await this.processDailyPayroll();
  }
}
