import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import styles from "./Chat.module.css";
import { UserInfo } from "@/app/utils/resolver";
import { isAddress, parseUnits } from "viem";
import { extractFrameChain } from "@/app/utils/networks";
import sdk from "@farcaster/frame-sdk";
import { UrlPreview } from "./UrlPreview";
import { XMTP, Message } from "../../../xmtp-e2ee/dist";

type UrlType = "receipt" | "payment" | "wallet" | "unknown";

const getUrlType = (url: string): UrlType => {
  if (url.includes("/receipt")) return "receipt";
  if (url.includes("/payment")) return "payment";
  if (url.includes("/wallet")) return "wallet";
  return "unknown";
};

const isFrame = async () => {
  try {
    const context = await sdk.context;
    return !!context; // If we can get context, we're in a frame
  } catch {
    return false; // If we can't get context, we're not in a frame
  }
};

function Chat({ user }: { user: UserInfo }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [xmtp, setXmtp] = useState<XMTP | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [recipientInfo, setRecipientInfo] = useState<UserInfo | undefined>(
    undefined,
  );
  const [processedMessageIds] = useState(new Set<string>());

  useEffect(() => {
    const init = async () => {
      try {
        setRecipientInfo(user);
        if (user?.address) {
          console.log("Initializing XMTP with address:", user.address);

          const xmtpClient = new XMTP(onMessage);
          await xmtpClient.init();
          setXmtp(xmtpClient);
          setIsLoading(false);
        } else {
          console.error("Could not resolve recipient address");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error resolving recipient:", error);
        setIsLoading(false);
      }
    };

    init();
  }, [user.address]);

  const onMessage = async (message: Message | undefined) => {
    if (message) {
      setMessages((prevMessages) => [...prevMessages, message]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!xmtp || !newMessage || !recipientInfo?.address) {
      console.log("Missing required data:", {
        xmtp: !!xmtp,
        newMessage,
        recipientAddress: recipientInfo?.address,
      });
      return;
    }

    try {
      console.log("Sending message:", newMessage);
      const message = (await xmtp.send({
        message: newMessage,
        receivers: [recipientInfo.address],
        originalMessage: undefined,
      })) as Message;

      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const ethereumURL = (url: string) => {
    try {
      const urlObject = new URL(url);
      const urlParams = new URLSearchParams(urlObject.search);
      const networkId = urlParams.get("networkId");
      const { chainId, tokenAddress } = extractFrameChain(networkId as string);
      const amount = urlParams.get("amount");
      const recipientAddress = urlParams.get("recipientAddress");

      if (!amount || !recipientAddress) {
        console.error("Missing required parameters for ethereum URL");
        return url;
      }

      const amountUint256 = parseUnits(amount, 6);
      return `ethereum:${tokenAddress}@${chainId}/transfer?address=${recipientAddress}&uint256=${amountUint256}`;
    } catch (error) {
      console.error("Error constructing ethereum URL:", error);
      return url;
    }
  };

  const openUrl = useCallback(async (url: string) => {
    try {
      const inFrame = await isFrame();
      if (inFrame) {
        sdk.actions.openUrl(url);
      } else {
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      window.location.href = url;
    }
  }, []);

  const renderMessageContent = (message: Message) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    //only strings
    const textContent =
      typeof message.content?.text === "string" ? message.content.text : "";

    const parts = textContent.split(urlRegex);
    return parts?.map((part, index) => {
      if (urlRegex.test(part)) {
        try {
          const urlType = getUrlType(part);
          const isMessageKitUrl =
            part.includes("message-kit.org") ||
            part.includes("baselinks.vercel.app");
          const isMobile = window.innerWidth < 768;
          return (
            <div key={index} className={styles.urlContainer}>
              {isMessageKitUrl && <UrlPreview url={part} />}
              <div className={styles.buttonContainer}>
                {urlType === "payment" && (
                  <button
                    onClick={() => {
                      const ethUrl = ethereumURL(part);
                      isMobile ? openUrl(ethUrl) : alert("Not on mobile");
                    }}
                    className={styles.urlButton}>
                    Pay in USDC
                  </button>
                )}
                {urlType === "receipt" && (
                  <button
                    onClick={() => {
                      console.log("Viewing receipt:", part);
                      openUrl(part);
                    }}
                    className={styles.urlButton}>
                    View Receipt
                  </button>
                )}
                {urlType === "wallet" && (
                  <button
                    onClick={() => {
                      console.log("Viewing wallet:", part);
                      openUrl(part);
                    }}
                    className={styles.urlButton}>
                    View Wallet
                  </button>
                )}
                {urlType === "unknown" && (
                  <a
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.messageLink}>
                    {part}
                  </a>
                )}
              </div>
            </div>
          );
        } catch (error) {
          console.error("Error rendering URL content:", error);
          return part;
        }
      }
      return part;
    });
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.walletInfo}>
        <div>
          Agent:
          {user?.preferredName ||
            (user?.address && isAddress(user.address)
              ? user.address.slice(0, 6) + "..." + user.address.slice(-4)
              : user?.address)}
        </div>
      </div>
      {isLoading && (
        <div className={styles.loadingContainer}>
          <span>Loading messages...</span>
        </div>
      )}
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div key={msg.id || index} className={styles.message}>
            <span className={styles.sender}>
              {msg.sender.address.toLowerCase() === user.address?.toLowerCase()
                ? "Agent"
                : "Human"}
            </span>
            {renderMessageContent(msg)}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className={styles.messageForm}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              isLoading ? "Initializing XMTP..." : "Type a message..."
            }
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isLoading}>
            Send
          </button>
        </div>
        <div className={styles.encryptionInfo}>
          End-to-end encrypted powered by XMTP
        </div>
      </form>
    </div>
  );
}

export default React.memo(Chat);
