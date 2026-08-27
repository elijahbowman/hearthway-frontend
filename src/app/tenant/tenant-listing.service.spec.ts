import {TestBed} from "@angular/core/testing";
import {provideHttpClient} from "@angular/common/http";
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {TenantListingService} from "./tenant-listing.service";

describe("TenantListingService.searchListing", () => {
  let service: TenantListingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TenantListingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("sends search dates as calendar days and passes pagination", () => {
    service.searchListing({
      location: "FRA",
      dates: {startDate: new Date(2026, 9, 10), endDate: new Date(2026, 9, 12)},
      infos: {
        guests: {value: 2},
        bedrooms: {value: 0},
        beds: {value: 0},
        baths: {value: 0},
      },
    }, {page: 0, size: 20, sort: []});

    const request = http.expectOne(req => req.url.endsWith("/tenant-listing/search"));
    expect(request.request.body.dates).toEqual({startDate: "2026-10-10", endDate: "2026-10-12"});
    expect(request.request.body.location).toBe("FRA");
    expect(request.request.params.get("page")).toBe("0");
    expect(request.request.params.get("size")).toBe("20");
    request.flush({content: []});
  });
});
