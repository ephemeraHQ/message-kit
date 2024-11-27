import fetch from "node-fetch";

export async function sendLog(title: string, description: string) {
  const response = await fetch("https://api.minilog.dev/v1/logs/testlog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer pthsm38sccpux5acriqish7isz5inet7q73ef7br",
    },
    body: JSON.stringify({
      application: "myapp-1",
      severity: "DEBUG",
      data: title,
      metadata: {
        title,
        description,
      },
    }),
  });
  console.log(response);
  if (!response.ok) {
    console.error("Failed to send log:", response.statusText);
  } else {
    console.log("Log sent successfully");
  }
}
