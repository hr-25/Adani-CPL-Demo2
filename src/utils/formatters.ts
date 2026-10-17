/**
 * Shared Points Formatting Utility for Adani CPL 2026 Auction Engine.
 * Formats numbers into standard comma-separated points representation without currency symbols.
 */

/**
 * Returns formatted number with commas (e.g. 50,000, 240,000, 1,000,000).
 */
export const formatPoints = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) {
    return '0';
  }
  return val.toLocaleString('en-US');
};

/**
 * Returns formatted number with 'Points' suffix (e.g. '50,000 Points', '240,000 Points').
 */
export const formatPointsWithLabel = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) {
    return '0 Points';
  }
  return `${formatPoints(val)} Points`;
};
