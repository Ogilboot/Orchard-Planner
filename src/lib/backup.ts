import { copyFile, mkdir, readdir, stat, unlink } from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "prisma", "dev.db");
const BACKUP_DIR = path.join(process.cwd(), "backups");
const MAX_BACKUPS = 10;

export async function dbSizeBytes(): Promise<number> {
  try {
    return (await stat(DB_PATH)).size;
  } catch {
    return 0;
  }
}

async function rotateBackups(): Promise<void> {
  const files = (await readdir(BACKUP_DIR))
    .filter((f) => f.endsWith(".db"))
    .sort();
  const excess = files.slice(0, Math.max(0, files.length - MAX_BACKUPS));
  for (const f of excess) {
    await unlink(path.join(BACKUP_DIR, f)).catch(() => {});
  }
}

export async function createBackup(): Promise<{ filename: string; size: number }> {
  await mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `orchard-${stamp}.db`;
  await copyFile(DB_PATH, path.join(BACKUP_DIR, filename));
  await rotateBackups();
  const size = (await stat(path.join(BACKUP_DIR, filename))).size;
  return { filename, size };
}
