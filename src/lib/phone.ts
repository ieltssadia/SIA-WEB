/**
 * Normalize any BD mobile input (+8801XXXXXXXXX, 8801XXXXXXXXX,
 * 01XXXXXXXXX, 1XXXXXXXXX) to the canonical "01XXXXXXXXX" form.
 */
export function canonicalPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880")) digits = "0" + digits.slice(3);
  if (!digits.startsWith("0") && digits.length === 10) digits = "0" + digits;
  return digits;
}
