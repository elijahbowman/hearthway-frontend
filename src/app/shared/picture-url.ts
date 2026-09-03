import {environment} from "../../environments/environment";
import {DisplayPicture} from "../landlord/model/listing.model";

/** Widths the API can scale pictures to; anything else is rejected. */
export type PictureWidth = 320 | 640 | 1280;

/**
 * URL of a listing picture, optionally scaled down to a supported width.
 * Responses are cached by the browser, so reuse the same width for the same slot.
 */
export function pictureUrl(picture: DisplayPicture, width?: PictureWidth): string {
  const url = `${environment.API_URL}/pictures/${picture.publicId}`;
  return width ? `${url}?width=${width}` : url;
}
