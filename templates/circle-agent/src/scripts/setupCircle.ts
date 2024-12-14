import {
  registerEntitySecretCiphertext,
  initiateDeveloperControlledWalletsClient,
} from "@circle-fin/developer-controlled-wallets";
import crypto from "crypto";
import { config } from "dotenv";
import * as fs from "fs";
import { fileURLToPath } from "url";

const isMainModule = import.meta.url === `file://${process.argv[1]}`;

async function setupEntitySecret() {
  try {
    // Check if entity secret exists
    if (!process.env.CIRCLE_ENTITY_SECRET) {
      // Generate new entity secret
      const entitySecret = crypto.randomBytes(32).toString("hex");

      // Register with Circle
      const response = await registerEntitySecretCiphertext({
        apiKey: process.env.CIRCLE_API_KEY as string,
        entitySecret,
      });

      if (!response?.data?.recoveryFile) {
        throw new Error("Failed to get recovery file from response");
      }

      // Save to .env
      fs.appendFileSync(".env", `\nCIRCLE_ENTITY_SECRET=${entitySecret}`);

      // Save recovery file
      fs.writeFileSync("circle-recovery.dat", response.data.recoveryFile);

      console.log("✅ Entity secret registered and saved to .env");
      console.log("📄 Recovery file saved to circle-recovery.dat");
      return entitySecret;
    }

    return process.env.CIRCLE_ENTITY_SECRET;
  } catch (error) {
    console.error("Error setting up entity secret:", error);
    throw error;
  }
}

async function createWalletSet(name: string) {
  try {
    const client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY as string,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET as string,
    });

    const walletSetResponse = await client.createWalletSet({ name });
    console.log("✅ Wallet set created:", walletSetResponse);
    return walletSetResponse.data?.walletSet?.id;
  } catch (error) {
    console.error("Error creating wallet set:", error);
    throw error;
  }
}

if (isMainModule) {
  config();
  setupEntitySecret().then(async () => {
    // Wait 2 seconds after entity secret setup
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (!process.env.CIRCLE_WALLET_SET_ID) {
      const walletSetId = await createWalletSet("Default Wallet Set");
      fs.appendFileSync(".env", `\nCIRCLE_WALLET_SET_ID=${walletSetId}`);
    }
  });
}

export { setupEntitySecret, createWalletSet };
