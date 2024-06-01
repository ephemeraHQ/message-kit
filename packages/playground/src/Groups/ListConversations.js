"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

export const ListConversations = ({
  searchTerm,
  client,
  selectConversation,
  onConversationFound,
  isPWA = false,
  isFullScreen = false,
  isConsent = false,
}) => {
  // Inside your ListConversations component
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const [allowedConversations, setAllowedConversations] = useState([]);
  const [requestConversations, setRequestConversations] = useState([]);
  const [activeTab, setActiveTab] = useState("allowed"); // Added state for active tab

  const hightlightConversation = (conversation) => {
    selectConversation(conversation);
    setSelectedConversation(conversation.peerAddress);
    if (conversation.peerAddress) {
      navigate(`/dm/${conversation.peerAddress}`, {});
      if (isConsent && conversation.consentState !== "allowed") {
        setActiveTab("requests");
      }
    }
  };
  const styles = {
    conversationListItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      margin: "0px",
      border: "0px",
      borderBottom: "1px solid #e0e0e0",
      cursor: "pointer",
      backgroundColor: "#f0f0f0",

      transition: "background-color 0.3s ease",
      padding: isPWA === true ? "15px" : "10px",
    },
    conversationListItemTab: {
      width: "100%",
      fontSize: "12px",
      padding: "5px",
    },
    avatarImage: {
      // New style for the avatar image
      width: "40px", // Adjust the size as needed
      height: "40px", // Adjust the size as needed
      borderRadius: "50%", // Makes the image circular
      marginRight: "10px", // Adds some space between the image and the text
    },
    conversationDetails: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      width: "75%",
      marginLeft: isPWA === true ? "15px" : "10px",
      overflow: "hidden",
    },
    conversationName: {
      fontSize: isPWA === true ? "15px" : "16px",
      fontWeight: "bold",
    },
    messagePreview: {
      fontSize: isPWA === true ? "12px" : "12px",
      color: "#666",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    conversationTimestamp: {
      fontSize: isPWA === true ? "10px" : "10px",
      color: "#999",
      width: "25%",
      textAlign: "right",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
  };

  useEffect(() => {
    let isMounted = true;
    let stream;
    const fetchAndStreamConversations = async () => {
      setLoading(true);
      if (isConsent) {
        //Refresh consent
        await client.contacts.refreshConsentList();
      }
      const allConversations = await client.conversations.list();
      // Assuming you have a method to fetch the last message for a conversation

      const sortedConversations = allConversations.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      if (isMounted) {
        setConversations(sortedConversations);
      }
      setLoading(false);

      stream = await client.conversations.stream();
      for await (const conversation of stream) {
        //Need to fix this manually
        if (conversation.client?.address === client.address)
          await client.contacts.allow([conversation.peerAddress]);
        if (isMounted) {
          setConversations((prevConversations) => {
            const newConversations = [...prevConversations, conversation];
            return newConversations.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );
          });
        }

        //break;
      }
    };

    fetchAndStreamConversations();

    return () => {
      isMounted = false;
      if (stream) {
        stream.return();
      }
    };
  }, []);
  const [lastMessages, setLastMessages] = useState([]); // Parallel array for last messages

  useEffect(() => {
    const fetchLastMessages = async () => {
      try {
        const messages = [];
        if (conversations.length > 100) {
          console.warn(
            "Notice: This app is not optimized for performance with a high number of conversations. For a better experience, try with wallets that have fewer conversations.",
          );
        }

        for (const conversation of conversations) {
          const conversationMessages = await conversation.messages();
          let lastMessage = "";
          try {
            lastMessage = conversationMessages[conversationMessages.length - 1];
            lastMessage = lastMessage?.content;
          } catch (error) {
            console.error("Failed to fetch last message:", error);
          }

          // Store objects with conversation ID and last message content
          messages.push({
            topic: conversation.topic, // Assuming each conversation has a unique 'id' field
            content: lastMessage,
          });
        }
        setLastMessages(messages);
      } catch (error) {
        console.error("Failed to fetch last messages:", error);
      }
    };

    if (conversations.length > 0) {
      fetchLastMessages();
    }
  }, [conversations]);

  useEffect(() => {
    if (selectedConversation) {
      navigate(`/dm/${selectedConversation}`, {});
    }
  }, [selectedConversation, navigate]);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/dm\/(0x[a-fA-F0-9]{40})/); // Adjust regex as needed
    if (match) {
      const address = match[1];
      const conversationToSelect = conversations.find(
        (conv) => conv.peerAddress === address,
      );
      if (conversationToSelect) {
        hightlightConversation(conversationToSelect);
      } else {
        console.log("No conversation found with address:", address);
      }
    } else if (conversations.length > 0 && isFullScreen) {
      // If no deep linking match, select the first conversation by default
      let firstConv = conversations[0];
      if (isConsent) {
        const allowedConversations = conversations.filter(
          (conversation) => conversation.consentState === "allowed",
        );
        firstConv = allowedConversations[0];
      }
      hightlightConversation(firstConv);
    }
  }, [conversations, location.pathname, selectConversation]);

  useEffect(() => {
    const refreshAndFilterConversations = async () => {
      const filtered = conversations.filter(
        (conversation) =>
          conversation?.peerAddress
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
          conversation?.peerAddress !== client.address,
      );
      if (filtered.length > 0) onConversationFound(true);
      else onConversationFound(false);
      if (isConsent) {
        const allowedConversations = filtered.filter(
          (conversation) => conversation.consentState === "allowed",
        );

        const requestConversations = filtered.filter(
          (conversation) => conversation.consentState === "unknown",
        );

        setAllowedConversations(allowedConversations);
        setRequestConversations(requestConversations);
      }
    };

    refreshAndFilterConversations();
  }, [conversations, searchTerm, client.address]); // Add other dependencies as needed

  // When rendering conversations, match the last message by conversation ID
  const renderConversations = (conversations) => {
    if (!searchTerm && conversations.length === 0) {
      return (
        <small style={styles.conversationListItem}>
          No conversations found
        </small>
      );
    }
    return conversations.map((conversation, index) => {
      let lastMessageContent = "";
      try {
        let test =
          lastMessages.find((msg) => msg.topic === conversation.topic)
            ?.content || "...";
        if (test.content) {
          test = test.content;
          if (test.emoji) {
            test = lastMessageContent.content;
          }
        }
        lastMessageContent = test;
      } catch (error) {
        console.error("Failed to fetch last message:", error);
      }

      return (
        <li
          key={index}
          style={{
            ...styles.conversationListItem,
            backgroundColor:
              selectedConversation === conversation.peerAddress
                ? "#d0e0f0"
                : styles.conversationListItem.backgroundColor,
          }}
          onClick={() => {
            hightlightConversation(conversation);
          }}>
          <img src="/avatar.png" alt="Avatar" style={styles.avatarImage} />
          <div style={styles.conversationDetails}>
            {selectConversation.peerAddress}
            <span style={styles.conversationName}>
              {conversation.peerAddress.substring(0, 7) +
                "..." +
                conversation.peerAddress.substring(
                  conversation.peerAddress.length - 5,
                )}
            </span>
            <span style={styles.messagePreview}>{lastMessageContent}</span>
          </div>
          <div style={styles.conversationTimestamp}>
            {getRelativeTimeLabel(conversation.createdAt)}
          </div>
        </li>
      );
    });
  };
  // UI for switching between tabs and displaying conversations
  return (
    <>
      {loading ? (
        <small style={styles.conversationListItem}>
          Loading conversations...
        </small>
      ) : (
        <>
          {activeTab === "requests" ? (
            <button
              style={{
                ...styles.conversationListItem,
                width: "100%",
                padding: "5px",
              }}
              onClick={() => setActiveTab("allowed")}>
              <div style={styles.conversationDetails}>← Allowed</div>
            </button>
          ) : (
            <button
              style={{
                ...styles.conversationListItem,
                width: "100%",
                padding: "5px",
              }}
              onClick={() => setActiveTab("requests")}>
              <div style={styles.conversationDetails}>
                Requests ({requestConversations.length}) →
              </div>
            </button>
          )}
          {activeTab === "allowed"
            ? renderConversations(allowedConversations)
            : renderConversations(requestConversations)}
        </>
      )}
    </>
  );
};

const getRelativeTimeLabel = (dateString) => {
  const diff = new Date() - new Date(dateString);
  const diffMinutes = Math.floor(diff / 1000 / 60);
  const diffHours = Math.floor(diff / 1000 / 60 / 60);
  const diffDays = Math.floor(diff / 1000 / 60 / 60 / 24);
  const diffWeeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7);

  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
};
