export function e2ePort(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Le port E2E doit être un entier entre 1 et 65535.");
  }
  return port;
}
