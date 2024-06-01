import { useRef, useEffect } from "react";
import { ReactComponent as Degen } from "../assets/DegenEmoji.svg"; // Import your custom SVG
const emojis = ["❤️", "😍", "💪🏻", "🫡"];

export const ActionPicker = ({
  onSelect,
  isSlashCommand,
  isPinned,
  isBotMessage,
  isSender,
  content,
  handleSelectEmoji,
}) => {
  const pickerRef = useRef(null);

  const styles = {
    StyledBadge: {
      padding: "0.225rem",
      backgroundColor: "lightgrey",
      fontSize: "12px",
      borderRadius: "5px",
      display: "inline-block",
      margin: "auto",
      marginRight: "10px",
    },
    RenderedMessage: {
      fontSize: "12px",
      padding: "0px",
    },
    ActionPickerContainer: {
      display: "block",
      backgroundColor: "black",
      padding: "5px",
      borderRadius: "10px",
    },
    ReplyButton: {
      cursor: "pointer",
      display: "block",
      textDecoration: "underline",
    },
    EmojiItem: {
      cursor: "pointer",
      fontSize: "12px",
    },
    OriginalMessage: {
      fontSize: "10px",
      color: "grey",
    },
    ReactionAndReplyDiv: {
      listStyle: "none",
      textAlign: "left",
      fontSize: "10px",
    },
    SenderMessage: {
      textAlign: "left",
      listStyle: "none",
      width: "100%",
    },
    ReceiverMessage: {
      textAlign: "right",
      listStyle: "none",
      width: "100%",
    },
    Footer: {
      display: "block",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    TimeStamp: {
      fontSize: "8px",
      color: "grey",
      display: "block",
      width: "100%",
    },
    UnreadCheckmark: {
      color: "grey",
      display: "block",
      fontSize: "8px",
      width: "100%",
    },
    ReadCheckmark: {
      color: "blue",
      display: "block",
      fontSize: "8px",
      width: "100%",
    },
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onSelect(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onSelect]);

  return (
    <div style={styles.ActionPickerContainer}>
      {!isSender && (
        <Degen
          style={{ cursor: "pointer" }}
          onClick={() => handleSelectEmoji("degen", content)}
        />
      )}
      <a style={styles.ReplyButton} onClick={() => onSelect("reply")}>
        Reply
      </a>
      <span
        style={{ cursor: "pointer" }}
        onClick={() => handleSelectEmoji("pin", content)}>
        {isPinned ? "📌" : "📍"}
      </span>
      {isSlashCommand && (
        <span
          style={{ cursor: "pointer" }}
          className="play-button"
          onClick={() => handleSelectEmoji("play", content)}>
          ▶️
        </span>
      )}
      <div ref={pickerRef}>
        {emojis.map((emoji, index) => (
          <span
            style={styles.EmojiItem}
            key={index}
            onClick={() => onSelect(emoji)}
            role="img"
            aria-label={`emoji-${index}`}>
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
};
