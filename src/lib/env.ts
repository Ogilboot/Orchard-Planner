let validated = false;

// Validates required environment configuration and fails fast with a clear
// message rather than surfacing a confusing error later at runtime.
export function validateEnv(): void {
  if (validated) return;

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and configure it.",
    );
  }

  if (process.env.NODE_ENV === "production") {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error(
        "NEXTAUTH_SECRET must be a 32+ character random string in production.",
      );
    }
  }

  validated = true;
}
