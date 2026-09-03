import {pictureUrl} from "./picture-url";
import {environment} from "../../environments/environment";

describe("pictureUrl", () => {
  const picture = {publicId: "abc-123", isCover: true};

  it("points at the picture endpoint", () => {
    expect(pictureUrl(picture)).toBe(`${environment.API_URL}/pictures/abc-123`);
  });

  it("requests a scaled version when a width is given", () => {
    expect(pictureUrl(picture, 640)).toBe(`${environment.API_URL}/pictures/abc-123?width=640`);
  });
});
