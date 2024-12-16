import { getRedisClient, getAllEmployees } from "./redis.js";
import { Context } from "@xmtp/message-kit";
import cron from "node-cron";

export class PayrollProcessor {
  private context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  async processDailyPayroll() {
    const { walletService } = this.context;
    const today = new Date();
    const currentDay = today.getDate();

    const employees = await getAllEmployees();
    const todayPayments = employees.filter(emp => emp.paymentDate === currentDay);

    if (todayPayments.length === 0) {
      return;
    }

    // Calculate total required amount
    const totalRequired = todayPayments.reduce((sum, emp) => sum + emp.salary, 0);

    // Check wallet balance
    const { balance } = await walletService.checkBalance(this.context.message.sender.address);

    if (Number(balance) < totalRequired) {
      await this.context.send(
        `⚠️ Insufficient funds for today's payroll!\nRequired: ${totalRequired} USDC\nAvailable: ${balance} USDC\nPlease fund the payroll account.`
      );
      return;
    }

    // Process payments
    for (const employee of todayPayments) {
      try {
        await walletService.transfer(
          this.context.message.sender.address,
          employee.address,
          employee.salary
        );
        await this.context.send(
          `✅ Processed salary payment of ${employee.salary} USDC to ${employee.name}`
        );
      } catch (error: any) {
        await this.context.send(
          `❌ Failed to process payment for ${employee.name}: ${error.message}`
        );
      }
    }
  }

  startCronJob() {
    // Run every day at 00:01
    cron.schedule("1 0 * * *", () => {
      this.processDailyPayroll();
    });
  }
} 