import { Context } from "../lib/core.js";
import { getUserInfo } from "../plugins/resolver.js";

export interface Frame {
  title: string;
  buttons: { content: string; action: string; target: string }[];
  image: string;
}

const framesUrl =
  process.env.FRAME_URL !== undefined
    ? process.env.FRAME_URL
    : "https://frames.message-kit.org";

export class FrameKit {
  private context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  async sendWallet(
    ownerAddress: string,
    agentAddress: string,
    balance: number,
  ) {
    let url = `${framesUrl}/wallet?networkId=${"base"}&agentAddress=${agentAddress}&ownerAddress=${ownerAddress}&balance=${balance}`;
    await this.context.send(url);
  }

  async requestPayment(
    to: string = "humanagent.eth",
    amount: number = 0.01,
    token: string = "usdc",
    onRampURL?: string,
  ) {
    let senderInfo = await getUserInfo(to);
    if (!senderInfo) {
      console.error("Failed to get sender info");
      return;
    }

    let sendUrl = `${framesUrl}/payment?networkId=${"base"}&amount=${amount}&token=${token}&recipientAddress=${senderInfo?.address}`;
    if (onRampURL) {
      sendUrl = sendUrl + "&onRampURL=" + encodeURIComponent(onRampURL);
    }
    await this.context.dm(sendUrl);
  }

  async sendReceipt(txLink: string, amount: number) {
    if (!txLink) return;
    let receiptUrl = `${framesUrl}/receipt?networkId=${"base"}&txLink=${txLink}&amount=${amount}`;
    await this.context.dm(receiptUrl);
  }

  async sendConverseDmFrame(peer: string, pretext?: string) {
    let url = `https://converse.xyz/dm/${peer}`;
    if (pretext) url += `&pretext=${encodeURIComponent(pretext)}`;
    await this.context.send(url);
  }

  async sendConverseGroupFrame(groupId: string, pretext?: string) {
    let url = `https://converse.xyz/group/${groupId}`;
    if (pretext) url += `&pretext=${encodeURIComponent(pretext)}`;
    await this.context.send(url);
  }

  async sendCustomFrame(frame: Frame) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(frame)) {
      params.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : value,
      );
    }

    const frameUrl = `${framesUrl}/custom?${params.toString()}`;
    await this.context.send(frameUrl);
  }
}
