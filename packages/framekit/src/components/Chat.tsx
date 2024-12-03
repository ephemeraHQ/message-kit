import { useState, useEffect } from "react";
import { Client as V2Client } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";
import styles from "./Chat.module.css";
import { FrameContext } from "@farcaster/frame-sdk";

interface ChatProps {
  recipientAddress: string;
  frameContext?: FrameContext;
}

export default function Chat({ recipientAddress, frameContext }: ChatProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<
    { content: string; sender: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [wallet, setWallet] = useState<any | null>(null);
  const [xmtp, setXmtp] = useState<any>(null);

  useEffect(() => {
    const newWallet = Wallet.createRandom();
    setWallet(newWallet);
    initXmtp(newWallet);
  }, []);

  useEffect(() => {
    const streamMessages = async () => {
      if (!xmtp || !recipientAddress) return;

      try {
        const conversation =
          await xmtp.conversations.newConversation(recipientAddress);

        // Load existing messages
        const messages = await conversation.messages();
        setMessages(
          messages.map((msg: any) => ({
            content: msg.content,
            sender: msg.senderAddress === wallet.address ? "Human" : "Agent",
          })),
        );

        // Listen for new messages
        for await (const message of await conversation.streamMessages()) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              content: message.content,
              sender:
                message.senderAddress === wallet.address ? "Human" : "Agent",
            },
          ]);
        }
      } catch (error) {
        console.error("Error streaming messages:", error);
      }
    };

    streamMessages();
  }, [xmtp, recipientAddress, wallet]);

  const initXmtp = async (wallet: any) => {
    try {
      const xmtpClient = await V2Client.create(wallet, { env: "production" });
      setXmtp(xmtpClient);
      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing XMTP:", error);
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!xmtp || !newMessage || !recipientAddress) {
      console.log("Missing required data:", {
        xmtp: !!xmtp,
        newMessage,
        recipientAddress,
      });
      return;
    }

    try {
      const conversation =
        await xmtp.conversations.newConversation(recipientAddress);
      await conversation.send(newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Detailed error in sendMessage:", error);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.walletInfo}>
        <div>
          Your Wallet: {wallet?.address?.slice(0, 6)}...
          {wallet?.address?.slice(-4)}
        </div>
        <div>
          Recipient: {recipientAddress.slice(0, 6)}...
          {recipientAddress.slice(-4)}
        </div>
      </div>
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div key={index} className={styles.message}>
            <span className={styles.sender}>{msg.sender}</span>
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className={styles.messageForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isLoading ? "Initializing XMTP..." : "Type a message..."}
          className={styles.input}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
