/**
 * Lightweight retry wrapper for database queries.
 * Handles transient Neon serverless HTTP errors (cold starts, network blips).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 2, baseDelay = 200 } = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(
          `[db-retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
          err instanceof Error ? err.message : err,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
