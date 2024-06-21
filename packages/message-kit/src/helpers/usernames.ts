import { User } from "./types";

// Define a list of fake users with usernames and addresses
export const fakeUsers: User[] = [
  {
    username: "alice",
    address: "0x460a92579DF57eb3E8786BA72B83e37E03831635",
  },
  {
    username: "eva",
    address: "0xeAc10D864802fCcfe897E3957776634D1AE006B2",
  },
  {
    username: "bob",
    address: "0x388547F774377C6BEA0844A3221B0Ae2B33F52A4",
  },
];
// bot 0x9dcfdcc4d2bd07916d51bdc0d8fedfad864cfd16
// 8648095e06507a597a6ac8aae7c4b468c8946ca34bd48047f1fc2a77b0947a19
// fabri desktop 0x2bf357b8bc06bd6f79ac963868d904495e6bc695
// 049f4dce5f7a1dd70e3d10f73c8bef5739906e975b71f9632bf3b386d6aac585
export function populateUsernames(
  members: any,
  clientAddress: string,
  senderInboxId: string,
) {
  // Map existing members to the required format
  const mappedMembers = members.map((member: any) => ({
    username: member.username,
    accountAddresses: member.accountAddresses.map((address: string) =>
      address.toLowerCase(),
    ),
    address: member.accountAddresses?.[0].toLowerCase(),
    inboxId: member.inboxId.toLowerCase(),
    permissionLevel: member.permissionLevel,
  }));
  for (let member of mappedMembers) {
    if (member.inboxId === senderInboxId.toLowerCase()) {
      member.username = "me";
    } else if (member.address === clientAddress.toLowerCase()) {
      member.username = "bot";
    } else {
      const fakeUser = fakeUsers.find(
        (user) => user.address.toLowerCase() === member.address,
      );
      if (fakeUser) {
        member.username = fakeUser.username;
        member.address = member.address;
      }
    }
  }
  return mappedMembers;
}
