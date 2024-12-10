import { describe, test, expect } from "vitest";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { xmtpClient, createUser } from "../src/lib/client";

describe("Client Private Key Configuration Tests", () => {
  test("simple placeholder test", () => {
    expect(true).toBe(true);
  });

  test("creates a client with a random generated key", async () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    const { client, v2client } = await xmtpClient({
      privateKey: account.privateKey,
      hideInitLogMessage: true,
    });
    expect(client.inboxId).toBeDefined();
    expect(v2client.address).toBeDefined();
  }, 25000);

  test("creates a client with a provided private key", async () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    const { client: v3Client, v2client } = await xmtpClient({
      privateKey: account.privateKey,
      hideInitLogMessage: true,
    });
    expect(v3Client).toBeDefined();
    expect(v2client).toBeDefined();
  }, 15000);

  test("fails gracefully with invalid private key format", async () => {
    const invalidKey = "invalid_key";

    const { client: v3Client } = await xmtpClient({
      privateKey: invalidKey,
      hideInitLogMessage: true,
    });

    // Should fall back to random key generation
    expect(v3Client?.accountAddress).toBeDefined();
  }, 15000); // Added 15 second timeout

  test("creates user with valid private key", () => {
    const privateKey = generatePrivateKey();
    const user = createUser(privateKey);

    expect(user.key).toBe(privateKey);
    expect(user.account).toBeDefined();
    expect(user.wallet).toBeDefined();
  }, 15000); // Added 15 second timeout
});
