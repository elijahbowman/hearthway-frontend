import dayjs from "dayjs";
import {isValidStayRange, nightsOfStay, stayIncludesAnyNight, toApiDate} from "./date-range";

// Local dates (month is 0-based), as the PrimeNG calendar produces them.
const day = (year: number, month: number, date: number) => new Date(year, month, date);

describe("isValidStayRange", () => {
  it("rejects missing or incomplete selections", () => {
    expect(isValidStayRange(null)).toBeFalse();
    expect(isValidStayRange(undefined)).toBeFalse();
    expect(isValidStayRange([])).toBeFalse();
    expect(isValidStayRange([day(2026, 9, 10)])).toBeFalse();
    expect(isValidStayRange([day(2026, 9, 10), null])).toBeFalse();
  });

  it("rejects a zero-night stay, even with different times of day", () => {
    expect(isValidStayRange([day(2026, 9, 10), day(2026, 9, 10)])).toBeFalse();
    expect(isValidStayRange([new Date(2026, 9, 10, 8), new Date(2026, 9, 10, 20)])).toBeFalse();
  });

  it("rejects check-out before check-in", () => {
    expect(isValidStayRange([day(2026, 9, 12), day(2026, 9, 10)])).toBeFalse();
  });

  it("accepts a one-night stay", () => {
    expect(isValidStayRange([day(2026, 9, 10), day(2026, 9, 11)])).toBeTrue();
  });

  it("accepts stays across months that share a day of the month", () => {
    // Regression: getDate() comparison rejected Jan 5 -> Feb 5.
    expect(isValidStayRange([day(2026, 0, 5), day(2026, 1, 5)])).toBeTrue();
  });
});

describe("nightsOfStay", () => {
  it("lists every night from check-in up to, not including, check-out", () => {
    const nights = nightsOfStay(dayjs(day(2026, 9, 10)), dayjs(day(2026, 9, 13)));
    expect(nights.map(toApiDate)).toEqual(["2026-10-10", "2026-10-11", "2026-10-12"]);
  });

  it("returns no nights for a zero-length stay", () => {
    expect(nightsOfStay(dayjs(day(2026, 9, 10)), dayjs(day(2026, 9, 10)))).toEqual([]);
  });

  it("spans month and year boundaries", () => {
    const nights = nightsOfStay(dayjs(day(2026, 11, 30)), dayjs(day(2027, 0, 2)));
    expect(nights.map(toApiDate)).toEqual(["2026-12-30", "2026-12-31", "2027-01-01"]);
  });
});

describe("stayIncludesAnyNight", () => {
  const bookedNights = [day(2026, 9, 12), day(2026, 9, 13)];

  it("detects a booked night inside the stay", () => {
    expect(stayIncludesAnyNight(day(2026, 9, 11), day(2026, 9, 14), bookedNights)).toBeTrue();
  });

  it("counts the check-in night", () => {
    expect(stayIncludesAnyNight(day(2026, 9, 13), day(2026, 9, 15), bookedNights)).toBeTrue();
  });

  it("allows checking out on the day a booked stay begins", () => {
    expect(stayIncludesAnyNight(day(2026, 9, 10), day(2026, 9, 12), bookedNights)).toBeFalse();
  });

  it("allows checking in the day after the last booked night", () => {
    expect(stayIncludesAnyNight(day(2026, 9, 14), day(2026, 9, 16), bookedNights)).toBeFalse();
  });
});

describe("toApiDate", () => {
  it("formats the local calendar day, whatever the time", () => {
    // Late evening would become the next day as a UTC instant in UTC-x zones,
    // and early morning the previous day in UTC+x zones.
    expect(toApiDate(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
    expect(toApiDate(new Date(2026, 0, 5, 0, 15))).toBe("2026-01-05");
  });
});
