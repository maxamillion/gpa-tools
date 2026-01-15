/**
 * Data Formatting Utilities
 * Provides consistent formatting for display
 */

export function formatNumber(value, decimals = null) {
  if (decimals !== null) {
    value = Number(value.toFixed(decimals));
  }
  return value.toLocaleString('en-US');
}

export function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDuration(days) {
  if (days >= 14) {
    const weeks = Math.round(days / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }

  if (days >= 1) {
    const rounded = Math.round(days);
    return `${rounded} ${rounded === 1 ? 'day' : 'days'}`;
  }

  const hours = Math.round(days * 24);
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
}

export function formatPercentage(value, decimals = 1) {
  const formatted = value.toFixed(decimals);
  // Remove unnecessary trailing zeros and decimal point
  return `${parseFloat(formatted)}%`;
}
