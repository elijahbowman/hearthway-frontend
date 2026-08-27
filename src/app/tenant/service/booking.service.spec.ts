import {TestBed} from "@angular/core/testing";
import {provideHttpClient} from "@angular/common/http";
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {BookingService} from "./booking.service";
import {toApiDate} from "../../shared/date-range";

describe("BookingService", () => {
  let service: BookingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BookingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("sends booking dates as calendar days", () => {
    service.create({
      listingPublicId: "listing-1",
      startDate: new Date(2026, 9, 10, 0, 0),
      endDate: new Date(2026, 9, 12, 0, 0),
    });

    const request = http.expectOne(req => req.url.endsWith("/booking/create"));
    expect(request.request.body).toEqual({
      listingPublicId: "listing-1",
      startDate: "2026-10-10",
      endDate: "2026-10-12",
    });
    request.flush(true);
    expect(service.createBookingSig().status).toBe("OK");
  });

  it("keeps the booking id when a cancel fails", () => {
    service.cancel("booking-1", "listing-1", false);
    http.expectOne(req => req.url.endsWith("/booking/cancel"))
      .flush("not found", {status: 400, statusText: "Bad Request"});

    expect(service.cancelSig().status).toBe("ERROR");
    expect(service.cancelSig().value).toBe("booking-1");
  });

  it("parses booked dates as local days and can be reset", () => {
    service.checkAvailability("listing-1");
    http.expectOne(req => req.url.endsWith("/booking/check-availability"))
      .flush([{startDate: "2026-10-10", endDate: "2026-10-12"}]);

    const state = service.checkAvailabilitySig();
    expect(state.status).toBe("OK");
    expect(toApiDate(state.value![0].startDate.toDate())).toBe("2026-10-10");
    expect(toApiDate(state.value![0].endDate.toDate())).toBe("2026-10-12");

    service.resetCheckAvailability();
    expect(service.checkAvailabilitySig().status).toBe("INIT");
  });
});
