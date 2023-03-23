/**
  * Returns the relative time since cast was posted
  * Eg: 5 months ago, 1 second ago, two weeks ago
  * */
export function getRelativeTime(castDate: Date) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const now = new Date();
  const diffMs = now.getTime() - castDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (Math.abs(diffSeconds) < 60) {
    return rtf.format(-diffSeconds, 'second');
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(-diffMinutes, 'minute');
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(-diffHours, 'hour');
  }

  const diffDays = Math.floor(diffHours / 24);
  if (Math.abs(diffDays) < 7) {
    return rtf.format(-diffDays, 'day');
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (Math.abs(diffWeeks) < 4) {
    return rtf.format(-diffWeeks, 'week');
  }

  const diffMonths = Math.floor(diffWeeks / 4);
  return rtf.format(-diffMonths, 'month');
}
