import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import { Client as V2Client } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";
import styles from "./Chat.module.css";
import { UserInfo } from "@/app/utils/resolver";
import { http, isAddress, parseUnits } from "viem";
import { extractFrameChain } from "@/app/utils/networks";
import sdk from "@farcaster/frame-sdk";
import { UrlPreview } from "./UrlPreview";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
}

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
  const [wallet, setWallet] = useState<any | undefined>(undefined);
  const [xmtp, setXmtp] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [recipientInfo, setRecipientInfo] = useState<UserInfo | undefined>(
    undefined,
  );
  const [conversation, setConversation] = useState<any>(undefined);
  const [processedMessageIds] = useState(new Set<string>());

  useEffect(() => {
    console.log("useEffect triggered with user:", user);

    const init = async () => {
      const newWallet = Wallet.createRandom();

      setWallet(newWallet);

      try {
        setRecipientInfo(user);
        if (user?.address) {
          console.log("Initializing XMTP with address:", user.address);
          await initXmtp(newWallet);
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

  useEffect(() => {
    const initConversation = async () => {
      if (!xmtp || !recipientInfo?.address) return;

      try {
        const conv = await xmtp.conversations.newConversation(
          recipientInfo.address,
        );
        setConversation(conv);

        // Load existing messages
        const existingMessages = await conv.messages();
        console.log("Initial messages loaded:", existingMessages.length);

        // Process messages in chronological order
        const formattedMessages = existingMessages
          .sort((a: any, b: any) => a.sent.getTime() - b.sent.getTime())
          .map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            sender: msg.senderAddress === wallet.address ? "Human" : "Agent",
            timestamp: msg.sent.getTime(),
          }));

        // Add message IDs to processed set
        formattedMessages.forEach((msg: any) =>
          processedMessageIds.add(msg.id),
        );

        setMessages(formattedMessages);
        setIsLoading(false);

        // Start streaming new messages
        streamMessages(conv);
      } catch (error) {
        console.error("Error initializing conversation:", error);
        setIsLoading(false);
      }
    };

    initConversation();
  }, [xmtp, recipientInfo, wallet]);

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

  const streamMessages = async (conv: any) => {
    try {
      for await (const message of await conv.streamMessages()) {
        console.log("Received message:", message.id, message.content);
        if (!processedMessageIds.has(message.id)) {
          processedMessageIds.add(message.id);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: message.id,
              content: message.content,
              sender:
                message.senderAddress === wallet.address ? "Human" : "Agent",
              timestamp: message.sent.getTime(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error streaming messages:", error);
    }
  };

  const initXmtp = async (wallet: any) => {
    try {
      const xmtpClient = await V2Client.create(wallet, { env: "production" });
      setXmtp(xmtpClient);
      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing XMTP:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!conversation || !newMessage || !recipientInfo?.address) {
      console.log("Missing required data:", {
        conversation: !!conversation,
        newMessage,
        recipientAddress: recipientInfo?.address,
      });
      return;
    }

    try {
      console.log("Sending message:", newMessage);
      const sentMessage = await conversation.send(newMessage);
      console.log("Message sent with ID:", sentMessage.id);

      // Add message immediately to UI and processed set
      processedMessageIds.add(sentMessage.id);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: sentMessage.id,
          content: newMessage,
          sender: "Human",
          timestamp: new Date().getTime(),
        },
      ]);

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
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
      // Fallback to traditional navigation if something goes wrong
      window.location.href = url;
    }
  }, []);

  const renderMessageContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        try {
          const urlType = getUrlType(part);
          const isMessageKitUrl = part.includes("frames.message-kit.org");

          return (
            <div key={index} className={styles.urlContainer}>
              {isMessageKitUrl && <UrlPreview url={part} urlType={urlType} />}
              <div className={styles.buttonContainer}>
                {urlType === "payment" && (
                  <button
                    onClick={() => {
                      const ethUrl = ethereumURL(part);
                      openUrl(ethUrl);
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
        {/*<div>
           Display the user's wallet address 
          Your Wallet: {wallet?.address?.slice(0, 6)}...
          {wallet?.address?.slice(-4)}
        </div>*/}
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
            <span className={styles.sender}>{msg.sender}</span>
            {renderMessageContent(msg.content)}
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
      </form>
    </div>
  );
}

export default React.memo(Chat);
