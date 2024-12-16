import { getFS } from "../helpers/utils";
import path from "path";

const { fsPromises } = getFS();

export class LocalStorage {
  private baseDir: string;

  constructor(baseDir: string = "wallets") {
    baseDir = baseDir
      .replace("/.data/", "")
      .replace(".data/", "")
      .replace("/" + baseDir, baseDir.replace("/", ""));
    this.baseDir = ".data/" + baseDir;
  }

  private async ensureDir(): Promise<boolean> {
    if (!fsPromises) {
      throw new Error("Filesystem is not available");
    }

    try {
      await fsPromises.mkdir(this.baseDir, { recursive: true });
      return true;
    } catch (error) {
      throw new Error(`Failed to create directory: ${error}`);
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
      console.log("Storage directory:", process.env.RAILWAY_VOLUME_MOUNT_PATH);
      const filesRoot = await fsPromises?.readdir("/");
      console.log("Storage directory:", "/");
      console.log("All files:", filesRoot);
      const filesRoot2 = await fsPromises?.readdir("/app");
      console.log("Storage directory:", "/app");
      console.log("All files:", filesRoot2);
      const filesRoot3 = await fsPromises?.readdir("/app/.data");
      console.log("Storage directory:", "/app/.data");
      console.log("All files:", filesRoot3);

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
