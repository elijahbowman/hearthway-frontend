import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Country} from "./country.model";
import {State} from "../../../../core/model/state.model";
import {catchError, filter, map, Observable, of, shareReplay, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  http = inject(HttpClient);

  private countries$: WritableSignal<State<Array<Country>>> =
    signal(State.Builder<Array<Country>>().forInit());
  countries = computed(() => this.countries$());

  private fetchCountry$ = new Observable<Array<Country>>();

  constructor() {
    this.initFetchGetAllCountries();
    this.fetchCountry$.subscribe();
  }

  initFetchGetAllCountries(): void {
    this.fetchCountry$ = this.http.get<Array<Country>>("/assets/countries.json")
      .pipe(
        tap(countries =>
          this.countries$.set(State.Builder<Array<Country>>().forSuccess(countries))),
        catchError(err => {
          this.countries$.set(State.Builder<Array<Country>>().forError(err));
          // Keep the stream an array: getCountryByCode() subscribers expect one.
          return of(new Array<Country>());
        }),
        shareReplay(1)
      );
  }

  /** Emits the matching country; emits nothing if it's unknown or the list failed to load. */
  public getCountryByCode(code: string): Observable<Country> {
    return this.fetchCountry$.pipe(
      map(countries => countries.find(country => country.cca3 === code)),
      filter((country): country is Country => country !== undefined)
    );
  }
}
