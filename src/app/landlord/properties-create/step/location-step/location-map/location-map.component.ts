import {Component, effect, EventEmitter, inject, input, Output} from '@angular/core';
import {LeafletModule} from "@asymmetrik/ngx-leaflet";
import {FormsModule} from "@angular/forms";
import {AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent} from "primeng/autocomplete";
import {CountryService} from "../country.service";
import {ToastService} from "../../../../../layout/toast.service";
import {OpenStreetMapProvider} from "leaflet-geosearch";
import {Country} from "../country.model";
import L, {latLng, tileLayer} from "leaflet";

// OSM tile usage policy: no {s} subdomains, and attribution is mandatory.
const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [
    LeafletModule,
    FormsModule,
    AutoCompleteModule
  ],
  templateUrl: './location-map.component.html',
  styleUrl: './location-map.component.scss'
})
export class LocationMapComponent {

  countryService = inject(CountryService);
  toastService = inject(ToastService);

  private map: L.Map | undefined;
  private provider: OpenStreetMapProvider | undefined;
  private marker: L.Marker | undefined;

  location = input.required<string>();
  placeholder = input<string>("Select your home country");

  currentLocation: Country | undefined;

  @Output()
  locationChange = new EventEmitter<string>();

  formatLabel = (country: Country) => country.flag + "   " + country.name.common;

  options = {
    layers: [
      tileLayer(OSM_TILE_URL, {maxZoom: 18, attribution: OSM_ATTRIBUTION}),
    ],
    zoom: 2,
    center: latLng(20, 0)
  }

  countries: Array<Country> = [];
  filteredCountries: Array<Country> = [];


  constructor() {
    this.listenToLocation();
  }

  onMapReady(map: L.Map) {
    this.map = map;
    this.configSearchControl();
    if (this.countries.length > 0) {
      this.changeMapLocation(this.location());
    }
  }

  private configSearchControl() {
    this.provider = new OpenStreetMapProvider();
  }

  onLocationChange(newEvent: AutoCompleteSelectEvent) {
    const newCountry = newEvent.value as Country;
    this.locationChange.emit(newCountry.cca3);
  }

  private listenToLocation() {
    effect(() => {
      const countriesState = this.countryService.countries();
      if (countriesState.status === "OK" && countriesState.value) {
        this.countries = countriesState.value;
        this.filteredCountries = countriesState.value;
        this.changeMapLocation(this.location())
      } else if (countriesState.status === "ERROR") {
        this.toastService.send({
          severity: "error", summary: "Error",
          detail: "Something went wrong when loading countries on change location"
        });
      }
    });
  }

  private changeMapLocation(term: string) {
    this.currentLocation = this.countries.find(country => country.cca3 === term);
    // The countries effect can fire before leafletMapReady; onMapReady retries.
    if (this.currentLocation && this.map && this.provider) {
      const map = this.map;
      this.provider.search({query: this.currentLocation.name.common})
        .then((results) => {
          if (results && results.length > 0) {
            const firstResult = results[0];
            const position = new L.LatLng(firstResult.y, firstResult.x);
            map.setView(position, 13);
            this.marker?.remove();
            this.marker = L.marker(position)
              .addTo(map)
              .bindPopup(firstResult.label)
              .openPopup();
          }
        })
    }
  }

  search(newCompleteEvent: AutoCompleteCompleteEvent): void {
    const query = newCompleteEvent.query.toLowerCase();
    this.filteredCountries =
      this.countries.filter(country => country.name.common.toLowerCase().startsWith(query))
  }
}
