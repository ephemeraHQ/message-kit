import { User } from "./types";

/*
  Issue:
  There are many incostencies with casing. Parsing everything with lowerCase
  is not ideal, but it's the best we can do for now.
*/

export function mapUsernamesToInboxId(
  usernames: string[],
  users: User[],
): User[] {
  return usernames
    .map((username) => {
      return users.find((user) => user.username === username.replace("@", ""));
    })
    .filter((user): user is User => user !== null);
}

// Define a list of fake users with usernames and addresses
export const fakeUsers: User[] = [
  {
    username: "alix",
    address: "0x3a044b218BaE80E5b9E16609443A192129A67BeA",
    inboxId: "da3750159ea7541dda1e271076a3663d8c14576ab85bbd3416d45c9f19e35cbc",
    accountAddresses: ["0x3a044b218BaE80E5b9E16609443A192129A67BeA"],
    installationIds: [],
    fake: true,
  },
  {
    username: "eva",
    address: "0xeAc10D864802fCcfe897E3957776634D1AE006B2",
    inboxId: "6196afe3fd16c276113b0e4fc913745c39af337ea869fb49a2835201874de49c",
    accountAddresses: ["0xeAc10D864802fCcfe897E3957776634D1AE006B2"],
    installationIds: [],
    fake: true,
  },
  {
    username: "bo",
    address: "0xbc3246461ab5e1682baE48fa95172CDf0689201a",
    inboxId: "62fbcbbca125996c95d9a95d9e666b54543e7792106f06dda0048bb5e7e96399",
    accountAddresses: ["0xbc3246461ab5e1682baE48fa95172CDf0689201a"],
    installationIds: [],
    fake: true,
  },
];
export function populateUsernames(
  members: any,
  clientAddress: string,
  senderInboxId: string,
) {
  if (!members) return [];
  // Map existing members to the required format
  const mappedMembers = members.map((member: any) => ({
    username: member.username?.toLowerCase(),
    accountAddresses: member.accountAddresses.map((address: string) =>
      address.toLowerCase(),
    ),
    address: member?.accountAddresses?.[0].toLowerCase(),
    inboxId: member?.inboxId?.toLowerCase(),
    permissionLevel: member.permissionLevel,
  }));
  for (let member of mappedMembers) {
    if (member?.inboxId?.toLowerCase() === senderInboxId?.toLowerCase()) {
      member.username = "me";
    } else if (
      member?.address?.toLowerCase() === clientAddress?.toLowerCase()
    ) {
      member.username = "bot";
    } else if (
      member.address.toLowerCase() ===
      "0xc16c47ea4a9f6ba81664f7623245b2c7429c71dc"
    ) {
      member.username = "fabridesktop";
    } else {
      const fakeUser = fakeUsers.find(
        (user) => user.address.toLowerCase() === member.address.toLowerCase(),
      );
      if (fakeUser) {
        member.username = fakeUser.username?.toLowerCase();
        member.address = member.address?.toLowerCase();
      }
    }
  }
  const remainingUsers = fakeUsers.filter(
    (fakeUser) =>
      !mappedMembers.some(
        (member: any) =>
          member.address.toLowerCase() === fakeUser.address.toLowerCase(),
      ),
  );
  remainingUsers.forEach((user) => {
    mappedMembers.push({
      username: user.username?.toLowerCase(),
      accountAddresses: [user.address?.toLowerCase()],
      address: user.address?.toLowerCase(),
      inboxId: user.inboxId?.toLowerCase(),
      permissionLevel: 0,
      fake: user.fake,
    });
  });
  return mappedMembers as User[];
}
