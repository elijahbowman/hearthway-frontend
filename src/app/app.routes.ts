import {Routes} from '@angular/router';
import {authorityRouteAccess} from "./core/auth/authority-route-access";
import {HomeComponent} from "./home/home.component";

// Home is the landing page and stays in the initial bundle; every other page
// is lazy-loaded so its dependencies (calendar, dialogs, etc.) download on demand.
export const routes: Routes = [
  {
    path: 'landlord/properties',
    loadComponent: () => import("./landlord/properties/properties.component")
      .then(m => m.PropertiesComponent),
    canActivate: [authorityRouteAccess],
    data: {
      authorities: ["ROLE_LANDLORD"]
    }
  },
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'listing',
    loadComponent: () => import("./tenant/display-listing/display-listing.component")
      .then(m => m.DisplayListingComponent)
  },
  {
    path: "booking",
    loadComponent: () => import("./tenant/booked-listing/booked-listing.component")
      .then(m => m.BookedListingComponent)
  },
  {
    path: "landlord/reservation",
    loadComponent: () => import("./landlord/reservation/reservation.component")
      .then(m => m.ReservationComponent),
    canActivate: [authorityRouteAccess],
    data: {
      authorities: ["ROLE_LANDLORD"]
    }
  }
];
