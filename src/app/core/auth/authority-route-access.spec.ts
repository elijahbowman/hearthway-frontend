import {TestBed} from "@angular/core/testing";
import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import {provideLocationMocks} from "@angular/common/testing";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Observable, of, throwError} from "rxjs";
import {AuthService} from "./auth.service";
import {authorityRouteAccess} from "./authority-route-access";
import {User} from "../model/user.model";

describe("authorityRouteAccess", () => {
  let authService: AuthService;

  const routeRequiring = (authorities: string[]) =>
    ({data: {authorities}}) as unknown as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  const runGuard = (route: ActivatedRouteSnapshot): Promise<boolean> =>
    new Promise(resolve => {
      const result = TestBed.runInInjectionContext(() => authorityRouteAccess(route, state));
      (result as Observable<boolean>).subscribe(resolve);
    });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideLocationMocks()],
    });
    authService = TestBed.inject(AuthService);
    spyOn(authService, "login");
  });

  it("lets a landlord in on a fresh page load, before the cached user is set", async () => {
    // Regression: the guard checked the cached signal, still NOT_CONNECTED here.
    const landlord: User = {email: "landlord@test.dev", authorities: ["ROLE_LANDLORD"]};
    spyOn(authService, "fetchHttpUser").and.returnValue(of(landlord));

    expect(await runGuard(routeRequiring(["ROLE_LANDLORD"]))).toBeTrue();
  });

  it("denies a user without the required role", async () => {
    const tenant: User = {email: "tenant@test.dev", authorities: ["ROLE_TENANT"]};
    spyOn(authService, "fetchHttpUser").and.returnValue(of(tenant));

    expect(await runGuard(routeRequiring(["ROLE_LANDLORD"]))).toBeFalse();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("allows any logged-in user when no role is required", async () => {
    spyOn(authService, "fetchHttpUser").and.returnValue(of({email: "tenant@test.dev"}));

    expect(await runGuard(routeRequiring([]))).toBeTrue();
  });

  it("starts the login flow when the user can't be fetched", async () => {
    spyOn(authService, "fetchHttpUser").and.returnValue(throwError(() => new Error("not logged in")));

    expect(await runGuard(routeRequiring(["ROLE_LANDLORD"]))).toBeFalse();
    expect(authService.login).toHaveBeenCalled();
  });
});
