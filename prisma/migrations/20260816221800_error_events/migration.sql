-- CreateTable
CREATE TABLE "ErrorEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "source" TEXT NOT NULL DEFAULT 'client',
    "path" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ErrorEvent_createdAt_idx" ON "ErrorEvent"("createdAt");
