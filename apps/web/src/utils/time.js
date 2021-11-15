const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function timeConverter(timestamp, showSeconds = false) {
  if (!timestamp) return;
  var d = new Date(timestamp), // Convert the passed timestamp to milliseconds
    yyyy = d.getFullYear(),
    dd = ("0" + d.getDate()).slice(-2), // Add leading 0.
    hh = d.getHours(),
    h = hh,
    min = ("0" + d.getMinutes()).slice(-2), // Add leading 0.
    sec = ("0" + d.getSeconds()).slice(-2),
    ampm = "AM",
    time;

  if (hh > 12) {
    h = hh - 12;
    ampm = "PM";
  } else if (hh === 12) {
    h = 12;
    ampm = "PM";
  } else if (hh === 0) {
    h = 12;
  }

  // ie: 2013-02-18, 8:35 AM
  time =
    dd +
    " " +
    months[d.getMonth()] +
    ", " +
    yyyy +
    ", " +
    h +
    ":" +
    min +
    (showSeconds ? `:${sec}` : "") +
    " " +
    ampm;

  return time;
}