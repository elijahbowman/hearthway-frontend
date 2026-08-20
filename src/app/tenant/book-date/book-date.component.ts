import {Component, effect, inject, input, OnDestroy, OnInit, untracked} from '@angular/core';
import {Listing} from "../../landlord/model/listing.model";
import {BookingService} from "../service/booking.service";
import {ToastService} from "../../layout/toast.service";
import {AuthService} from "../../core/auth/auth.service";
import {Router} from "@angular/router";
import dayjs from "dayjs";
import {BookedDatesDTOFromClient, CreateBooking} from "../model/booking.model";
import {CurrencyPipe} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {FormsModule} from "@angular/forms";
import {MessageModule} from "primeng/message";
import {isValidStayRange, nightsOfStay, stayIncludesAnyNight} from "../../shared/date-range";

@Component({
  selector: 'app-book-date',
  standalone: true,
  imports: [
    CurrencyPipe,
    CalendarModule,
    FormsModule,
    MessageModule
  ],
  templateUrl: './book-date.component.html',
  styleUrl: './book-date.component.scss'
})
export class BookDateComponent implements OnInit, OnDestroy {

  listing = input.required<Listing>();
  listingPublicId = input.required<string>();

  bookingService = inject(BookingService);
  toastService = inject(ToastService);
  authService = inject(AuthService);
  router = inject(Router);

  bookingDates = new Array<Date>();
  totalPrice = 0;
  selectionIncludesBookedNight = false;

  minDate = new Date();
  bookedDates = new Array<Date>();

  constructor() {
    this.listenToCheckAvailableDate();
    this.listenToCreateBooking()
  }


  ngOnDestroy(): void {
    this.bookingService.resetCreateBooking();
    this.bookingService.resetCheckAvailability();
  }

  ngOnInit(): void {
    // Clear any availability left over from the previously viewed listing.
    this.bookingService.resetCheckAvailability();
    this.bookingService.checkAvailability(this.listingPublicId());
  }

  onDateChange(newBookingDates: Array<Date>) {
    this.bookingDates = newBookingDates;
    this.updateSelection();
  }

  private updateSelection() {
    if (isValidStayRange(this.bookingDates)) {
      const [checkIn, checkOut] = this.bookingDates;
      const nights = dayjs(checkOut).startOf("day").diff(dayjs(checkIn).startOf("day"), "day");
      this.totalPrice = nights * this.listing().price.value;
      this.selectionIncludesBookedNight = stayIncludesAnyNight(checkIn, checkOut, this.bookedDates);
    } else {
      this.totalPrice = 0;
      this.selectionIncludesBookedNight = false;
    }
  }

  validateMakeBooking() {
    return isValidStayRange(this.bookingDates)
      && !this.selectionIncludesBookedNight
      && this.authService.isAuthenticated();
  }

  onNewBooking() {
    const newBooking: CreateBooking = {
      listingPublicId: this.listingPublicId(),
      startDate: this.bookingDates[0],
      endDate: this.bookingDates[1],
    }
    this.bookingService.create(newBooking);
  }

  private listenToCheckAvailableDate() {
    effect(() => {
      const checkAvailabilityState = this.bookingService.checkAvailabilitySig();
      if (checkAvailabilityState.status === "OK") {
        this.bookedDates = this.mapBookedDatesToDate(checkAvailabilityState.value!);
        untracked(() => this.updateSelection());
      } else if (checkAvailabilityState.status === "INIT") {
        this.bookedDates = [];
      } else if (checkAvailabilityState.status === "ERROR") {
        this.toastService.send({
          severity: "error", detail: "Error when fetching the not available dates", summary: "Error",
        });
      }
    });
  }

  private mapBookedDatesToDate(bookedDatesDTOFromClients: Array<BookedDatesDTOFromClient>): Array<Date> {
    const bookedDates = new Array<Date>();
    for (let bookedDate of bookedDatesDTOFromClients) {
      bookedDates.push(...nightsOfStay(bookedDate.startDate, bookedDate.endDate));
    }
    return bookedDates;
  }

  private listenToCreateBooking() {
    effect(() => {
      const createBookingState = this.bookingService.createBookingSig();
      if (createBookingState.status === "OK") {
        this.toastService.send({
          severity: "success", detail: "Booking created successfully",
        });
        this.router.navigate(['/booking']);
      } else if (createBookingState.status === "ERROR") {
        this.toastService.send({
          severity: "error", detail: "Booking created failed",
        });
      }
    });
  }
}
