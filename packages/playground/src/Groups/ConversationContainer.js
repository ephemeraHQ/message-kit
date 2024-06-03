import React, { useState } from "react";
import { ethers } from "ethers";
import { Client } from "@xmtp/xmtp-js";
import { ListConversations } from "./ListConversations";
import { MessageContainer } from "./MessageContainer";
import { useNavigate } from "react-router-dom";
import { ContentTypeSilent } from "../middleware/Silent";

export const ConversationContainer = ({
  client,
  env,
  selectedConversation,
  updateSearchTerm,
  setSelectedConversation,
  isFullScreen = false,
  isContained = false,
  isPWA = false,
  isConsent = false,
}) => {
  const navigate = useNavigate();
  // Existing state declarations
  const [loadingNewConv, setLoadingNewConv] = useState(false); // Add this line for new conversation loading state
  const [searchTerm, setSearchTerm] = useState("");
  const [peerAddress, setPeerAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResolve, setLoadingResolve] = useState(false);
  const [conversationFound, setConversationFound] = useState(false);
  const [createNew, setCreateNew] = useState(false);

  const styles = {
    conversations: {
      height: "100%",
      backgroundColor: "#f0f0f0",
    },
    conversationList: {
      padding: "0px",
      margin: "0",
      listStyle: "none",
      overflowY: "scroll",
      WebkitOverflowScrolling: "touch", // Let it scroll on iOS
    },
    conversationListItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      margin: "0px",
      border: "0px",
      borderBottom: "1px solid #e0e0e0",
      cursor: "pointer",
      backgroundColor: "#f0f0f0",
      padding: "10px",
      marginTop: "0px",
      transition: "background-color 0.3s ease",
    },
    conversationDetails: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      width: "75%",
      marginLeft: "10px",
      overflow: "hidden",
    },
    conversationName: {
      fontSize: "16px",
      fontWeight: "bold",
    },
    messagePreview: {
      fontSize: "14px",
      color: "#666",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    conversationTimestamp: {
      fontSize: "12px",
      color: "#999",
      width: "25%",
      textAlign: "right",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    createNewLoading: {
      display: "block",
      border: "1px",
      padding: "5px",
      borderRadius: "5px",
      marginTop: "10px",
      textAlign: "center",
      color: "white",
      backgroundColor: "rgb(79 70 229)",
      margin: "0 auto",
      fontSize: "14px",
    },
    createNewButton: {
      display: "block",
      border: "1px",
      padding: "5px",
      borderRadius: "5px",
      color: "white",
      cursor: "pointer",
      marginTop: "10px",
      textAlign: "center",
      backgroundColor: "rgb(79 70 229)",
      margin: "0 auto",
      fontSize: "14px",
    },
    createNewButtonR: {
      display: "block",
      padding: "5px",
      border: "0px",
      cursor: "pointer",
      borderRadius: "5px",
      color: "rgb(79 70 229)",
      margin: "0 auto",
      cursor: "pointer",
      textAlign: "center",
      backgroundColor: "transparent",
      borderBotton: "1px solid rgb(79 70 229)",
      fontSize: "10px",
    },
    messageClass: {
      textAlign: "center",
      margin: "10px",
      display: "block",
    },
    peerAddressInput: {
      width: "100%",
      padding: "10px",
      boxSizing: "border-box",
      border: "0px solid #ccc",
      outline: "none",
    },
  };

  const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSearchChange = async (e) => {
    setCreateNew(false);
    setConversationFound(false);
    setSearchTerm(e.target.value);
    updateSearchTerm(e.target.value);
    setMessage("Searching...");
    const addressInput = e.target.value;
    const isEthDomain = /\.eth$/.test(addressInput);
    let resolvedAddress = addressInput;
    if (isEthDomain) {
      setLoadingResolve(true);
      try {
        const provider = new ethers.providers.CloudflareProvider();
        resolvedAddress = await provider.resolveName(resolvedAddress);
      } catch (error) {
        console.log(error);
        setMessage("Error resolving address");
        setCreateNew(false);
      } finally {
        setLoadingResolve(false);
      }
    }
    if (resolvedAddress && isValidEthereumAddress(resolvedAddress)) {
      processEthereumAddress(resolvedAddress);
      setSearchTerm(resolvedAddress);
      updateSearchTerm(resolvedAddress);
    } else {
      setMessage("Invalid Ethereum address");
      setPeerAddress(null);
      setCreateNew(false);
    }
  };

  const processEthereumAddress = async (address) => {
    setPeerAddress(address);
    if (address === client.address) {
      setMessage("No self messaging allowed");
      setCreateNew(false);
    } else {
      const canMessageStatus = await client?.canMessage(address);
      if (canMessageStatus) {
        setPeerAddress(address);
        setMessage("Address is on the network ✅");
        setCreateNew(true);
      } else {
        setMessage("Address is not on the network ❌");
        setCreateNew(false);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", fontSize: "small" }}>Loading...</div>
    );
  }

  const handleDeepLinkClick = (conversation) => {
    setSelectedConversation(conversation);
  };
  const renderListConversations = () => {
    return (
      <div style={styles.conversations}>
        <ul style={styles.conversationList}>
          <input
            type="text"
            placeholder="Enter a 0x wallet or ENS address"
            value={searchTerm}
            onChange={handleSearchChange}
            style={styles.peerAddressInput}
          />
          {loadingResolve && searchTerm && <small>Resolving address...</small>}
          {!searchTerm &&
            (loadingNewConv ? ( // Check if loadingNewConv is true
              <button style={styles.createNewButtonR}>Loading...</button> // Display loading message or spinner
            ) : (
              <button
                style={{
                  ...styles.createNewButtonR,
                }}
                onClick={async () => {
                  setLoadingNewConv(true); // Set loading state to true
                  try {
                    const randomWallet = ethers.Wallet.createRandom();
                    const randomClient = await Client.create(randomWallet, {
                      env: env,
                    });
                    const newConversation =
                      await client.conversations.newConversation(
                        randomClient.address,
                      );
                    setSelectedConversation(newConversation);
                    setSearchTerm("");
                    if (newConversation?.peerAddress) {
                      navigate(`/dm/${newConversation?.peerAddress}`, {});
                    }
                  } catch (error) {
                    console.error("Failed to create new conversation", error);
                    // Optionally handle error (e.g., display error message)
                  } finally {
                    setLoadingNewConv(false); // Reset loading state regardless of outcome
                  }
                }}>
                or create random conversation
              </button>
            ))}
          <ListConversations
            isPWA={isPWA}
            client={client}
            isFullScreen={isFullScreen}
            searchTerm={searchTerm}
            isConsent={isConsent}
            selectConversation={setSelectedConversation}
            onConversationFound={(state) => {
              setConversationFound(state);
              setCreateNew(!state);
            }}
          />
          {message && conversationFound !== true && (
            <small style={styles.messageClass}>{message}</small>
          )}
          {peerAddress && createNew && !conversationFound && (
            <>
              {loadingNewConv ? ( // Check if loadingNewConv is true
                <button style={styles.createNewLoading}>Loading...</button> // Display loading message or spinner
              ) : (
                <button
                  style={styles.createNewButton}
                  onClick={async () => {
                    setLoadingNewConv(true); // Set loading state to true
                    try {
                      const newConversation =
                        await client.conversations.newConversation(peerAddress);

                      newConversation.send(
                        {
                          content: "/ping",
                        },
                        {
                          contentType: ContentTypeSilent,
                        },
                      );
                      setSelectedConversation(newConversation);
                      setSearchTerm("");
                      if (newConversation?.peerAddress) {
                        navigate(`/dm/${newConversation?.peerAddress}`, {});
                      }
                    } catch (error) {
                      console.error("Failed to create new conversation", error);
                      // Optionally handle error (e.g., display error message)
                    } finally {
                      setLoadingNewConv(false); // Reset loading state regardless of outcome
                      //setCreateNew(false);
                    }
                  }}>
                  Create new conversation
                </button>
              )}
            </>
          )}
        </ul>
      </div>
    );
  };
  return (
    <>
      {isFullScreen ? (
        renderListConversations()
      ) : (
        <>
          {!selectedConversation ? (
            renderListConversations()
          ) : (
            <MessageContainer
              client={client}
              isContained={isContained}
              conversation={selectedConversation}
              searchTerm={searchTerm}
              isConsent={isConsent}
              selectConversation={setSelectedConversation}
              setSelectedConversation2={handleDeepLinkClick}
            />
          )}
        </>
      )}
    </>
  );
};
