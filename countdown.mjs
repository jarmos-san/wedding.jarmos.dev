// Count to the start of the wedding date in India, not an unconfirmed ceremony time.
export const WEDDING_DAY = Date.parse("2026-12-13T00:00:00+05:30");

export const getCountdown = (now) => {
  const seconds = Math.max(0, Math.floor((WEDDING_DAY - now) / 1000));
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    complete: now >= WEDDING_DAY,
  };
};
