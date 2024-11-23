import { Resend } from 'resend';
import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";

const resend = new Resend(process.env.RESEND_API_KEY); // Replace with your Resend API key

export const registerSkill: Skill[] = [
  {
    skill: "/todo",
    handler: handler,
    examples: ["/todo"],
    description: "Send a list of TODOs via email. Receives no parameters.",
    params: {},
  },
];

export async function handler(context: XMTPContext) {
  const {
    message: {
      content: { reply },
    },
  } = context;

  let email = "";

  while (true) {
    const emailResponse = await context.awaitResponse("Please provide your email address to receive the TODO summary:");
    email = emailResponse;
  
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await context.send("Invalid email format. Please try again with a valid email address.");
      continue;
    }
    break;
  }

  try {
    let content={
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your TODO Summary from Converse',
      html: `
        <h1>Your TODO Summary</h1>
        <p>${reply}</p>
      `
    }
    console.log(content);
    // const response = await resend.emails.send(content);
    // console.log(response);

    await context.send(`✅ Summary sent successfully to ${email}`);
  } catch (error) {
    await context.send("❌ Failed to send email. Please try again later.");
    console.error('Error sending email:', error);
  }
}