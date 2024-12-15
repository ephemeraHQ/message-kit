import { getFS } from "../helpers/utils";
import path from "path";

const { fsPromises } = getFS();

export class LocalStorage {
  private baseDir: string;

  constructor(baseDir: string = ".data/wallet-storage") {
    this.baseDir = baseDir;
  }

  private async ensureDir() {
    if (!fsPromises) return;
    await fsPromises.mkdir(this.baseDir, { recursive: true });
  }

  async set(key: string, value: string): Promise<void> {
    await this.ensureDir();
    const filePath = path.join(this.baseDir, `${key}.dat`);
    await fsPromises?.writeFile(filePath, value, "utf8");
  }

  async get(key: string): Promise<string | undefined> {
    try {
      const filePath = path.join(this.baseDir, `${key}.dat`);
      return (await fsPromises?.readFile(filePath, "utf8")) ?? undefined;
    } catch (error) {
      return undefined;
    }
  }

  async del(key: string): Promise<void> {
    try {
      const filePath = path.join(this.baseDir, `${key}.dat`);
      await fsPromises?.unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }
}
