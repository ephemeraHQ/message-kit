import dotenv from "dotenv";
dotenv.config();
import {
  encrypt,
  decrypt,
  PublicKeyBundle,
  Client,
  SignedPublicKeyBundle,
  PrivateKeyBundleV2,
} from "@xmtp/xmtp-js";
import { Wallet } from "ethers";
import { expect, test } from "vitest";

const bobWallet = new Wallet(
  "0xe2b6e208b7884d49e4436fda7c0421a15111f285987ca598a795420faf607329",
);

const aliceWallet = new Wallet(process.env.KEY as string);

// Helper to get someone's public key bundle from the network
async function getNetworkPublicKeyBundle(
  wallet: Wallet,
  contactAddress: string,
): Promise<PublicKeyBundle | undefined> {
  const client = await Client.create(wallet, { env: "production" });
  let contact = await client.getUserContact(contactAddress);
  if (!contact) return undefined;
  if ("getPublicKeyBundle" in contact) {
    contact = (contact as SignedPublicKeyBundle).toLegacyBundle();
  }
  return contact as PublicKeyBundle;
}

test("bob and alice can encrypt and decrypt messages between them", async () => {
  try {
    const alice = await PrivateKeyBundleV2.generate(aliceWallet);
    const alicePublic = alice.getPublicKeyBundle();

    const bob = await PrivateKeyBundleV2.generate(bobWallet);
    const bobPublic = bob.getPublicKeyBundle();

    const encryptSecret = await alice.sharedSecret(
      bobPublic,
      alicePublic.preKey,
      false,
    );

    const message = new TextEncoder().encode("Hello XMTP!");
    const encryptedMessage = await encrypt(message, encryptSecret);

    const decryptSecret = await bob.sharedSecret(
      alicePublic,
      bobPublic.preKey,
      true,
    );
    const decryptedMessage = await decrypt(encryptedMessage, decryptSecret);
    const msg2 = new TextDecoder().decode(decryptedMessage);
    expect(msg2).toEqual("Hello XMTP!");
    console.log("Decrypted Message:", msg2);
  } catch (error) {
    console.error("Error during encryption/decryption:", error);
  }
});
