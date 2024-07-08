import { User } from "../../helpers/types";

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
    inboxId: "3942e354e8cce5e9d550cf152749a795514adbe1c27d97b88b9fcc63a596c7e4",
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
