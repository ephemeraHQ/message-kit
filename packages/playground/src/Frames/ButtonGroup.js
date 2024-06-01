const ButtonGroup = ({ buttons, handleClick, frameButtonUpdating }) => {
  const styles = {
    buttonContainer: {
      display: "flex",
      flexDirection: "column",
    },
    notSupported: {
      fontSize: "10px",
      textAlign: "center",
      width: "100%",
      display: "block",
    },
    buttonRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "4px",
    },
    button: {
      flex: 1,
      marginRight: "4px",
      backgroundColor: "white",
      border: "0px",
    },
    imageFrameA: {
      maxWidth: "300px",
      bottom: "0",
      right: "0",
      display: "block",
    },
    imageFrame: {
      width: "100%",
      bottom: "0",
      right: "0",
    },
    redirectIcon: {
      marginLeft: "5px", // Space between the button label and the icon
    },
    textInput: {
      width: "calc(100% - 8px)", // Adjusted to match the buttonRow width considering the marginRight
      outline: "none",
      boxShadow: "none",
    },
    redirectIcon: {
      marginLeft: "5px", // Space between the button label and the icon
    },
    button: {
      flex: 1,
      marginRight: "4px",
      backgroundColor: "white",
      border: "0px",
    },
  };
  const renderButton = (button, index) => {
    if (!button) {
      return null;
    }

    const handlePress = () => handleClick(button.buttonIndex, button.action);
    const isDisabled = frameButtonUpdating === index + 1;
    const buttonStyle = {
      ...styles.button,
      marginRight: index % 2 === 0 ? "4px" : "0px", // Adjust marginRight for every second button
      backgroundColor: isDisabled ? "#f0f0f0" : styles.button.backgroundColor, // Greyed out effect when disabled
      color: isDisabled ? "#a0a0a0" : "initial", // Text color change when disabled
      cursor: isDisabled ? "not-allowed" : "pointer", // Cursor change when disabled
    };
    return (
      <button
        key={`${button}-${index}`}
        onClick={handlePress}
        disabled={isDisabled}
        style={buttonStyle}>
        {button.label}
        {button.action === "post_redirect" && (
          <span style={styles.redirectIcon}>↪</span>
        )}
      </button>
    );
  };

  return (
    /*
      The FrameButtons component receives the following props:
      If there are 2 buttons they get split on the first line
      If there are 3 buttons the first two split a line and the third button takes the second line
      4 buttons have two split lines
      The arrow icon only appears on buttons that will open a new browser window.
    */
    <>
      {buttons.length <= 2 && (
        <div style={styles.buttonRow}>
          {buttons.map((button, index) => renderButton(button, index))}
        </div>
      )}
      {buttons.length === 3 && (
        <>
          <div style={styles.buttonRow}>
            {buttons
              .slice(0, 2)
              .map((button, index) => renderButton(button, index))}
          </div>
          <div style={styles.buttonRow}>{renderButton(buttons[2], 2)}</div>
        </>
      )}
      {buttons.length >= 4 && (
        <>
          <div style={styles.buttonRow}>
            {buttons
              .slice(0, 2)
              .map((button, index) => renderButton(button, index))}
          </div>
          <div style={styles.buttonRow}>
            {buttons
              .slice(2, 4)
              .map((button, index) => renderButton(button, index + 2))}
          </div>
        </>
      )}
    </>
  );
};
export default ButtonGroup;
