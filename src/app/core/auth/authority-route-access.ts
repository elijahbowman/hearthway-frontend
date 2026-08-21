import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from "@angular/router";
import {inject} from "@angular/core";
import {AuthService} from "./auth.service";
import {catchError, map, of} from "rxjs";

export const authorityRouteAccess: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  return authService.fetchHttpUser(false).pipe(
    map(connectedUser => {
      const authorities = next.data['authorities'];
      // Check the user that was just fetched, not the cached signal, which is
      // still NOT_CONNECTED on a deep link or page refresh.
      return !authorities || authorities.length === 0
        || authService.hasAnyAuthority(authorities, connectedUser);
    }),
    catchError(() => {
      authService.login();
      return of(false);
    })
  );
}
