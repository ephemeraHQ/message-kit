import React, { useState, useRef, useEffect } from "react";
import { MessageInput } from "./MessageInput";
import { MessageItem } from "./MessageItem";
import { ContentTypeReaction } from "../middleware/Reaction";
import { ContentTypeBotMessage } from "../middleware/Bot";
import { ContentTypeReply } from "../middleware/Reply";
import { ContentTypeSilent } from "../middleware/Silent";
import { ContentTypeText } from "@xmtp/xmtp-js";
export const MessageContainer = ({
  conversation,
  client,
  searchTerm,
  isContained = false,
  selectConversation,
  setSelectedConversation,
  setSelectedConversation2,
  setBotCommands,
  setUsersData,
  isConsent = false,
  isFullScreen = false,
}) => {
  const [activeActionPickerId, setActiveActionPickerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [showPopup, setShowPopup] = useState();
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [commands, setCommands] = useState([]); // State to hold commands
  const [users, setUsers] = useState([]); // State to hold users
  const [textInputValue, setTextInputValue] = useState("");

  const togglePinMessage = (message) => {
    const messageToPin = messages.find((msg) => msg.id === message.id);
    if (messageToPin) {
      let content = messageToPin.content;
      if (messageToPin.contentType.sameAs(ContentTypeText)) {
        content = messageToPin.content;
      } else if (messageToPin.contentType.sameAs(ContentTypeReply)) {
        content = messageToPin.content.content;
      } else if (messageToPin.contentType.sameAs(ContentTypeBotMessage)) {
        content = messageToPin.content.content;
      }
      const pinnedMessage = {
        content: content, // Spread the content object if it exists
        id: message.id, // Ensure the id is included
      };
      console.log(pinnedMessage);
      setPinnedMessage(pinnedMessage);
    }
  };
  useEffect(() => {
    setShowPopup(conversation?.consentState !== "allowed");
    setShowPopup(false);
  }, [conversation]);

  const styles = {
    loadingText: {
      textAlign: "center",
      fontSize: "12px",
    },
    accessButton: {
      position: "absolute", // Position it relative to the nearest positioned ancestor
      top: "50%", // Center vertically
      left: "50%", // Center horizontally
      transform: "translate(-50%, -50%)", // Offset the button by half its width and height
      padding: "10px", // Some padding
      backgroundColor: "#007BFF", // Example background color
      color: "white", // Text color
      border: "none", // No border
      borderRadius: "5px", // Rounded corners
      cursor: "pointer", // Pointer cursor on hover
    },
    pinnedMessageBar: {
      backgroundColor: "#f0f0f0",
      padding: "10px",
      cursor: "pointer",
    },
    pinnedMessage: {
      fontWeight: "bold",
    },
    unpinIcon: {
      marginLeft: "10px",
    },
    messagesContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%", // Use viewport height to ensure it fits in the screen
    },
    peerAddressContainer: {
      textAlign: "right",
      width: "100%",
      borderBottom: "1px solid lightgrey",
      padding: "0px",
      margin: "2px",
    },
    peerAddressContainerLabel: {
      margin: "0px",
      fontSize: "10px",
      padding: "5px",
    },
    peerAddressContainerhref: {
      textDecoration: "none",
    },
    messagesList: {
      paddingLeft: "5px",
      paddingRight: "5px",
      margin: "0px",
      alignItems: "flex-start",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
    },
    popup: {
      width: "100%",
      padding: "10px",
      backgroundColor: "rgba(211, 211, 211, 0.3)", // lightgrey with transparency
    },
    popupInner: {
      display: "flex",
      justifyContent: "space-evenly",
      width: "100%",
    },
    popupButton: {
      borderRadius: "12px", // Rounded corners
      padding: "5px", // Some padding
      paddingLeft: "10px", // Some padding on the left
      paddingRight: "10px", // Some padding on the right
      border: "none", // No border
    },
    acceptButton: {
      backgroundColor: "blue", // Blue background
      color: "white", // White text
    },
    denyButton: {
      backgroundColor: "red", // Red background
      color: "white", // White text
    },
    popupTitle: {
      textAlign: "center",
      marginTop: "0px",
    },
  };

  const updateMessages = (prevMessages, newMessage) => {
    if (
      newMessage.contentType.sameAs(ContentTypeSilent) &&
      newMessage.senderAddress !== client.address &&
      newMessage.content.content === "grant_access"
    ) {
      console.log(newMessage);
      setHasAccess(true);
    } else if (
      newMessage.contentType.sameAs(ContentTypeSilent) &&
      newMessage.senderAddress !== client.address &&
      newMessage.content.content === "ping"
    ) {
      let context = newMessage.content.metadata;

      if (context.commands) {
        setCommands(context.commands);
        setBotCommands(context.commands);
      }
      if (context.users) {
        setUsers(context.users);
        setUsersData(context.users);
      }
    } else if (
      newMessage.contentType.sameAs(ContentTypeBotMessage) &&
      newMessage.content.context
    ) {
      let context = JSON.parse(newMessage.content.context);

      if (context.commands) {
        setCommands(context.commands);
        setBotCommands(context.commands);
      }
      if (context.users) {
        setUsers(context.users);
        setUsersData(context.users);
      }
    }
    if (newMessage.contentType.sameAs(ContentTypeReaction)) {
      const originalMessageId = newMessage.content.reference;
      const emoji = newMessage.content.content;

      const action = newMessage.content.action;
      return prevMessages.map((m) => {
        if (m.id === originalMessageId) {
          let updatedReactions = new Set(m.reactions); // Create a new Set from existing reactions
          // console.log(  `Current reactions before update: ${Array.from(updatedReactions)}`,);
          if (action === "added") {
            updatedReactions.add(emoji);
          } else if (action === "removed") {
            updatedReactions.delete(emoji);
          }
          //console.log(`Updated reactions after update: ${Array.from(updatedReactions)}`  );
          m.reactions = updatedReactions; // Assign the updated Set back
        }
        return m;
      });
    }

    const doesMessageExist = prevMessages.some(
      (existingMessage) => existingMessage.id === newMessage.id,
    );

    if (!doesMessageExist) {
      newMessage.reactions = new Set(); // Initialize reactions as a Set
      return [...prevMessages, newMessage];
    }

    return prevMessages;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (conversation && conversation.peerAddress) {
          setIsLoading(true);

          const initialMessages = await conversation?.messages();

          let updatedMessages = [];
          // Wait for this to finish
          for (const message of initialMessages) {
            updatedMessages = await updateMessages(updatedMessages, message);
          }
          setMessages(updatedMessages);
          setIsLoading(false);
        }
      } catch (e) {
        console.log(e);
      }
    };

    fetchMessages();
  }, [conversation]);

  // Function to handle the acceptance of a contact
  const handleAccept = async () => {
    // Allow the contact
    await client.contacts.allow([conversation.peerAddress]);
    // Hide the popup
    setShowPopup(false);
    // Refresh the consent list
    await client.contacts.refreshConsentList();
    // Log the acceptance
  };

  // Function to handle the denying of a contact
  const handleDeny = async () => {
    // Deny the contact
    await client.contacts.deny([conversation.peerAddress]);
    // Hide the popup
    setShowPopup(false);
    // Refresh the consent list
    await client.contacts.refreshConsentList();
    // Log the denied
  };
  useEffect(() => {
    let isSubscribed = true; // Flag to manage subscription state

    const startMessageStream = async () => {
      if (conversation && conversation.peerAddress && isSubscribed) {
        try {
          let stream = await conversation.streamMessages();
          for await (const message of stream) {
            if (!isSubscribed) break; // Stop processing if unsubscribed
            setMessages((prevMessages) =>
              updateMessages(prevMessages, message),
            );
          }
        } catch (e) {
          console.log(e);
        }
      }
    };

    startMessageStream();

    return () => {
      isSubscribed = false; // Unsubscribe on cleanup
    };
  }, [conversation]); // Re-run effect when conversation changes

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let count = 0;
    if (!isContained) {
      const interval = setInterval(() => {
        if (count < 5) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          count++;
        } else {
          clearInterval(interval);
        }
      }, 1000); // Repeat every second, up to 5 times
      return () => clearInterval(interval);
    }
  }, [messages, isContained]);

  const handleSendMessage = async (newMessage, replyingToMessage = null) => {
    if (!newMessage.trim()) {
      alert("empty message");
      return;
    }
    if (conversation && conversation.peerAddress) {
      if (replyingToMessage && replyingToMessage.id) {
        try {
          const reply = {
            content: newMessage,
            contentType: ContentTypeText,
            reference: replyingToMessage.id,
            receiver: conversation.peerAddress,
          };
          await conversation.send(reply, {
            contentType: ContentTypeReply,
          });

          setReplyingToMessage(null);
        } catch (error) {
          console.error(error);
        }
      } else await conversation.send(newMessage);
    }
  };

  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const handleReply = async (originalMessage) => {
    setReplyingToMessage(originalMessage);
  };

  const handleReaction = async (message, emoji) => {
    //degen
    if (emoji.props?.emojiType) emoji = emoji.props.emojiType;
    // console.log("degen", emoji);

    const existingReaction = Array.from(message.reactions || []).find(
      (r) => r === emoji,
    );
    const action = existingReaction ? "removed" : "added";

    const reaction = {
      //degen
      reference: message.id,
      schema: "unicode",
      action: action,
      content: emoji,
      receiver: conversation.peerAddress,
    };

    await conversation.send(reaction, {
      contentType: ContentTypeReaction,
    });
  };

  const handleDeepLinkClick = (conv) => {
    setSelectedConversation2(conv);
  };
  const handleSetTextInputValue = (value) => {
    setTextInputValue(value);
  };

  const [hasAccess, setHasAccess] = useState(false);

  const sendAccess = async () => {
    try {
      await conversation.send(
        {
          content: "/access",
          metadata: {
            sender: client.address,
            reference: conversation.topic,
          },
        },
        {
          contentType: ContentTypeSilent,
        },
      );
    } catch (error) {
      console.error("Error requesting access:", error);
    }
  };

  return (
    <div style={styles.messagesContainer}>
      {hasAccess ? (
        <>
          {isLoading ? (
            <div style={styles.loadingText}>Loading messages...</div>
          ) : (
            <>
              {isFullScreen && (
                <div style={styles.peerAddressContainer}>
                  <div style={styles.peerAddressContainerLabel}>
                    To: {conversation.peerAddress}
                    <div
                      onClick={() => {
                        window.open(
                          window.location.href +
                            "dm/" +
                            conversation.peerAddress,
                          "_blank",
                        );
                      }}
                      style={{ display: "inline", cursor: "pointer" }}>
                      {" "}
                      🔗
                    </div>
                    <div
                      onClick={() => {
                        navigator.clipboard.writeText(conversation.peerAddress);
                        alert("Address copied to clipboard");
                      }}
                      style={{ display: "inline", cursor: "pointer" }}>
                      {" "}
                      📋
                    </div>
                  </div>
                </div>
              )}
              {pinnedMessage && (
                <div style={styles.pinnedMessageBar}>
                  <div
                    onClick={() => togglePinMessage(pinnedMessage)}
                    style={styles.pinnedMessage}>
                    {pinnedMessage.content}
                    <span style={styles.unpinIcon}>📌</span>
                  </div>
                </div>
              )}
              <ul style={styles.messagesList}>
                {messages.map((message) => {
                  return (
                    <MessageItem
                      key={message.id}
                      message={message}
                      onReaction={handleReaction}
                      onReply={handleReply}
                      senderAddress={message.senderAddress}
                      messageReactions={message.reactions ?? []}
                      client={client}
                      conversation={conversation}
                      setSelectedConversation2={handleDeepLinkClick}
                      onTogglePin={() => togglePinMessage(message)}
                      isPinned={pinnedMessage === message.id}
                      setTextInputValueTop={handleSetTextInputValue}
                      activeActionPickerId={activeActionPickerId}
                      setActiveActionPickerId={setActiveActionPickerId}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </ul>
              {isConsent && showPopup ? (
                <div style={styles.popup}>
                  <h4 style={styles.popupTitle}>
                    State is <small>{conversation.consentState}</small>. Do you
                    trust this contact?
                  </h4>
                  <div style={styles.popupInner}>
                    {conversation.consentState !== "allowed" && (
                      <button
                        style={{
                          ...styles.popupButton,
                          ...styles.acceptButton,
                        }}
                        onClick={handleAccept}>
                        Allow
                      </button>
                    )}
                    {conversation.consentState !== "denied" && (
                      <button
                        style={{ ...styles.popupButton, ...styles.denyButton }}
                        onClick={handleDeny}>
                        Deny
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
              <MessageInput
                commands={commands}
                users={users}
                value={textInputValue}
                replyingToMessage={replyingToMessage}
                onSendMessage={(msg) => {
                  handleSendMessage(msg, replyingToMessage);
                  setReplyingToMessage(null);
                  setTextInputValue("");
                }}
              />
            </>
          )}
        </>
      ) : (
        <div>
          <button
            style={styles.accessButton}
            onClick={() => {
              sendAccess(true);
            }}>
            Request access
          </button>
        </div>
      )}
    </div>
  );
};
