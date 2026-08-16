import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { dbSizeBytes } from "@/lib/backup";

export const dynamic = "force-dynamic";

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function fmtUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default async function AdminSystemPage() {
  await requireAdmin();

  const [sizeBytes, errorCount, recentErrors] = await Promise.all([
    dbSizeBytes(),
    db.errorEvent.count(),
    db.errorEvent.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const mem = process.memoryUsage();
  const info: [string, string][] = [
    ["Node version", process.version],
    ["Environment", process.env.NODE_ENV ?? "development"],
    ["Platform", `${process.platform} ${process.arch}`],
    ["Uptime", fmtUptime(process.uptime())],
    ["Memory (RSS)", fmtBytes(mem.rss)],
    ["Database size", fmtBytes(sizeBytes)],
    ["Recorded errors", String(errorCount)],
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-green-700 hover:underline">
          ← Back to admin
        </Link>
        <h1 className="mt-1 text-2xl font-bold">System</h1>
        <p className="text-sm text-gray-500">Runtime, database and error information.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {info.map(([label, value]) => (
          <div key={label} className="card p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 font-medium">{value}</div>
          </div>
        ))}
      </section>

      <section className="card p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Database backup
        </h2>
        <p className="text-sm text-gray-500">
          Download a copy of the SQLite database. The last 10 backups are kept on disk.
        </p>
        <a
          href="/api/admin/backup"
          className="btn mt-3 bg-green-800 text-white hover:bg-green-700"
        >
          Download backup
        </a>
      </section>

      <section className="card p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Recent errors
        </h2>
        {recentErrors.length === 0 ? (
          <p className="text-sm text-gray-500">No errors recorded.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentErrors.map((e) => (
              <li key={e.id} className="py-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-red-700">{e.message}</span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {e.source}
                    {e.path ? ` · ${e.path}` : ""} · {e.createdAt.toLocaleString()}
                  </span>
                </div>
                {e.stack && (
                  <pre className="mt-1 overflow-x-auto text-xs text-gray-400">{e.stack}</pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
