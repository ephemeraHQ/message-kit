import { run, HandlerContext } from "@xmtp/message-kit";
import { ensAgent } from "./handler/ens.js";

export const frameUrl = "https://ens.steer.fun/";
export const ensUrl = "https://app.ens.domains/";
export const baseTxUrl = "https://base-tx-frame.vercel.app";

run(async (context: HandlerContext) => {
  const { group, message } = context;
  /*All the commands are handled through the commands file*/
  /* If its just text, it will be handled by the ensAgent*/
  /* If its a group message, it will be handled by the groupAgent*/
  await ensAgent(context);
});
