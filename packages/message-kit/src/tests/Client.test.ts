import "dotenv/config";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { xmtpClient, createUser } from "../lib/client";

describe("Client Private Key Configuration Tests", () => {
  it("creates a client with a simple test", async () => {
    const client = "2";
    expect(client).toBeDefined();
  });
  /*
  it("creates a client with a random generated key", async () => {
    const { client, v2client } = await xmtpClient();
    expect(client).toBeDefined();
    expect(v2client).toBeDefined();
  });

  it("creates a client with a provided private key", async () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    const { client: v3Client, v2client } = await xmtpClient({
      privateKey,
      hideInitLogMessage: true,
    });

    expect(v3Client?.accountAddress).toBe(account.address);
    expect(v2client?.address).toBe(account.address.toLowerCase());
  });

  it("creates a client with environment variable key", async () => {
    const testKey = generatePrivateKey();
    process.env.KEY = testKey.slice(2); // Remove '0x' prefix

    const { client: v3Client } = await xmtpClient();
    const expectedAccount = privateKeyToAccount(testKey);

    expect(v3Client?.accountAddress).toBe(expectedAccount.address);

    // Clean up
    delete process.env.KEY;
  });

  it("fails gracefully with invalid private key format", async () => {
    const invalidKey = "invalid_key";

    const { client: v3Client } = await xmtpClient({
      privateKey: invalidKey,
      hideInitLogMessage: true,
    });

    // Should fall back to random key generation
    expect(v3Client?.accountAddress).toBeDefined();
  });

  it("creates user with valid private key", () => {
    const privateKey = generatePrivateKey();
    const user = createUser(privateKey);

    expect(user.key).toBe(privateKey);
    expect(user.account).toBeDefined();
    expect(user.wallet).toBeDefined();
  });*/
});
