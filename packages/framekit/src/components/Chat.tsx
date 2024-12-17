import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import { Client as V2Client } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";
import styles from "./Chat.module.css";
import { UserInfo } from "@/app/utils/resolver";
import { isAddress, parseUnits } from "viem";
import { extractFrameChain } from "@/app/utils/networks";
import sdk from "@farcaster/frame-sdk";

interface Message {
  id: string;
  content: string;
  sender: string;
}

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
        console.log("User info:", user);
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
        const messages = await conv.messages();
        console.log("Initial messages loaded:", messages.length);

        const formattedMessages = messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.senderAddress === wallet.address ? "Human" : "Agent",
        }));

        // Add message IDs to processed set
        formattedMessages.forEach((msg: any) =>
          processedMessageIds.add(msg.id),
        );

        setMessages(formattedMessages);
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing conversation:", error);
        setIsLoading(false);
      }
    };

    initConversation();
  }, [xmtp, recipientInfo, wallet]);

  const ethereumURL = (url: string) => {
    //frames.message-kit.org/payment?networkId=base&amount=0.01&token=USDC&recipientAddress=0x5d8407cb37f12b8c2a7fbb81d182eafa784022ed

    const urlParams = new URLSearchParams(url.split("?")[1]);
    const networkId = urlParams.get("networkId");
    const { chainId, tokenAddress } = extractFrameChain(networkId as string);
    const amount = urlParams.get("amount");
    const recipientAddress = urlParams.get("recipientAddress");

    const amountUint256 = parseUnits(amount as string, 6);
    const ethereumUrl = `ethereum:${tokenAddress}@${chainId}/transfer?address=${recipientAddress}&uint256=${amountUint256}`;

    return ethereumUrl;
  };
  useEffect(() => {
    const streamMessages = async () => {
      if (!conversation) return;

      try {
        // Stream new messages
        for await (const message of await conversation.streamMessages()) {
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
              },
            ]);
          }
        }
      } catch (error) {
        console.error("Error streaming messages:", error);
      }
    };

    streamMessages();
  }, [conversation, wallet]);

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
        },
      ]);

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const openUrl = useCallback(
    (url: string) => {
      sdk.actions.openUrl(url);
    },
    [newMessage],
  );

  const renderMessageContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <button
            key={index}
            onClick={() => {
              window.location.href = ethereumURL(part);
              const ethUrl = ethereumURL(part);
              openUrl(ethUrl);
            }}
            className={`${styles.urlButton}`}>
            Pay in USDC
          </button>
        );
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
