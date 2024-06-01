import React, { useState, useRef, useEffect } from "react";

export const MessageInput = ({
  onSendMessage,
  replyingToMessage,
  isPWA = false,
  commands = [],
  users = [],
  isSender = false,
  value,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [showCommands, setShowCommands] = useState(false); // New state for showing commands
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const commandListRef = useRef(null);
  const [navigatingCommands, setNavigatingCommands] = useState(false); // New state to track command navigation
  const [showUsers, setShowUsers] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [navigatingUsers, setNavigatingUsers] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState(users); // New state for filtered users
  const [filteredCommands, setFilteredCommands] = useState(commands); // New state for filtered commands
  const [repliedMsg, setRepliedMsg] = useState(null);

  useEffect(() => {
    if (!replyingToMessage) return;
    let content = replyingToMessage.content;
    if (content?.content) {
      content = content.content;
    }
    setRepliedMsg(content);
  }, [replyingToMessage]);

  useEffect(() => {
    setNewMessage(value || "");
  }, [value]); // Add this useEffect block

  const styles = {
    replyingTo: {
      fontSize: "10px",
      color: "grey",
      paddingBottom: "5px",
      wordBreak: "break-all",
      backgroundColor: "lightblue",
      width: "100%",
    },
    newMessageContainer: {
      position: "relative", // Added to ensure absolute positioning context for commandList

      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      padding: "0px",
      margin: "1rem",
    },
    messageInputField: {
      flexGrow: 1,
      padding: "5px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: isPWA === true ? "12px" : "12px",
      width: isPWA === true ? "82%" : "",
      outline: "none",
    },
    commandList: {
      position: "absolute",
      bottom: "100%", // Position directly below the input field
      left: "0",
      backgroundColor: "white",
      border: "1px solid #ccc",
      fontSize: "12px",
      padding: "0px",
      borderRadius: "5px",
      width: "100%",
      boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
      zIndex: 1000, // Ensure it's above other content
    },

    commandListUL: {
      padding: "5px",
      paddingLeft: "10px",
      margin: "0px",
    },
    commandListLI: {
      padding: "0px",
      cursor: "pointer",
      listStyle: "none",
      backgroundColor: "white", // Default background color
    },
    commandListLISelected: {
      padding: "0px",
      listStyle: "none",
      backgroundColor: "#f0f0f0", // Highlight color for selected command
    },
    sendButton: {
      padding: "5px 10px",
      marginLeft: "5px",
      border: "0px solid #ccc",
      cursor: "pointer",
      borderRadius: "5px",
      textAlign: "center",
      display: "flex",
      backgroundColor: "rgb(79 70 229)",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      height: "100%",
      fontSize: isPWA === true ? "1.0em" : ".8em",
      width: isPWA === true ? "12%" : "",
    },
  };

  useEffect(() => {
    //console.log("showCommands", showCommands, commandListRef.current);
    if (showCommands && commandListRef.current) {
      commandListRef.current.focus(); // Focus the <ul> when commands are shown
    }
  }, [showCommands]);

  const handleCommandChange = (event, index = selectedCommandIndex) => {
    // console.log(event.key, "event.key", index);
    //console.log("value", value);
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      setNavigatingCommands(true);
      const newIndex =
        event.key === "ArrowDown"
          ? (index + 1) % filteredCommands.length
          : (index - 1 + filteredCommands.length) % filteredCommands.length;
      setSelectedCommandIndex(newIndex);
      setNavigatingCommands(false);
      if (event.preventDefault) event.preventDefault();
    } else if (event.key === "Enter" && filteredCommands[index]) {
      const fullCommand = filteredCommands[index].command;
      const baseText = newMessage.slice(0, newMessage.lastIndexOf("/") + 1);
      setNewMessage(`${baseText.replace(/\/$/, "")}${fullCommand} `);
      setShowCommands(false);
      setShowUsers(false);
      setNavigatingCommands(false);
      setNavigatingUsers(false);
      setRepliedMsg(null);
      if (event.preventDefault) event.preventDefault();
    }
  };

  const handleUserChange = (event, index = selectedUserIndex) => {
    //console.log(event.key, "event.key", index);
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      setNavigatingUsers(true);
      const newIndex =
        event.key === "ArrowDown"
          ? (index + 1) % filteredUsers.length
          : (index - 1 + filteredUsers.length) % filteredUsers.length;
      setSelectedUserIndex(newIndex);
      if (event.preventDefault) event.preventDefault();
    } else if (event.key === "Enter" && filteredUsers[index]) {
      const fullUsername = filteredUsers[index].username;
      const baseText = newMessage.slice(0, newMessage.lastIndexOf("@") + 1);
      const remainingText = newMessage.slice(newMessage.lastIndexOf("@") + 1);
      const endOfUsernameIndex =
        remainingText.indexOf(" ") > -1
          ? remainingText.indexOf(" ")
          : remainingText.length;
      const newText =
        baseText + fullUsername + remainingText.slice(endOfUsernameIndex);
      setNewMessage(newText + " ");
      setShowCommands(false);
      setShowUsers(false);
      setNavigatingCommands(false);
      setNavigatingUsers(false);
      setRepliedMsg(null);
      if (event.preventDefault) event.preventDefault();
      // Set cursor position right after the inserted username
      const cursorPosition = baseText.length + fullUsername.length + 1; // +1 for the space after the username
      setTimeout(() => {
        const inputField = document.querySelector(".messageInputField");
        if (inputField) {
          inputField.focus();
          inputField.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    }
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setNewMessage(value);
    if (event.key === "Enter") {
      console.log("entra", showCommands, showUsers);
      if (!showCommands && !showUsers) {
        sendMessage(newMessage);
        if (event.preventDefault) event.preventDefault();
        return;
      }
    } else if (event.key === "Escape") {
      setShowCommands(false);
      setShowUsers(false);
      setNavigatingCommands(false);
      setRepliedMsg(null);
      if (event.preventDefault) event.preventDefault();
      return; // Exit early as no further processing is needed
    }
    // Determine cursor position and check if it follows an '@' or '/'
    const cursorPosition = event.target.selectionStart;

    const atSymbolIndex = value.lastIndexOf("@", cursorPosition - 1);
    const spaceAfterAt = value.indexOf(" ", atSymbolIndex);
    const isOpeningUserPalette =
      atSymbolIndex !== -1 &&
      (spaceAfterAt === -1 || cursorPosition <= spaceAfterAt);

    console.log("isOpeningUserPalette", isOpeningUserPalette);
    const isOpeningCommandPalette =
      value.lastIndexOf("/") > value.lastIndexOf(" ") &&
      (value[cursorPosition] || "").trim() === "";

    if (isOpeningCommandPalette) {
      //console.log("entra1");

      const searchTerm = value
        .slice(value.lastIndexOf("/") + 1, cursorPosition)
        .toLowerCase();
      const filtered = commands
        .flatMap((group) => group.commands)
        .filter((cmd) =>
          cmd.command.toLowerCase().startsWith("/" + searchTerm),
        );
      setFilteredCommands(filtered);
      setSelectedCommandIndex(0); // Reset the index to the first position
      setShowCommands(true);
      setNavigatingCommands(true);
      setShowUsers(false);
      setNavigatingUsers(false);
    } else if (isOpeningUserPalette) {
      //console.log("entra2");

      const searchTerm = value
        .slice(value.lastIndexOf("@") + 1, cursorPosition)
        .toLowerCase();
      const filtered = users.filter((user) =>
        user.username.toLowerCase().startsWith(searchTerm),
      );
      setFilteredUsers(filtered);
      setSelectedCommandIndex(0); // Reset the index to the first position
      setShowUsers(true);
      setNavigatingUsers(true);
      setShowCommands(false);
      setNavigatingCommands(false);
    } else {
      //console.log("entra3");
      setShowCommands(false);
      setNavigatingCommands(false);
      setShowUsers(false);
      setNavigatingUsers(false);
    }
    /*
    console.log(
      isOpeningUserPalette,
      isOpeningCommandPalette,
      "showCommands",
      showCommands,
      navigatingCommands,
      "showUsers",
      showUsers,
      navigatingUsers,
      value,
    );
*/
    if (
      ["ArrowDown", "ArrowUp"].includes(event.key) ||
      ((showCommands || showUsers) && event.key === "Enter")
    ) {
      if (showCommands) {
        handleCommandChange(event);
      } else if (showUsers) {
        handleUserChange(event);
      }
      if (event.preventDefault) event.preventDefault();
    } else if (event.key === "Enter" && value.startsWith("/")) {
      // Send any command starting with '/' directly
      sendMessage(value.trim());
      if (event.preventDefault) event.preventDefault();
    } else {
      setNavigatingCommands(false);
      setNavigatingUsers(false);
    }
  };
  const sendMessage = (message, replyingToMessage) => {
    if (message.startsWith("/")) message = "```" + message + "```";

    onSendMessage(message, replyingToMessage);
    setNewMessage("");
    setShowCommands(false);
    setShowUsers(false);
    setNavigatingCommands(false);
    setNavigatingUsers(false);
    setRepliedMsg(null);
    setRepliedMsg(null);
  };

  return (
    <div style={styles.newMessageContainer}>
      {repliedMsg && repliedMsg.length > 0 && (
        <div style={styles.replyingTo}>Replying to: {repliedMsg}</div>
      )}
      <input
        className="messageInputField"
        style={styles.messageInputField}
        type="text"
        value={newMessage}
        onKeyDown={handleInputChange}
        onChange={handleInputChange}
        placeholder="Type your message..."
      />
      {showUsers && filteredUsers.length > 0 && (
        <div style={styles.commandList} ref={commandListRef}>
          <ul
            style={styles.commandListUL}
            tabIndex="0"
            onKeyDown={handleUserChange}>
            {filteredUsers.map((user, index) => (
              <li
                key={user.username}
                style={
                  index === selectedUserIndex
                    ? styles.commandListLISelected
                    : styles.commandListLI
                }
                onClick={() => {
                  handleUserChange({ key: "Enter" }, index);
                }}
                tabIndex="-1">
                {user.username}
              </li>
            ))}
          </ul>
        </div>
      )}
      {showCommands && filteredCommands.length > 0 && (
        <div style={styles.commandList} ref={commandListRef}>
          <ul
            style={styles.commandListUL}
            tabIndex="0"
            onKeyDown={handleCommandChange}>
            {filteredCommands.map((cmd, index) => (
              <li
                key={cmd.command}
                style={
                  index === selectedCommandIndex
                    ? styles.commandListLISelected
                    : styles.commandListLI
                }
                onClick={() => {
                  handleCommandChange({ key: "Enter" }, index);
                }}
                tabIndex="-1" // Individual items should not be focusable; only the list should be
              >
                {cmd.command} - {cmd.description}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        className="sendButton"
        style={styles.sendButton}
        onClick={() => {
          sendMessage(newMessage, replyingToMessage);
        }}>
        {isPWA ? "📤" : "Send"}
      </button>
    </div>
  );
};
