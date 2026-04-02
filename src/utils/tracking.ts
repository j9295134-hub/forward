export const normalizeTrackingId = (value: string): string =>
  value.trim().replace(/\s+/g, '').toUpperCase();
