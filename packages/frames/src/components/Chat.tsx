import { useState, useEffect } from "react";
import { Client as V2Client } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";
import styles from "./Chat.module.css";
import { getUserInfo, UserInfo } from "@/app/utils/resolver";
import { isAddress } from "viem";

interface ChatProps {
  recipientAddress: string;
}

interface Message {
  id: string;
  content: string;
  sender: string;
}

export default function Chat({ recipientAddress }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [wallet, setWallet] = useState<any | null>(null);
  const [xmtp, setXmtp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipientInfo, setRecipientInfo] = useState<UserInfo | null>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [processedMessageIds] = useState(new Set<string>());

  useEffect(() => {
    const init = async () => {
      const newWallet = Wallet.createRandom();
      setWallet(newWallet);

      try {
        const userInfo = await getUserInfo(recipientAddress);
        setRecipientInfo(userInfo);

        if (userInfo?.address) {
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
  }, [recipientAddress]);

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
          {recipientInfo?.preferredName ||
            (isAddress(recipientAddress)
              ? recipientAddress.slice(0, 6) +
                "..." +
                recipientAddress.slice(-4)
              : recipientAddress)}
        </div>
      </div>
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div key={msg.id || index} className={styles.message}>
            <span className={styles.sender}>{msg.sender}</span>
            {msg.content}
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
