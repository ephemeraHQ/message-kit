import { User } from "./types";

// Define a list of fake users with usernames and addresses
export const fakeUsers: User[] = [
  {
    username: "alice",
    address: "0x20B572bE48527a770479744AeC6fE5644F97678B",
    accountAddresses: ["0x20B572bE48527a770479744AeC6fE5644F97678B"],
    inboxId: "0x20B572bE48527a770479744AeC6fE5644F97678B",
  },
  {
    username: "eva",
    address: "0x1b3Fa6C3Ad9a9090059C98cfd8De2d1C95ab1C42",
    accountAddresses: ["0x1b3Fa6C3Ad9a9090059C98cfd8De2d1C95ab1C42"],
    inboxId: "0x1b3Fa6C3Ad9a9090059C98cfd8De2d1C95ab1C42",
  },
  {
    username: "bob",
    address: "0xf0490b45884803924Ca84C2051ef435991D7350D",
    accountAddresses: ["0xf0490b45884803924Ca84C2051ef435991D7350D"],
    inboxId: "0xf0490b45884803924Ca84C2051ef435991D7350D",
  },
];

export function populateUsernames(
  members: any,
  clientAddress: string,
  senderInboxId: string,
) {
  // Map existing members to the required format
  const mappedMembers = members.map((member: any) => ({
    username: member.username,
    address: member.address,
    accountAddresses: member.accountAddresses,
    inboxId: member.inboxId,
  }));

  // Create entries for 'bot' and 'me'
  const bot = {
    username: "bot",
    address: clientAddress,
    accountAddresses: [clientAddress],
    inboxId: clientAddress,
  };

  const me = {
    username: "me",
    address: senderInboxId,
    accountAddresses: [senderInboxId],
    inboxId: senderInboxId,
  };

  // Combine all users
  let combinedUsers = [...mappedMembers, ...fakeUsers, bot, me];

  // Remove duplicates, prioritize 'bot' and 'me' entries
  const uniqueUsers = combinedUsers.reduce((acc, currentUser) => {
    const index = acc.findIndex(
      (user: any) => user.inboxId === currentUser.inboxId,
    );
    if (index > -1) {
      // Replace existing with 'bot' or 'me' if applicable
      if (currentUser.username === "bot" || currentUser.username === "me") {
        acc[index] = currentUser;
      }
    } else {
      acc.push(currentUser);
    }
    return acc;
  }, []);

  return uniqueUsers;
}
