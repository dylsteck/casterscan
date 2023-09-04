/**
 * Returns the formatted time in the local timezone with dynamic offset
 */
export function getRelativeTime(timestamp: number) {
  const utcDate = new Date(timestamp);

  const offsetMinutes = utcDate.getTimezoneOffset();

  // Calculate the local timestamp by subtracting the offset
  const localTimestamp = timestamp - offsetMinutes * 60 * 1000;

  const localDate = new Date(localTimestamp);

  // Calculate differences for time intervals
  const now = new Date();
  const timeDifferenceMs = now.getTime() - localDate.getTime();
  const timeDifferenceMinutes = Math.floor(timeDifferenceMs / (60 * 1000));
  const timeDifferenceHours = Math.floor(timeDifferenceMinutes / 60);
  const timeDifferenceDays = Math.floor(timeDifferenceHours / 24);
  const timeDifferenceWeeks = Math.floor(timeDifferenceDays / 7);
  const timeDifferenceMonths = Math.floor(timeDifferenceDays / 30);
  const timeDifferenceYears = Math.floor(timeDifferenceDays / 365);

  if (timeDifferenceMinutes < 1) {
    return "just now";
  } else if (timeDifferenceMinutes < 60) {
    return `${timeDifferenceMinutes} min${timeDifferenceMinutes === 1 ? '' : 's'} ago`;
  } else if (timeDifferenceHours < 24) {
    return `${timeDifferenceHours} hour${timeDifferenceHours === 1 ? '' : 's'} ago`;
  } else if (timeDifferenceDays < 7) {
    return `${timeDifferenceDays} day${timeDifferenceDays === 1 ? '' : 's'} ago`;
  } else if (timeDifferenceWeeks < 4) {
    return `${timeDifferenceWeeks} week${timeDifferenceWeeks === 1 ? '' : 's'} ago`;
  } else if (timeDifferenceMonths < 12) {
    return `${timeDifferenceMonths} month${timeDifferenceMonths === 1 ? '' : 's'} ago`;
  } else {
    return `${timeDifferenceYears} year${timeDifferenceYears === 1 ? '' : 's'} ago`;
  }
}