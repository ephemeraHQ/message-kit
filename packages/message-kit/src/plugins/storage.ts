import { checkStorage, getFS } from "../helpers/utils";
import path from "path";

const { fsPromises } = getFS();

export class LocalStorage {
  private baseDir: string;

  constructor(baseDir: string = ".data/wallets") {
    if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
      this.baseDir = path.join("/app/data/", baseDir);
      console.log("Railway detected - Using absolute path:", this.baseDir);
    } else {
      this.baseDir = baseDir;
      console.log("Local development - Using relative path:", this.baseDir);
    }
  }

  private async ensureDir(): Promise<boolean> {
    if (!fsPromises) {
      console.error("Filesystem not available");
      throw new Error("Filesystem is not available");
    }

    try {
      await fsPromises.mkdir(this.baseDir, {
        recursive: true,
        mode: 0o755,
      });

      const testFile = path.join(this.baseDir, "test.txt");
      await fsPromises.writeFile(testFile, "test");
      await fsPromises.unlink(testFile);

      console.log("Storage directory ready:", this.baseDir);
      return true;
    } catch (error) {
      console.error("Storage directory error:", error);
      throw new Error(`Failed to create/write to directory: ${error}`);
    }
  }

  async set(key: string, value: string): Promise<void> {
    const ensureDir = await this.ensureDir();
    if (!ensureDir) {
      throw new Error(
        "Failed to ensure directory - filesystem may not be available",
      );
    }

    try {
      const filePath = path.join(this.baseDir, `${key.toLowerCase()}.dat`);
      await fsPromises?.writeFile(filePath, value, "utf8");
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  async get(key: string): Promise<string | undefined> {
    try {
      const filePath = path.join(this.baseDir, `${key.toLowerCase()}.dat`);
      return (await fsPromises?.readFile(filePath, "utf8")) ?? undefined;
    } catch (error) {
      return undefined;
    }
  }

  async del(key: string): Promise<void> {
    try {
      const filePath = path.join(this.baseDir, `${key.toLowerCase()}.dat`);
      await fsPromises?.unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }

  async getWalletCount(): Promise<number> {
    try {
      await checkStorage();

      const files = await fsPromises?.readdir(this.baseDir);
      console.log("Storage directory:", this.baseDir);
      console.log("All files:", files);
      const walletFiles = files?.filter((file) => file.endsWith(".dat"));
      console.log("Wallet files:", walletFiles?.length);
      return walletFiles?.length || 0;
    } catch (error) {
      console.log("Error reading directory:", error);
      return 0;
    }
  }
}
