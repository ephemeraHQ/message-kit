import "dotenv/config";
import { run } from "message-kit";
run(async (context) => {
    const { content, sender } = context.message;
    /* Your logic*/
    //Send the message
    await context.reply("gm");
});
//# sourceMappingURL=index.js.map