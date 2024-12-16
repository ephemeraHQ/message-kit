import { checkStorage, getFS } from "../helpers/utils";
import path from "path";

const { fsPromises } = getFS();

export class LocalStorage {
  private baseDir: string;

  constructor(baseDir: string = ".data/wallets") {
    if (process.env.RAILWAY_VOLUME_MOUNT_PATH !== undefined) {
      this.baseDir = path.join(
        process.env.RAILWAY_VOLUME_MOUNT_PATH as string,
        baseDir,
      );
      if (process.env.MSG_LOG === "true")
        console.log("Railway detected - Using absolute path:", this.baseDir);
    } else {
      this.baseDir = baseDir;
      if (process.env.MSG_LOG === "true")
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
      const walletFiles = await fsPromises?.readdir(this.baseDir);
      return walletFiles?.length || 0;
    } catch (error) {
      console.log("Error reading directory:", error);
      return 0;
    }
  }
}
