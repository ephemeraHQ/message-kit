import { User } from "../../helpers/types";

// Define a list of fake users with usernames and addresses
export const fakeUsers: User[] = [
  {
    username: "alix",
    address: "0x460a92579DF57eb3E8786BA72B83e37E03831635",
    inboxId: "0c85109d5242431e541c28c0f837cca4ce5b6129b5acae7e8b588c3ba5cba5e2",
    accountAddresses: ["0x460a92579DF57eb3E8786BA72B83e37E03831635"],
    installationIds: [],
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
    address: "0x388547F774377C6BEA0844A3221B0Ae2B33F52A4",
    inboxId: "ba6c932e48826aafe413d49505531e0c12f5d1c185a2ffe5174c75e9d0692f32",
    accountAddresses: ["0x388547F774377C6BEA0844A3221B0Ae2B33F52A4"],
    installationIds: [],
  },
];
