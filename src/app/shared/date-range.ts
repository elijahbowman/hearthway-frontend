import dayjs, {Dayjs} from "dayjs";

/**
 * True when both dates are set and check-out falls on a later calendar day
 * than check-in (a stay of at least one night).
 */
export function isValidStayRange(dates: Array<Date | null> | null | undefined): dates is [Date, Date] {
  return !!dates
    && dates.length === 2
    && !!dates[0]
    && !!dates[1]
    && dayjs(dates[0]).isBefore(dates[1], "day");
}

/**
 * The nights of a stay: every day from check-in up to, but not including,
 * check-out. The check-out day itself stays free for the next guest.
 */
export function nightsOfStay(checkIn: Dayjs, checkOut: Dayjs): Array<Date> {
  const nights = new Array<Date>();
  let night = checkIn.startOf("day");
  while (night.isBefore(checkOut, "day")) {
    nights.push(night.toDate());
    night = night.add(1, "day");
  }
  return nights;
}

/**
 * The API exchanges calendar days as YYYY-MM-DD. Formatting the local date avoids
 * JSON.stringify(Date), which sends a UTC instant and shifts the day for users
 * east of UTC.
 */
export function toApiDate(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}

/**
 * True when any of the given nights falls inside [checkIn, checkOut).
 */
export function stayIncludesAnyNight(checkIn: Date, checkOut: Date, nights: Array<Date>): boolean {
  const start = dayjs(checkIn);
  const end = dayjs(checkOut);
  return nights.some(night => !dayjs(night).isBefore(start, "day") && dayjs(night).isBefore(end, "day"));
}
