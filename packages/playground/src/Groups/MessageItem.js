import React, { useState, useEffect } from "react";
import { Frame } from "../Frames/Frame";
import { ActionPicker } from "./ActionPicker";
import { ContentTypeReply } from "../middleware/Reply";
import { ContentTypeSilent } from "../middleware/Silent";
import {
  getFrameTitle,
  isValidFrame,
  getOrderedButtons,
  isXmtpFrame,
} from "../Frames/FrameInfo";
import { createWalletClient, custom } from "viem";
import { ContentTypeBotMessage } from "../middleware/Bot";
import { sepolia } from "viem/chains";

import { useNavigate } from "react-router-dom";
import { FramesClient } from "@xmtp/frames-client";
import { fetchFrameFromUrl } from "../Frames/utils"; // Ensure you have this helper or implement it

import { ContentTypeReaction } from "../middleware/Reaction";

export const MessageItem = ({
  message,
  senderAddress,
  client,
  onReaction,
  messageReactions,
  conversation,
  setSelectedConversation2,
  onTogglePin,
  onReply,
  isPinned,
  setActiveActionPickerId,
  activeActionPickerId,
  setTextInputValueTop,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [frameMetadata, setFrameMetadata] = useState();
  const [frameButtonUpdating, setFrameButtonUpdating] = useState(0);
  const [textInputValue, setTextInputValue] = useState("");
  const isSender = senderAddress === client?.address;
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const showFrame = isValidFrame(frameMetadata);
  const [isXmtpFrameInitial, setIsXmtpFrameInitial] = useState(false);

  const [reactions, setReactions] = useState(Array.from(messageReactions));
  const [showActionPicker, setShowActionPicker] = useState(false);

  // console.log("reactions", reactions);
  const styles = {
    senderBar: {
      backgroundColor: "transparent",
      position: "relative",
      color: isSender ? "#D35400" : "#FF5733",
      fontSize: "10px",
      textAlign: "left",
    },
    messageContent: {
      backgroundColor: "rgb(79 70 229)",
      padding: "5px",

      alignSelf: "flex-start",
      textAlign: "left",
      color: "white",
      display: "inline-block",
      margin: "5px",
      borderRadius: "5px",
      maxWidth: "80%",
      fontSize: "12px",
      wordBreak: "break-word",
      listStyle: "none",
    },
    greenBackground: {
      backgroundColor: "green",
    },
    deepLink: {
      color: "white",
      textDecoration: "underline",
      fontSize: "12px",
      cursor: "pointer",
    },
    renderedMessage: {
      fontSize: "12px",
      wordBreak: "break-word",
      padding: "5px 10px",
      maxWidth: "300px",
    },
    senderMessage: {
      alignSelf: "flex-start",
      textAlign: "left",
      listStyle: "none",
      width: "100%",
      padding: "0px",
    },
    receiverMessage: {
      padding: "0px",
      alignSelf: "flex-end",
      listStyle: "none",
      textAlign: "right",
      width: "100%",
    },
    reply: {
      color: "lightgrey",
      fontSize: "10px",
    },
    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    timeStamp: {
      fontSize: "8px",
      color: "lightgrey",
    },
    actionPicker: {
      position: "relative", // Use absolute positioning
      bottom: 0, // Position it at the bottom of the <li>
      left: 0, // Default to left; adjust based on sender or receiver in the component logic
      width: "auto", // Allow it to expand as needed
      zIndex: 1000, // Ensure it's above other content
    },
  };

  const handleEmojiPick = (emoji) => {
    //degen
    if (emoji?.emoji) emoji = emoji.emoji; // Access the emoji from the object
    if (emoji?.emoji?.props?.emojiType) emoji = emoji.props.emojiType;

    const receiverAddress = emoji?.receiverAddress || "";
    if (emoji) {
      setReactions((prevReactions) => {
        const existingEmoji = prevReactions.find((r) => r.emoji === emoji);
        if (existingEmoji) {
          return prevReactions.filter((r) => r.emoji !== emoji);
        }
        return [...prevReactions, emoji]; // Store the entire object
      });
      onReaction(message, emoji, receiverAddress); // Pass receiverAddress if needed in onReaction
    }
  };
  function onTextInputChange(event) {
    setTextInputValue(event.target.value);
  }
  const conversationTopic = message.contentTopic;

  const handleFrameButtonClick = async (buttonIndex, action = "post") => {
    // Ensure Action Picker is not shown
    setActiveActionPickerId(null);
    try {
      if (!frameMetadata || !client || !frameMetadata?.frameInfo?.buttons) {
        return;
      }
      const { frameInfo, url: frameUrl } = frameMetadata;
      if (!frameInfo.buttons) {
        return;
      }
      const button = frameInfo.buttons[buttonIndex];

      setFrameButtonUpdating(buttonIndex);
      const framesClient = new FramesClient(client);
      const postUrl = button.target || frameInfo.postUrl || frameUrl;
      const payload = await framesClient.signFrameAction({
        frameUrl,
        inputText: textInputValue || undefined,
        buttonIndex,
        conversationTopic,
        participantAccountAddresses: [senderAddress, client.address],
        address: client.address,
        state: frameInfo.state,
      });
      console.log("Button clicked", payload);

      if (action === "tx") {
        const transactionInfo = await framesClient.proxy.postTransaction(
          button.target,
          {
            ...payload,
          },
        );
        const address = transactionInfo.params.to;

        try {
          const walletClient = createWalletClient({
            chain: sepolia,
            transport: custom(window.ethereum),
          });

          const hash = await walletClient.sendTransaction({
            account: client.address,
            to: address,
            value: transactionInfo.params.value, // 1 as bigint
          });

          const buttonPostUrl =
            frameMetadata.extractedTags["fc:frame:button:1:post_url"];
          const completeTransactionMetadata = await framesClient.proxy.post(
            buttonPostUrl,
            {
              ...payload,
              transactionId: hash,
            },
          );
          setFrameMetadata(completeTransactionMetadata);
        } catch (e) {
          console.log("Transaction error", e);
        }
      } else if (action === "post") {
        const updatedFrameMetadata = await framesClient.proxy.post(
          postUrl,
          payload,
        );
        setFrameMetadata(updatedFrameMetadata);
        console.log(updatedFrameMetadata);
      } else if (action === "post_redirect") {
        const { redirectedTo } = await framesClient.proxy.postRedirect(
          postUrl,
          payload,
        );
        window.open(redirectedTo, "_blank");
      } else if (action === "link" && button?.target) {
        window.open(button.target, "_blank");
      }
      setFrameButtonUpdating(0);
    } catch (e) {
      setShowAlert(true);
      setAlertMessage(e.message);
      //alert("Error: " + e.message);
      console.error(e);
    }
    // Ensure Action Picker is not shown
    setActiveActionPickerId(null);
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        const metadata = await fetchFrameFromUrl(message);
        setFrameMetadata(metadata);
        setIsXmtpFrameInitial(isXmtpFrame(metadata)); // Set the initial isXmtpFrame value here

        setIsLoading(false);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMetadata();
  }, [message?.content]);

  const renderFooter = (timestamp) => {
    return (
      <div style={styles.footer}>
        <span style={styles.timeStamp}>
          {`${new Date(timestamp).getHours()}:${String(
            new Date(timestamp).getMinutes(),
          ).padStart(2, "0")}`}
        </span>
      </div>
    );
  };
  const handleReplyPick = (reply) => {
    if (reply) {
      onReply(message, reply);
    }
    setShowActionPicker(false);
  };
  const handleSelect = (selected) => {
    if (selected === "reply") {
      handleReplyPick(selected);
    } else {
      handleEmojiPick(selected);
    }
  };

  const handleDeepLinkClick = async (deepLinkMatch, event) => {
    event.preventDefault();
    event.stopPropagation(); // Stop event from bubbling up
    const linkType = deepLinkMatch.split(":")[0];
    const linkValue = deepLinkMatch.split(":")[1];
    if (linkType === "dm") {
      setSelectedConversation2(linkValue.replace("/", ""));
    } else if (linkType === "bot") {
    } else if (linkType === "tx") {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          console.log("Sending to address:", linkValue); // Log the address

          if (!linkValue || !/^0x[a-fA-F0-9]{40}$/.test(linkValue)) {
            console.error("Invalid Ethereum address:", linkValue);
            return; // Stop execution if the address is invalid
          }

          const transactionParameters = {
            nonce: "0x00", // Replace with correct nonce
            gasPrice: "0x09184e72a000", // Replace with current gas price
            gas: "0x2710", // Replace with estimated gas needed
            to: linkValue, // The address to send the transaction
            from: window.ethereum.selectedAddress, // Must match user's active address
            value: "0x00", // Amount to send in wei, 0 in this case
            data: "0x0", // Optional, but used for contract interactions
          };

          const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParameters],
          });
          console.log("Transaction Hash:", txHash);
        } catch (error) {
          console.error("Transaction Error:", error);
        }
      } else {
        console.error("MetaMask is not available");
      }
    }
  };

  window.handleDeepLinkClick = handleDeepLinkClick;
  // Function to execute command
  window.executeCommand = (command, event) => {
    event.preventDefault();
    event.stopPropagation();
    handleSelectEmoji("play", command);
  };

  const handleSelectEmoji = async (emojiData, content) => {
    if (emojiData === "degen") {
      const reaction = {
        //degen
        reference: message.id,
        schema: "unicode",
        action: "added",
        content: emojiData,
        receiver: conversation.peerAddress,
      };

      await conversation.send(reaction, {
        contentType: ContentTypeReaction,
      });
    } else if (emojiData === "reply") {
      await conversation.send(content);
    } else if (emojiData === "pin") {
      onTogglePin(message.id);
    } else if (emojiData === "play") {
      // Force update by toggling a state that always changes
      content = content.trim();
      setTextInputValueTop(content + " "); // Adding a space to ensure change
      setTimeout(() => setTextInputValueTop(content), 0); // Reset immediately for user not to notice
    }
    setActiveActionPickerId(null);
  };

  const handleRightClick = (event) => {
    event.preventDefault(); // Prevent the default context menu
    const newActiveId = activeActionPickerId === message.id ? null : message.id;
    setActiveActionPickerId(newActiveId);
    setShowActionPicker(newActiveId === message.id);
  };
  function slashCommandParser(content) {
    const slashCommandRegex = /(```)(\/[^\s`]+(?:\s[^\s`]+)*)\1|`([^`\n]+)`/g;

    // First replace commands wrapped in code blocks
    content = content.replaceAll("```", "`");
    content = content.replace(slashCommandRegex, (match, p1, p2, p3) => {
      let command = p1 && p2 ? `${p1}${p2}${p1}` : `${p3}`;
      command = command.replaceAll("<br />", "").replaceAll("<br>", "");
      return `<code onclick="executeCommand('${command}',event)">${command}</code>`;
    });

    return content;
  }
  const renderMessage = (message) => {
    const codec = client.codecFor(message.contentType);
    let content = message.content;
    if (!content) return;
    let receivers = [],
      isBotMessage = false,
      replyTo = null;

    //console.log(content, message.contentType);

    if (message.contentType.sameAs(ContentTypeBotMessage)) {
      content = message.content?.content;
      receivers = message.content?.receivers;
      isBotMessage = true;
    } else if (message.contentType.sameAs(ContentTypeSilent)) {
      return;
    } else if (message.contentType.sameAs(ContentTypeReply)) {
      content = message.content.content;
      replyTo = message.content.reference;
      //receivers = [message.content.receiver];
    } else if (!codec) {
      /*Not supported content type*/
      if (message?.contentFallback !== undefined)
        content = message?.contentFallback;
      else return;
    }
    // Check if the current client's address is in the receivers list
    if (receivers.length > 0 && !receivers.includes(client.address)) {
      return; // Do not render the message if the current user is not in the receivers list
    }
    if (frameMetadata?.url && showFrame)
      content = content.replace(frameMetadata?.url, "");

    const shortSenderAddress = isBotMessage
      ? "🤖"
      : `${senderAddress.slice(0, 6)}...${senderAddress.slice(-4)}`;

    content = content.split("\n").join("<br />");
    //content = content.replaceAll("<br />", "");

    //Regex
    const deepLinkRegex = /(dm|tx):\/?([0-9a-zA-Z]{42})(\?[a-zA-Z0-9=&]+)?/g;
    let deepLinkMatch = content.match(deepLinkRegex);
    if (deepLinkMatch) {
      deepLinkMatch = deepLinkMatch[0];
      const linkType = deepLinkMatch.split(":")[0];
      // Split content around the deep link and render parts separately
      const parts = content.split(deepLinkMatch);
      if (linkType === "dm") {
        content = `${parts[0]}<a href="#" onclick="handleDeepLinkClick('${deepLinkMatch}', event)" class="confirm-link">Go to conversation</a>${parts[1]}`;
      } else if (linkType === "tx") {
        content = `${parts[0]}<a href="#" onclick="handleDeepLinkClick('${deepLinkMatch}', event)" class="confirm-link">Confirm</a>${parts[1]}`;
      }
    }

    // Check if the message starts with a slash command
    const isSlashCommand = content.trim().startsWith("/");
    content = slashCommandParser(content);
    const showActionPicker = activeActionPickerId === message.id;

    return (
      <li
        style={isSender ? styles.senderMessage : styles.receiverMessage}
        key={message.id}>
        <div
          style={{
            ...styles.messageContent,
            ...(isBotMessage ? styles.greenBackground : {}),
          }}
          onContextMenu={handleRightClick}>
          <div style={styles.senderBar}>{shortSenderAddress}</div>

          {replyTo && (
            <div style={styles.renderedMessage}>
              <span style={styles.reply}>{"Reply:"}</span>
            </div>
          )}
          {showFrame && frameMetadata?.frameInfo && (
            <>
              {isLoading && (
                <div style={styles.renderedMessage}>{"Loading..."}</div>
              )}
              <Frame
                image={frameMetadata?.frameInfo?.image.content}
                title={getFrameTitle(frameMetadata)}
                buttons={getOrderedButtons(frameMetadata)}
                handleClick={handleFrameButtonClick}
                frameButtonUpdating={frameButtonUpdating}
                showAlert={showAlert}
                alertMessage={alertMessage}
                onClose={() => setShowAlert(false)}
                interactionsEnabled={isXmtpFrameInitial}
                textInput={frameMetadata?.frameInfo?.textInput?.content}
                onTextInputChange={onTextInputChange}
                frameUrl={frameMetadata?.url}
              />
            </>
          )}

          {!showFrame && content && (
            <div
              style={styles.renderedMessage}
              onClick={(e) => {
                if (deepLinkMatch) handleDeepLinkClick(deepLinkMatch, e);
              }}
              dangerouslySetInnerHTML={{ __html: content }}></div>
          )}

          <div style={styles.ReactionAndReplyDiv}>
            {/*} {reactions.map((emoji, index) => (
              <span
                key={index}
                className="emoji-reaction"
                onClick={() => handleEmojiPick(emoji)}
                role="img"
                aria-label={`emoji-reaction-${index}`}>
                {emoji}
              </span>
           ))} */}
            {showActionPicker && (
              <div
                style={{
                  ...styles.actionPicker,
                  left: isSender ? "auto" : 0, // For sender, align to right; for receiver, align to left
                  right: isSender ? 0 : "auto", // Adjust this as needed
                }}>
                <ActionPicker
                  onSelect={handleSelect}
                  isSlashCommand={isSlashCommand}
                  isPinned={isPinned}
                  isSender={isSender}
                  content={content}
                  isBotMessage={isBotMessage}
                  handleSelectEmoji={handleSelectEmoji}
                />
              </div>
            )}
          </div>
          {renderFooter(message.sent)}
        </div>
      </li>
    );
  };
  return renderMessage(message);
};
