import { getUserInfo } from "./resolver.js";

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
  static async sendWallet(
    ownerAddress: string,
    agentAddress: string,
    balance: number,
  ): Promise<string> {
    let url = `${framesUrl}/wallet?networkId=${"base"}&agentAddress=${agentAddress}&ownerAddress=${ownerAddress}&balance=${balance}`;
    return url;
  }

  static async coinbaseLink(address: string): Promise<string> {
    let url = `${framesUrl}/coinbase?address=${address}`;
    return url;
  }

  static async requestPayment(
    to: string = "humanagent.eth",
    amount: number = 0.01,
    token: string = "usdc",
    onRampURL?: string,
  ): Promise<string> {
    let senderInfo = await getUserInfo(to);
    if (!senderInfo) {
      console.error("Failed to get sender info");
      return "";
    }

    let sendUrl = `${framesUrl}/payment?networkId=${"base"}&amount=${amount}&token=${token}&recipientAddress=${senderInfo?.address}`;
    if (onRampURL) {
      sendUrl = sendUrl + "&onRampURL=" + encodeURIComponent(onRampURL);
    }
    return sendUrl;
  }

  static async sendReceipt(txLink: string, amount: number): Promise<string> {
    if (!txLink) return "";
    let receiptUrl = `${framesUrl}/receipt?networkId=${"base"}&txLink=${txLink}&amount=${amount}`;
    return receiptUrl;
  }

  static async converseLink(peer: string, pretext?: string): Promise<string> {
    let url = `https://converse.xyz/dm/${peer}`;
    if (pretext) url += `&pretext=${encodeURIComponent(pretext)}`;
    return url;
  }

  static async converseGroup(
    groupId: string,
    pretext?: string,
  ): Promise<string> {
    let url = `https://converse.xyz/group/${groupId}`;
    if (pretext) url += `&pretext=${encodeURIComponent(pretext)}`;
    return url;
  }

  static async sendCustomFrame(frame: Frame): Promise<string> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(frame)) {
      params.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : value,
      );
    }

    const frameUrl = `${framesUrl}/custom?${params.toString()}`;
    return frameUrl;
  }
}
