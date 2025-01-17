import { describe, test, expect } from "vitest";
import { generatePrivateKey } from "viem/accounts";
import { XMTP, createUser } from "@xmtp/agent-starter";

describe("Client Private Key Configuration Tests", () => {
  test("creates a client with a random generated key", async () => {
    const xmtp = new XMTP();
    await xmtp.init();
    expect(xmtp?.inboxId).toBeDefined();
  }, 25000); // Added 15 second timeout

  test("creates a client with a provided private key", async () => {
    const encryptionKey = generatePrivateKey();
    const xmtp = new XMTP(undefined, {
      encryptionKey,
    });
    await xmtp.init();
    expect(xmtp?.inboxId).toBeDefined();
  }, 15000); // Added 15 second timeout

  test("fails gracefully with invalid private key format", async () => {
    const invalidKey = "invalid_key";

    const xmtp = new XMTP(undefined, {
      encryptionKey: invalidKey,
    });
    await xmtp.init();

    // Should fall back to random key generation
    expect(xmtp?.inboxId).toBeDefined();
  }, 15000); // Added 15 second timeout

  test("creates user with valid private key", () => {
    const privateKey = generatePrivateKey();
    const user = createUser(privateKey);

    expect(user.key).toBe(privateKey);
    expect(user.account).toBeDefined();
    expect(user.wallet).toBeDefined();
  }, 15000); // Added 15 second timeout
});
