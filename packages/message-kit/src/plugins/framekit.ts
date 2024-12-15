import { Context } from "../lib/core.js";
import { extractFrameChain } from "../helpers/utils.js";
import { getUserInfo } from "../plugins/resolver.js";

export interface Frame {
  title: string;
  buttons: { content: string; action: string; target: string }[];
  image: string;
}

const framesUrl =
  process.env.NODE_ENV === "production"
    ? "https://frames.message-kit.org"
    : "https://frames.ngrok.app";

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
    let walletLink = `https://basescan.org/address/${agentAddress}`;
    const { networkLogo, networkName, tokenName } =
      extractFrameChain(walletLink);

    let url = `${framesUrl}/wallet?agentAddress=${agentAddress}&ownerAddress=${ownerAddress}&networkLogo=${networkLogo}&networkName=${networkName}&tokenName=${tokenName}&balance=${balance}`;

    await this.context.send(url);
  }

  async requestPayment(
    to: string = "humanagent.eth",
    amount: number,
    token?: string,
    onRampURL?: string,
  ) {
    let senderInfo = await getUserInfo(to);
    if (!senderInfo) {
      console.error("Failed to get sender info");
      return;
    }

    let sendUrl = `${framesUrl}/payment?amount=${amount ?? 1}&token=${token ?? "usdc"}&recipientAddress=${senderInfo?.address}`;
    if (onRampURL) {
      sendUrl = sendUrl + "&onRampURL=" + encodeURIComponent(onRampURL);
    }
    await this.context.dm(sendUrl);
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

  async sendReceipt(txLink: string) {
    const { networkLogo, networkName, tokenName, dripAmount } =
      extractFrameChain(txLink);

    let receiptUrl = `${framesUrl}/receipt?txLink=${txLink}&networkLogo=${networkLogo}&networkName=${networkName}&tokenName=${tokenName}&amount=${dripAmount}`;

    await this.context.dm(receiptUrl);
  }
}
