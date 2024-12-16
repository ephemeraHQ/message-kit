import { Context } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
import { getAllEmployees } from "../plugins/redis.js";

export const listEmployees: Skill[] = [
  {
    skill: "list",
    examples: ["/list"],
    description: "List all registered employees and their payment details",
    handler: handler,
  },
];

export async function handler(context: Context) {
  console.log("Fetching employee list...");
  try {
    const employees = await getAllEmployees(context.message.sender.address);
    
    if (employees.length === 0) {
      return {
        code: 200,
        message: "No employees on the payroll yet.",
      };
    }

    // Sort employees by payment date
    const sortedEmployees = employees.sort((a, b) => a.paymentDate - b.paymentDate);

    const header = "📋 Registered Employees:\n";
    const employeeList = sortedEmployees.map(emp => 
      `• ${emp.name}\n` +
      `  └ 📧 Address: ${emp.address}\n` +
      `  └ 💵 Salary: ${emp.salary} USDC\n` +
      `  └ 📅 Payment Date: ${emp.paymentDate}th of each month`
    ).join("\n\n");

    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const footer = `\n\n💰 Total Monthly Payroll: ${totalSalary} USDC`;

    return {
      code: 200,
      message: header + employeeList + footer,
    };
  } catch (error) {
    console.error("Error fetching employee list:", error);
    return {
      code: 500,
      message: "Failed to fetch employee list. Please try again.",
    };
  }
} 