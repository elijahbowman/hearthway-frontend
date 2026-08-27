import {TestBed} from "@angular/core/testing";
import {provideHttpClient} from "@angular/common/http";
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {LandlordListingService} from "./landlord-listing.service";

describe("LandlordListingService", () => {
  let service: LandlordListingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LandlordListingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("reports a failed delete on the delete state, with the listing's id", () => {
    service.delete("listing-1");
    http.expectOne(req => req.url.endsWith("/landlord-listing/delete"))
      .flush("forbidden", {status: 403, statusText: "Forbidden"});

    expect(service.deleteSig().status).toBe("ERROR");
    expect(service.deleteSig().value).toBe("listing-1");
    // Regression: errors used to be written to the create state.
    expect(service.createSig().status).toBe("INIT");
  });

  it("reports a failed fetch on the get-all state", () => {
    service.getAll();
    http.expectOne(req => req.url.endsWith("/landlord-listing/get-all"))
      .flush("error", {status: 500, statusText: "Server Error"});

    expect(service.getAllSig().status).toBe("ERROR");
    expect(service.createSig().status).toBe("INIT");
  });

  it("clears the last delete result on reset", () => {
    service.delete("listing-1");
    http.expectOne(req => req.url.endsWith("/landlord-listing/delete")).flush("listing-1");
    expect(service.deleteSig().status).toBe("OK");

    service.resetDelete();

    expect(service.deleteSig().status).toBe("INIT");
  });
});
