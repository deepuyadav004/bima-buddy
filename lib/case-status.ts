/**
 * Returns days remaining until expiry (negative if already expired).
 */
export function daysUntilExpiry(expiresAt: Date | string): number {
  const expiry = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const diffMs = expiry.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function isExpired(expiresAt: Date | string): boolean {
  return daysUntilExpiry(expiresAt) <= 0;
}

export function formatExpiryLabel(expiresAt: Date | string): string {
  const days = daysUntilExpiry(expiresAt);
  if (days <= 0) return "Expired";
  if (days === 1) return "Expires tomorrow";
  if (days <= 7) return `Expires in ${days} days`;
  return `Expires in ${days} days`;
}

export const CASE_EXPIRY_DAYS = 30;
