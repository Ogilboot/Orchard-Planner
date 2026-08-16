import { copyFile, mkdir, readdir, stat, unlink } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = path.join(root, "prisma", "dev.db");
const backupDir = path.join(root, "backups");
const MAX_BACKUPS = 10;

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = `orchard-${stamp}.db`;

await mkdir(backupDir, { recursive: true });
await copyFile(dbPath, path.join(backupDir, filename));

const files = (await readdir(backupDir)).filter((f) => f.endsWith(".db")).sort();
for (const f of files.slice(0, Math.max(0, files.length - MAX_BACKUPS))) {
  await unlink(path.join(backupDir, f)).catch(() => {});
}

const { size } = await stat(path.join(backupDir, filename));
console.log(`Backed up to backups/${filename} (${size} bytes)`);
