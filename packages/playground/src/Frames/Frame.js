import AlertComponent from "./AlertComponent";
import ButtonGroup from "./ButtonGroup";

export const Frame = ({
  image,
  title,
  buttons,
  handleClick,
  frameButtonUpdating,
  interactionsEnabled,
  showAlert,
  onClose,
  alertMessage,
  textInput,
  onTextInputChange,
  frameUrl,
}) => {
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
      height: "auto",
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
  };

  return (
    <>
      <AlertComponent
        show={showAlert}
        onClose={onClose}
        message={alertMessage}
      />
      <a
        href={frameUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={styles.imageFrameA}>
        <img src={image} alt={title} style={styles.imageFrame} />
      </a>
      {textInput !== undefined && (
        <input
          type="text"
          placeholder={textInput}
          onChange={onTextInputChange}
          style={styles.textInput}
        />
      )}
      <div style={styles.buttonContainer}>
        <ButtonGroup
          buttons={buttons}
          handleClick={handleClick}
          frameButtonUpdating={frameButtonUpdating}
        />
      </div>
      {!interactionsEnabled && (
        <span style={styles.notSupported}>
          Frame not fully supported by XMTP
        </span>
      )}
    </>
  );
};
