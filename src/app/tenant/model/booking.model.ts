import {DisplayPicture} from "../../landlord/model/listing.model";
import {PriceVO} from "../../landlord/model/listing-vo.model";
import {Dayjs} from "dayjs";

/**
 * A stay as calendar days: check-in and (exclusive) check-out. The API sends and
 * expects YYYY-MM-DD strings; the client works with local Dates.
 */
export interface BookedDatesDTOFromServer {
  startDate: Date | string,
  endDate: Date | string,
}

export interface BookedListing {
  location: string,
  cover: DisplayPicture,
  totalPrice: PriceVO,
  dates: BookedDatesDTOFromServer,
  bookingPublicId: string,
  listingPublicId: string,
  loading: boolean
}

export interface CreateBooking {
  startDate: Date,
  endDate: Date,
  listingPublicId: string,
}

export interface BookedDatesDTOFromClient {
  startDate: Dayjs,
  endDate: Dayjs,
}
