import React, { useState, useEffect } from "react";
import { Client } from "@xmtp/xmtp-js";
import { ethers } from "ethers";
import { ConversationContainer } from "./ConversationContainer";
import { MessageContainer } from "./MessageContainer";
import { useNavigate } from "react-router-dom";
//@ts-ignore
import { ReactionCodec } from "../middleware/Reaction";
import { ReplyCodec } from "../middleware/Reply";
import { SilentCodec } from "../middleware/Silent";
import { BotMessageCodec } from "../middleware/Bot";

import { Debug } from "./Debug";

export function FloatingInbox({
  wallet,
  env,
  isPWA = false,
  isFullScreen = true,
  onLogout,
  isContained = false,
  isConsent = false,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isOnNetwork, setIsOnNetwork] = useState(false);
  const [client, setClient] = useState();
  const [isConnected, setIsConnected] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [signer, setSigner] = useState();
  const [isWalletCreated, setIsWalletCreated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [botCommands, setBotCommands] = useState([]);
  const setBotsCommands = (commands) => {
    // console.log("commands", commands);
    setBotCommands(commands);
  };
  const [users, setUsers] = useState([]);
  const setUsersData = (users) => {
    setUsers(users);
  };

  useEffect(() => {
    const initialIsOpen =
      isPWA ||
      isContained ||
      localStorage.getItem("isWidgetOpen") === "true" ||
      false;
    const initialIsOnNetwork =
      localStorage.getItem("isOnNetwork") === "true" || false;
    const initialIsConnected =
      (localStorage.getItem("isConnected") && wallet === "true") || false;

    setIsOpen(initialIsOpen);
    setIsOnNetwork(initialIsOnNetwork);
    setIsConnected(initialIsConnected);
  }, []);

  const styles = {
    FloatingLogo: {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: "white",
      display: "flex",
      alignItems: "center",
      border: "1px solid #ccc",
      justifyContent: "center",
      cursor: "pointer",
      transition: "transform 0.3s ease",
      padding: "5px",
    },
    uContainer: {
      position: isContained ? "relative" : isPWA ? "relative" : "fixed",
      bottom: isContained ? "0px" : isPWA ? "0px" : "80px",
      right: isContained ? "0px" : isPWA ? "0px" : "20px",
      width: isContained ? "100%" : isPWA ? "100%" : "300px",
      height: isContained ? "100%" : isPWA ? "100vh" : "400px",
      border: isContained ? "0px" : isPWA ? "0px" : "1px solid #ccc",
      backgroundColor: "#f9f9f9",
      borderRadius: isContained ? "0px" : isPWA ? "0px" : "10px",
      zIndex: "1000",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    logoutBtn: {
      position: "absolute",
      top: "10px",
      textDecoration: "none",
      color: "#000",
      left: "5px",
      background: "transparent",
      border: "none",
      fontSize: isPWA === true ? "12px" : "10px",
      cursor: "pointer",
    },
    widgetHeader: {
      padding: "2px",
    },
    labelGithub: {
      textDecoration: "none",
      color: "black",
      marginRight: "10px",
    },
    labelGithub2: {
      color: "black",
      fontSize: "10px",
      marginBottom: "10px",
      postition: "absolute", // Added position absolute
      bottom: "50px",
      marginTop: "20px",
      textDecoration: "underline",
    },
    labelRight: {
      textAlign: "right",
      fontSize: "10px",
    },
    label: {
      fontSize: "10px",
      textAlign: "center",
      marginTop: "5px",
      cursor: "pointer",
      display: "block",
    },
    conversationHeader: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "none",
      border: "none",
      width: "auto",
      margin: "0px",
    },
    conversationHeaderH4: {
      margin: "0px",
      padding: "4px",
      fontSize: isPWA === true ? "14px" : "12px", // Increased font size
    },
    backButton: {
      border: "0px",
      background: "transparent",
      cursor: "pointer",
      color: "black",
      fontSize: isPWA === true ? "14px" : "14px", // Increased font size
      display: "inline-block",
      textDecoration: "none",
    },
    widgetContent: {
      flexGrow: 1,
      overflowY: "auto",
    },
    xmtpContainer: {
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
      alignItems: "center",
      height: "100%",
      position: "relative",
    },
    btnXmtp: {
      display: "block",
      border: "1px",
      padding: "8px",
      borderRadius: "5px",
      color: "white",
      marginTop: "10px",
      textAlign: "center",
      backgroundColor: "rgb(79 70 229)",
      margin: "0 auto",
      fontSize: "14px",
    },
  };

  useEffect(() => {
    localStorage.setItem("isOnNetwork", isOnNetwork.toString());
    localStorage.setItem("isWidgetOpen", isOpen.toString());
    localStorage.setItem("isConnected", isConnected.toString());
  }, [isOpen, isConnected, isOnNetwork]);

  const loadSavedWallet = () => {
    const storedWalletAddress = localStorage.getItem("walletAddress");
    if (storedWalletAddress) {
      const privateKey = loadKeysEthers(storedWalletAddress);
      if (privateKey) {
        const wallet = new ethers.Wallet(privateKey);
        return wallet;
      }
    }
    return null;
  };

  const connectWallet = async () => {
    const savedWallet = loadSavedWallet();
    if (savedWallet) {
      setSigner(savedWallet);
      setAddress(savedWallet.address);
      setIsConnected(true);
      return; // Stop execution if a wallet was successfully loaded
    }

    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setSigner(signer);
        setAddress(await getAddress(signer));
        setIsConnected(true);
      } catch (error) {
        console.error("User rejected request", error);
      }
    } else {
      console.error("Metamask not found");
    }
  };

  const getAddress = async (signer) => {
    try {
      //ethers
      if (signer && typeof signer.getAddress === "function") {
        return await signer.getAddress();
      }
      //viem
      else if (signer && typeof signer.getAddresses === "function") {
        const [address] = await signer.getAddresses();
        return address;
      }
      return null;
    } catch (e) {
      console.log(e);
    }
  };

  const createNewWallet = async () => {
    const newWallet = ethers.Wallet.createRandom();
    storeKeysEthers(newWallet.address, newWallet.privateKey);
    setSigner(newWallet);
    setAddress(newWallet.address);

    setIsConnected(true);
    setIsWalletCreated(true); // Set isWalletCreated to true when a new wallet is created
  };

  const openWidget = () => {
    setIsOpen(true);
  };

  const closeWidget = () => {
    setIsOpen(false);
  };

  if (typeof window !== "undefined") {
    window.FloatingInbox = {
      open: openWidget,
      close: closeWidget,
    };
  }

  const handleLogout = async () => {
    setIsConnected(false);
    const address = await getAddress(signer);
    wipeKeys(address);
    localStorage.removeItem("onboarding");
    setSigner(null);
    setAddress(null);
    setIsOnNetwork(false);
    setClient(null);
    setSelectedConversation(null);
    navigate(`/`);
    localStorage.removeItem("isOnNetwork");
    localStorage.removeItem("isConnected");
    localStorage.removeItem("walletAddress");
    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  const [address, setAddress] = useState(null);

  useEffect(() => {
    const init = async () => {
      // get the loclstorage value of is on network
      const onboarding = localStorage.getItem("onboarding") === "true";
      if (wallet) {
        setSigner(wallet);
        setAddress(wallet.address);
        setIsConnected(true);
      }
      if (client && !isOnNetwork) {
        setIsOnNetwork(true);
      }
      if (signer && isOnNetwork && isConnected) {
        initXmtpWithKeys();
      }
      if (signer && isConnected && !isOnNetwork && onboarding) {
        initXmtpWithKeys();
      }
      if (
        !signer &&
        (isConnected ||
          onboarding ||
          localStorage.getItem("walletAddress") !== null)
      ) {
        connectWallet();
      }
    };
    init();
  }, [wallet, signer, isOnNetwork, isConnected]);

  const initXmtpWithKeys = async function () {
    try {
      if (!signer) {
        handleLogout();
        return;
      }
      let address = await getAddress(signer);
      let keys = loadKeys(address);

      const clientOptions = {
        env: env ? env : getEnv(),
      };

      if (!keys) {
        keys = await Client.getKeys(signer, {
          ...clientOptions,
          skipContactPublishing: true,
          persistConversations: false,
        });
        storeKeys(address, keys);
      }
      const xmtp = await Client.create(null, {
        ...clientOptions,
        codecs: [
          new ReactionCodec(),
          new BotMessageCodec(),
          new ReplyCodec(),
          new SilentCodec(),
        ],
        privateKeyOverride: keys,
      });
      setClient(xmtp);
      setIsOnNetwork(!!xmtp.address);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeepLinkClick = async (conversation) => {
    const conv = await client.conversations.newConversation(conversation);
    setSelectedConversation(conv);
  };

  return (
    <>
      {!isPWA && !isContained && (
        <div
          onClick={isOpen ? closeWidget : openWidget}
          className={
            "FloatingInbox " +
            (isOpen ? "spin-clockwise" : "spin-counter-clockwise")
          }
          style={styles.FloatingLogo}>
          💬
        </div>
      )}
      {isOpen && (
        <div
          style={styles.uContainer}
          className={" " + (isOnNetwork ? "expanded" : "")}>
          {isConnected && (
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          )}
          {isConnected && isOnNetwork && (
            <div
              style={{
                ...styles.widgetHeader,
                display: "flex",
                justifyContent: "space-between",
              }}>
              <div style={{ flex: 1 }}></div>
              <div
                style={{ width: "50%", textAlign: "center", margin: "0 auto" }}>
                <h4 style={styles.conversationHeaderH4}>
                  {isOnNetwork && selectedConversation && !isFullScreen ? (
                    <button
                      style={styles.backButton}
                      onClick={() => {
                        setSelectedConversation(null);
                        navigate(`/`);
                      }}>
                      ← Conversations
                    </button>
                  ) : (
                    <span>Playground</span>
                  )}
                </h4>
              </div>
              <div style={{ flex: 1, textAlign: "right" }}>
                {" "}
                {/* Right content */}
                {isFullScreen && (
                  <div
                    style={styles.labelRight}
                    onClick={() => {
                      navigator.clipboard.writeText(address);
                      alert("Address copied to clipboard");
                    }}>
                    {"Your address: " +
                      address?.substring(0, 7) +
                      "..." +
                      address?.substring(address?.length - 5)}{" "}
                    📋
                  </div>
                )}
              </div>
            </div>
          )}
          <div style={styles.widgetContent}>
            {!isConnected && (
              <div style={styles.xmtpContainer}>
                <button style={styles.btnXmtp} onClick={connectWallet}>
                  Connect Wallet
                </button>
                <div style={styles.label} onClick={createNewWallet}>
                  or create new one
                </div>
              </div>
            )}
            {isConnected && !isOnNetwork && (
              <div style={styles.xmtpContainer}>
                <button style={styles.btnXmtp} onClick={initXmtpWithKeys}>
                  Connect to XMTP
                </button>
                {isWalletCreated && signer?.address && (
                  <div style={styles.label}>
                    <div
                      style={styles.label}
                      onClick={() => {
                        navigator.clipboard.writeText(signer.address);
                        alert("Address copied to clipboard");
                      }}>
                      Your address: {signer.address}
                      <br></br>
                      📋 (click to copy)
                    </div>
                  </div>
                )}
              </div>
            )}
            {!isFullScreen && isConnected && isOnNetwork && client && (
              <ConversationContainer
                isPWA={isPWA}
                env={env ? env : getEnv()}
                client={client}
                isFullScreen={isFullScreen}
                isConsent={isConsent}
                isContained={isContained}
                updateSearchTerm={setSearchTerm}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
              />
            )}
            {isConnected && isOnNetwork && client && isFullScreen && (
              <div style={{ display: "flex", height: "100%" }}>
                <div style={{ flex: 1, overflowY: "auto", maxWidth: "450px" }}>
                  <ConversationContainer
                    isPWA={isPWA}
                    env={env ? env : getEnv()}
                    client={client}
                    isConsent={isConsent}
                    isFullScreen={isFullScreen}
                    isContained={isContained}
                    updateSearchTerm={setSearchTerm}
                    selectedConversation={selectedConversation}
                    setSelectedConversation={setSelectedConversation}
                  />
                </div>
                <div style={{ flex: 2, overflowY: "auto" }}>
                  {selectedConversation?.id}{" "}
                  {selectedConversation && (
                    <MessageContainer
                      client={client}
                      isContained={isContained}
                      isFullScreen={isFullScreen}
                      conversation={selectedConversation}
                      searchTerm={""}
                      isConsent={isConsent}
                      setBotCommands={setBotsCommands}
                      setUsersData={setUsersData}
                      selectConversation={selectedConversation}
                      setSelectedConversation={setSelectedConversation}
                      setSelectedConversation2={handleDeepLinkClick}
                    />
                  )}
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                  <Debug client={client} commands={botCommands} users={users} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const ENCODING = "binary";

export const getEnv = () => {
  // "dev" | "production" | "local"
  return typeof process !== "undefined" && process.env.REACT_APP_XMTP_ENV
    ? process.env.REACT_APP_XMTP_ENV
    : "production";
};
export const buildLocalStorageKey = (walletAddress) => {
  return walletAddress ? `xmtp:${getEnv()}:keys:${walletAddress}` : "";
};

export const loadKeys = (walletAddress) => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : null;
};
export const storeKeysEthers = (walletAddress, keys) => {
  localStorage.setItem("walletAddress", walletAddress);
  localStorage.setItem(walletAddress, keys);
};
export const loadKeysEthers = (walletAddress) => {
  const val = localStorage.getItem(walletAddress);
  return val;
};
export const storeKeys = (walletAddress, keys) => {
  localStorage.setItem("onboarding", "true");
  localStorage.setItem(
    buildLocalStorageKey(walletAddress),
    Buffer.from(keys).toString(ENCODING),
  );
};

export const wipeKeys = (walletAddress) => {
  localStorage.removeItem(buildLocalStorageKey(walletAddress));
};
