const AlertComponent = ({ show, onClose, message }) => {
  if (!show) return null;

  const styles = {
    container: {
      position: "absolute",
      top: "30%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#fff",
      color: "black",
      border: "1px solid rgb(79 70 229)",
      padding: "10px",
      borderRadius: "8px",
      width: "20%", // Adjusted width
      height: "auto", // Adjusted height
    },
    notSupported: {
      color: "black",
      fontSize: "10px",
      textAlign: "left",
      width: "100%",
      marginBottom: "10px",
      display: "block",
    },
    desc: {
      marginBottom: "10px",
    },
    title: {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    button: {
      cursor: "pointer",
      backgroundColor: "rgb(79 70 229)",
      color: "#fff",
      fontSize: "14px",
      border: "none",
      padding: "5px",
      borderRadius: "5px",
      margin: " 0", //  margin for spacing between buttons
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>⚠️</div>
      <div style={styles.desc}>Error: {message}</div>
      <small style={styles.notSupported}>
        Your frame may not be compatible with{" "}
        <a
          href="https://github.com/open-frames/awesome-open-frames.git"
          style={{ textDecoration: "none" }}>
          Open Frames
        </a>{" "}
        or{" "}
        <a
          href="https://xmtp.org/docs/use-cases/frames"
          style={{ textDecoration: "none" }}>
          XMTP
        </a>
      </small>
      <button style={styles.button} onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default AlertComponent;
