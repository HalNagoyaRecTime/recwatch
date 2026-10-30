export type PlaceImageChange =
  { type: "replace"; image: Blob } | { type: "remove" };
