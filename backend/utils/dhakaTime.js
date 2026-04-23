const DHAKA_TIMEZONE = 'Asia/Dhaka';

function getDhakaDateTimeParts(date = new Date()) {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DHAKA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const timeParts = new Intl.DateTimeFormat('en-US', {
    timeZone: DHAKA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).formatToParts(date);

  const hour24Parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DHAKA_TIMEZONE,
    hour: '2-digit',
    hour12: false
  }).formatToParts(date);

  const get = (parts, type) => parts.find((part) => part.type === type)?.value || '';

  return {
    date: `${get(dateParts, 'year')}-${get(dateParts, 'month')}-${get(dateParts, 'day')}`,
    time: `${get(timeParts, 'hour')}:${get(timeParts, 'minute')}:${get(timeParts, 'second')} ${get(timeParts, 'dayPeriod')}`,
    hour: Number(get(hour24Parts, 'hour'))
  };
}

function getDhakaDateString(date = new Date()) {
  return getDhakaDateTimeParts(date).date;
}

module.exports = {
  getDhakaDateTimeParts,
  getDhakaDateString
};
