import { getFS } from "../helpers/utils";
import path from "path";

const { fsPromises } = getFS();

export class LocalStorage {
  private baseDir: string;

  constructor(baseDir: string = ".data/wallet-storage") {
    this.baseDir = baseDir;
  }

  private async ensureDir() {
    if (!fsPromises) return undefined;
    await fsPromises.mkdir(this.baseDir, { recursive: true });
    return true;
  }

  async set(key: string, value: string): Promise<void> {
    const ensureDir = await this.ensureDir();
    if (ensureDir === undefined) {
      const filePath = path.join(this.baseDir, `${key.toLowerCase()}.dat`);
      await fsPromises?.writeFile(filePath, value, "utf8");
    } else {
      console.error("Failed to ensure directory");
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
      const files = await fsPromises?.readdir(this.baseDir);
      const walletFiles = files?.filter(
        (file) => file.endsWith(".dat") && /^[0-9a-f]{40}\.dat$/i.test(file),
      );
      console.log("walletFiles", walletFiles?.length);
      return walletFiles?.length || 0;
    } catch {
      return 0;
    }
  }
}
