import React from "react";

export const Debug = ({ client, users, commands }) => {
  const styles = {
    container: {
      padding: "10px",
      backgroundColor: "#f0f0f0",
      borderRadius: "4px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    },
    infoText: {
      fontSize: "10px",
      color: "#333",
      padding: "5px",
      backgroundColor: "#fff",
      borderRadius: "4px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    },
    list: {
      listStyleType: "none",
      padding: 0,
      margin: 0,
      fontSize: "10px",
    },
    listItem: {
      padding: "4px",
      borderBottom: "1px solid #ccc",
    },
    header: {
      color: "#333",
      marginBottom: "5px",
      fontSize: "1px",
    },
  };
  return (
    <div style={styles.container}>
      <h4>Users</h4>
      <ul style={styles.list}>
        {users.map((user, index) => (
          <li key={index} style={styles.listItem}>
            Username:{" "}
            {user.fc ? (
              <a
                href={`https://warpcast.com/${user.fc}`}
                target="_blank"
                rel="noreferrer">
                {user.username}
              </a>
            ) : (
              user.username
            )}
            , Address: {user.address}, Degen score: {user.degen}
          </li>
        ))}
      </ul>
      <h4>Commands</h4>
      <ul style={styles.list}>
        {commands.map((command, index) => (
          <li key={index} style={styles.listItem}>
            {command.icon} <b>{command.name}</b> {command.description}
            <ul style={styles.subList}>
              {command?.commands?.map((subCommand, subIndex) => (
                <li key={subIndex} style={styles.subListItem}>
                  {subCommand.command}: {subCommand.description}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};
