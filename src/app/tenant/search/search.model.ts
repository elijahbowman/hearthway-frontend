import {NewListingInfo} from "../../landlord/model/listing.model";

/** Check-in and (exclusive) check-out as local dates; sent to the API as YYYY-MM-DD. */
export interface SearchDates {
  startDate: Date,
  endDate: Date,
}

export interface Search {
  location: string,
  dates: SearchDates,
  infos: NewListingInfo
}
