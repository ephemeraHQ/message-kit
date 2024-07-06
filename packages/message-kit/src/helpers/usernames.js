/*
  Issue:
  There are many incostencies with casing. Parsing everything with lowerCase
  is not ideal, but it's the best we can do for now.
*/
export function mapUsernamesToInboxId(usernames, users) {
    return usernames
        .map((username) => {
        return users.find((user) => user.username === username.replace("@", ""));
    })
        .filter((user) => user !== null);
}
// Define a list of fake users with usernames and addresses
export const fakeUsers = [
    {
        username: "alice",
        address: "0x460a92579DF57eb3E8786BA72B83e37E03831635",
        inboxId: "0c85109d5242431e541c28c0f837cca4ce5b6129b5acae7e8b588c3ba5cba5e2",
        accountAddresses: ["0x460a92579DF57eb3E8786BA72B83e37E03831635"],
        installationIds: [],
        fake: true,
    },
    {
        username: "eva",
        address: "0xeAc10D864802fCcfe897E3957776634D1AE006B2",
        inboxId: "3942e354e8cce5e9d550cf152749a795514adbe1c27d97b88b9fcc63a596c7e4",
        accountAddresses: ["0xeAc10D864802fCcfe897E3957776634D1AE006B2"],
        installationIds: [],
        fake: true,
    },
    {
        username: "bob",
        address: "0x388547F774377C6BEA0844A3221B0Ae2B33F52A4",
        inboxId: "ba6c932e48826aafe413d49505531e0c12f5d1c185a2ffe5174c75e9d0692f32",
        accountAddresses: ["0x388547F774377C6BEA0844A3221B0Ae2B33F52A4"],
        installationIds: [],
        fake: true,
    },
];
export function populateUsernames(members, clientAddress, senderInboxId) {
    // Map existing members to the required format
    const mappedMembers = members.map((member) => ({
        username: member.username?.toLowerCase(),
        accountAddresses: member.accountAddresses.map((address) => address.toLowerCase()),
        address: member.accountAddresses?.[0].toLowerCase(),
        inboxId: member.inboxId.toLowerCase(),
        permissionLevel: member.permissionLevel,
    }));
    for (let member of mappedMembers) {
        if (member.inboxId.toLowerCase() === senderInboxId.toLowerCase()) {
            member.username = "me";
        }
        else if (member.address.toLowerCase() === clientAddress.toLowerCase()) {
            member.username = "bot";
        }
        else if (member.address.toLowerCase() ===
            "0xc16c47ea4a9f6ba81664f7623245b2c7429c71dc") {
            member.username = "fabridesktop";
        }
        else {
            const fakeUser = fakeUsers.find((user) => user.address.toLowerCase() === member.address.toLowerCase());
            if (fakeUser) {
                member.username = fakeUser.username?.toLowerCase();
                member.address = member.address?.toLowerCase();
            }
        }
    }
    const remainingUsers = fakeUsers.filter((fakeUser) => !mappedMembers.some((member) => member.address.toLowerCase() === fakeUser.address.toLowerCase()));
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
    return mappedMembers;
}
//# sourceMappingURL=usernames.js.map