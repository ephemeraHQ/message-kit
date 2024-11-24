import { Resend } from "resend";
import { XMTPContext } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set");
}
const resend = new Resend(process.env.RESEND_API_KEY); // Replace with your Resend API key

export const registerSkill: Skill[] = [
  {
    skill: "/todo",
    handler: handler,
    examples: ["/todo"],
    description:
      "Summarize your TODOs and send an email with the summary. Receives no parameters.",
    params: {},
  },
];

export async function handler(context: XMTPContext) {
  const {
    message: {
      content: { reply, previousMsg },
    },
  } = context;

  let email = "";

  let intents = 2;
  while (intents > 0) {
    const emailResponse = await context.awaitResponse(
      "Please provide your email address to receive the TODO summary:",
    );
    email = emailResponse;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await context.send(
        "Invalid email format. Please try again with a valid email address.",
      );
      intents--;
      continue;
    }
    break;
  }
  if (intents == 0) {
    await context.send(
      "I couldn't get your email address. Please try again later.",
    );
    return;
  }
  try {
    let content = {
      from: "bot@mail.coin-toss.xyz",
      to: email,
      subject: "Your TODO Summary from Converse",
      html: `
        <h3>Your TODO Summary</h3>
        <p>${reply}</p>
      `,
    };
    const response = await resend.emails.send(content);
    console.log(response);

    await context.send(`✅ Summary sent successfully to ${email}`);
  } catch (error) {
    await context.send("❌ Failed to send email. Please try again later.");
    console.error("Error sending email:", error);
  }
}
