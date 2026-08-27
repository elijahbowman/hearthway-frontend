import {TestBed} from "@angular/core/testing";
import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import {provideLocationMocks} from "@angular/common/testing";
import {AuthService} from "./auth.service";

describe("AuthService.hasAnyAuthority", () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideLocationMocks()],
    });
    authService = TestBed.inject(AuthService);
  });

  it("is false while the cached user is not connected", () => {
    expect(authService.hasAnyAuthority("ROLE_LANDLORD")).toBeFalse();
  });

  it("checks the given user when one is passed", () => {
    const landlord = {email: "landlord@test.dev", authorities: ["ROLE_TENANT", "ROLE_LANDLORD"]};
    const tenant = {email: "tenant@test.dev", authorities: ["ROLE_TENANT"]};

    expect(authService.hasAnyAuthority("ROLE_LANDLORD", landlord)).toBeTrue();
    expect(authService.hasAnyAuthority(["ROLE_ADMIN", "ROLE_LANDLORD"], landlord)).toBeTrue();
    expect(authService.hasAnyAuthority("ROLE_LANDLORD", tenant)).toBeFalse();
  });

  it("is false, not an error, for a user without authorities", () => {
    expect(authService.hasAnyAuthority("ROLE_LANDLORD", {email: "new@test.dev"})).toBeFalse();
  });

  it("is false for the not-connected placeholder user", () => {
    expect(authService.hasAnyAuthority("ROLE_LANDLORD", {email: authService.notConnected})).toBeFalse();
  });
});
