const blockedPatterns = [
  /\b\d{10}\b/,
  /\b(?:password|otp|one[- ]time password)\b/i,
  /\b(?:kill|bomb|gun)\b/i,
];

export function basicModeration(text: string) {
  const reasons = blockedPatterns.filter((r) => r.test(text)).map(String);
  return { flagged: reasons.length > 0, reasons };
}