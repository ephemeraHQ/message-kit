import { Resend } from "resend";
import { Context } from "@xmtp/message-kit";
import type { Skill } from "@xmtp/message-kit";
import { textGeneration } from "@xmtp/message-kit";
const resend = new Resend(process.env.RESEND_API_KEY); // Replace with your Resend API key

export const todo: Skill[] = [
  {
    skill: "todo",
    handler: handler,
    examples: ["/todo"],
    description:
      "Summarize your TODOs and send an email with the summary. Receives no parameters.",
  },
];

export async function handler(context: Context) {
  const {
    message: {
      content: { previousMsg },
      sender,
    },
  } = context;

  let email = "";
  if (!previousMsg) {
    await context.send({
      message: "You need to do it on a reply.",
      originalMessage: context.message,
    });
    return;
  }
  let intents = 2;
  while (intents > 0) {
    const emailResponse = await context.awaitResponse(
      "Please provide your email address to receive the to-dos summary:",
    );
    email = emailResponse;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await context.send({
        message:
          "Invalid email format. Please try again with a valid email address.",
        originalMessage: context.message,
      });
      intents--;
      continue;
    }
    break;
  }
  if (intents == 0) {
    await context.send({
      message: "I couldn't get your email address. Please try again later.",
      originalMessage: context.message,
    });
    return;
  }
  try {
    let { reply } = await textGeneration(
      "Make this summary concise and to the point to be sent in an email.\n msg: " +
        previousMsg,
      "You are an expert at summarizing to-dos.  Return in format html and just the content inside the body tag. Dont return `html` or `body` tags",
      email,
    );
    if (typeof reply === "string") {
      let content = {
        from: "bot@mail.coin-toss.xyz",
        to: email,
        subject: "Your summary from Converse",
        html: `
        <h3>Your Converse Summary</h3>
        <p>${reply}</p>
      `,
      };
      await resend.emails.send(content);
      await context.send({
        message: `✅ Summary sent successfully to ${email}`,
        originalMessage: context.message,
      });
    } else {
      await context.send({
        message: "❌ Message not found.",
        originalMessage: context.message,
      });
    }
  } catch (error) {
    await context.send({
      message: "❌ Failed to send email. Please try again later.",
      originalMessage: context.message,
    });
    console.error("Error sending email:", error);
  }
}
