import type { Client as V3Client } from "@xmtp/node-sdk";
import type { Client as V2Client } from "@xmtp/xmtp-js";
import type { DecodedMessage } from "@xmtp/node-sdk";
import { DecodedMessage as DecodedMessageV2 } from "@xmtp/xmtp-js";
const STREAM_LOG = process.env.STREAM_LOG === "true";

export async function streamMessages(
  version: "v3" | "v2",
  handleMessage: (
    version: "v3" | "v2",
    message: DecodedMessage | DecodedMessageV2 | undefined,
  ) => Promise<void>,
  client: V3Client | V2Client,
) {
  let v3client = client as V3Client;
  let v2client = client as V2Client;

  while (true) {
    let stream: any | undefined;

    try {
      if (version === "v3") {
        /*
        await v3client.conversations.streamAllMessages((err, message) => {
          if (err) {
            if (STREAM_LOG) {
              console.warn(`[v3] Stream error occurred`);

              throw err;
            }
          }
          handleMessage(version, message);
        });*/
        stream = await v3client.conversations.streamAllMessages();
        for await (const message of stream) {
          handleMessage(version, message);
        }
      } else if (version === "v2") {
        stream = await v2client.conversations.streamAllMessages();
        for await (const message of stream) {
          handleMessage(version, message);
        }
      }
    } catch (err) {
      if (STREAM_LOG) {
        console.error(`[${version}] Stream encountered an error:`, err);
      }
      // Continue the loop to retry connection
    } finally {
      if (stream) {
        await stream.return();
      }
    }
  }
}
