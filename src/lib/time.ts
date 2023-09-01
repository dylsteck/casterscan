import moment from 'moment-timezone';

/**
  * Returns the relative time since cast was posted
  * Eg: 5 months ago, 1 second ago, two weeks ago
  * */


// WIP: resolve local timezone(following all docs but it won't cooperate)
// current function below resolves time into UTC
export function getRelativeTime(timestamp: number) {
  const momentTimestampUTC = moment.utc(timestamp);
  const localTimeZone = moment.tz.guess(true);
  const momentTimestamp = momentTimestampUTC.tz(localTimeZone);
  const timeZoneAbbr = momentTimestamp.format('z');

  momentTimestamp.tz(localTimeZone);
  const formattedTime = momentTimestamp.calendar()

  return formattedTime;
}