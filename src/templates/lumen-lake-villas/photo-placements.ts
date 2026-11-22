import photos from "./photos.json";
import { createPhotoRegistry } from "../_kit/photo-placements";

export const PHOTO_REGISTRY = createPhotoRegistry([
  {
    "id": "home",
    "name": "Home"
  },
  {
    "id": "villas",
    "name": "Villas"
  },
  {
    "id": "experiences",
    "name": "Experiences"
  },
  {
    "id": "tour",
    "name": "Tour"
  },
  {
    "id": "book",
    "name": "Sample booking"
  },
  {
    "id": "contact",
    "name": "Contact"
  },
  {
    "id": "shore-villa",
    "name": "Shore Villa"
  },
  {
    "id": "garden-villa",
    "name": "Garden Villa"
  },
  {
    "id": "family-villa",
    "name": "Family Villa"
  },
  {
    "id": "boathouse",
    "name": "The Boathouse"
  }
], [
  {
    "id": "home.hero",
    "page": "home",
    "pageName": "Home",
    "name": "Main banner",
    "photo": "jetties",
    "ratio": "21:8"
  },
  {
    "id": "home.villa.shore-villa",
    "page": "home",
    "pageName": "Home",
    "name": "Shore Villa — Card photo",
    "photo": "villas",
    "ratio": "4:5"
  },
  {
    "id": "villas.finder.shore-villa",
    "page": "villas",
    "pageName": "Villas",
    "name": "Shore Villa — Finder photo",
    "photo": "villas",
    "ratio": "4:3"
  },
  {
    "id": "villas.compare.shore-villa",
    "page": "villas",
    "pageName": "Villas",
    "name": "Shore Villa — Comparison photo",
    "photo": "villas",
    "ratio": "4:3"
  },
  {
    "id": "home.villa.garden-villa",
    "page": "home",
    "pageName": "Home",
    "name": "Garden Villa — Card photo",
    "photo": "cabin",
    "ratio": "4:5"
  },
  {
    "id": "villas.finder.garden-villa",
    "page": "villas",
    "pageName": "Villas",
    "name": "Garden Villa — Finder photo",
    "photo": "cabin",
    "ratio": "4:3"
  },
  {
    "id": "villas.compare.garden-villa",
    "page": "villas",
    "pageName": "Villas",
    "name": "Garden Villa — Comparison photo",
    "photo": "cabin",
    "ratio": "4:3"
  },
  {
    "id": "home.villa.family-villa",
    "page": "home",
    "pageName": "Home",
    "name": "Family Villa — Card photo",
    "photo": "red-house",
    "ratio": "4:5"
  },
  {
    "id": "villas.finder.family-villa",
    "page": "villas",
    "pageName": "Villas",
    "name": "Family Villa — Finder photo",
    "photo": "red-house",
    "ratio": "4:3"
  },
  {
    "id": "villas.compare.family-villa",
    "page": "villas",
    "pageName": "Villas",
    "name": "Family Villa — Comparison photo",
    "photo": "red-house",
    "ratio": "4:3"
  },
  {
    "id": "home.villa.boathouse",
    "page": "home",
    "pageName": "Home",
    "name": "The Boathouse — Card photo",
    "photo": "bathhouse",
    "ratio": "4:5"
  },
  {
    "id": "villas.finder.boathouse",
    "page": "villas",
    "pageName": "Villas",
    "name": "The Boathouse — Finder photo",
    "photo": "bathhouse",
    "ratio": "4:3"
  },
  {
    "id": "villas.compare.boathouse",
    "page": "villas",
    "pageName": "Villas",
    "name": "The Boathouse — Comparison photo",
    "photo": "bathhouse",
    "ratio": "4:3"
  },
  {
    "id": "home.town",
    "page": "home",
    "pageName": "Home",
    "name": "Lake landscape",
    "photo": "town",
    "ratio": "16:9"
  },
  {
    "id": "villa.shore-villa.photo.1",
    "page": "shore-villa",
    "pageName": "Shore Villa",
    "name": "Main villa photo",
    "photo": "villas",
    "ratio": "21:9"
  },
  {
    "id": "villa.shore-villa.photo.2",
    "page": "shore-villa",
    "pageName": "Shore Villa",
    "name": "Gallery — Photo 2",
    "photo": "jetties",
    "ratio": "4:5"
  },
  {
    "id": "villa.shore-villa.photo.3",
    "page": "shore-villa",
    "pageName": "Shore Villa",
    "name": "Gallery — Photo 3",
    "photo": "morning",
    "ratio": "4:3"
  },
  {
    "id": "villa.garden-villa.photo.1",
    "page": "garden-villa",
    "pageName": "Garden Villa",
    "name": "Main villa photo",
    "photo": "cabin",
    "ratio": "21:9"
  },
  {
    "id": "villa.garden-villa.photo.2",
    "page": "garden-villa",
    "pageName": "Garden Villa",
    "name": "Gallery — Photo 2",
    "photo": "mist",
    "ratio": "4:5"
  },
  {
    "id": "villa.garden-villa.photo.3",
    "page": "garden-villa",
    "pageName": "Garden Villa",
    "name": "Gallery — Photo 3",
    "photo": "canoes",
    "ratio": "4:3"
  },
  {
    "id": "villa.family-villa.photo.1",
    "page": "family-villa",
    "pageName": "Family Villa",
    "name": "Main villa photo",
    "photo": "red-house",
    "ratio": "21:9"
  },
  {
    "id": "villa.family-villa.photo.2",
    "page": "family-villa",
    "pageName": "Family Villa",
    "name": "Gallery — Photo 2",
    "photo": "rowboats",
    "ratio": "4:5"
  },
  {
    "id": "villa.family-villa.photo.3",
    "page": "family-villa",
    "pageName": "Family Villa",
    "name": "Gallery — Photo 3",
    "photo": "sauna-smoke",
    "ratio": "4:3"
  },
  {
    "id": "villa.boathouse.photo.1",
    "page": "boathouse",
    "pageName": "The Boathouse",
    "name": "Main villa photo",
    "photo": "bathhouse",
    "ratio": "21:9"
  },
  {
    "id": "villa.boathouse.photo.2",
    "page": "boathouse",
    "pageName": "The Boathouse",
    "name": "Gallery — Photo 2",
    "photo": "sunset",
    "ratio": "4:5"
  },
  {
    "id": "villa.boathouse.photo.3",
    "page": "boathouse",
    "pageName": "The Boathouse",
    "name": "Gallery — Photo 3",
    "photo": "sauna",
    "ratio": "4:3"
  },
  {
    "id": "experiences.kayak",
    "page": "experiences",
    "pageName": "Experiences",
    "name": "Kayak at first light",
    "photo": "kayaks",
    "ratio": "4:3"
  },
  {
    "id": "experiences.cruise",
    "page": "experiences",
    "pageName": "Experiences",
    "name": "Sunset cruise",
    "photo": "sunset",
    "ratio": "4:3"
  },
  {
    "id": "experiences.dinner",
    "page": "experiences",
    "pageName": "Experiences",
    "name": "Private dinner on the jetty",
    "photo": "vineyard-lake",
    "ratio": "4:3"
  },
  {
    "id": "experiences.sauna",
    "page": "experiences",
    "pageName": "Experiences",
    "name": "Sauna and swim",
    "photo": "sauna-modern",
    "ratio": "4:3"
  },
  {
    "id": "tour.jetty",
    "page": "tour",
    "pageName": "Tour",
    "name": "The jetties",
    "photo": "jetties",
    "ratio": "21:9"
  },
  {
    "id": "tour.shore",
    "page": "tour",
    "pageName": "Tour",
    "name": "The shore",
    "photo": "town",
    "ratio": "21:9"
  },
  {
    "id": "tour.sauna",
    "page": "tour",
    "pageName": "Tour",
    "name": "The sauna",
    "photo": "sauna-modern",
    "ratio": "21:9"
  },
  {
    "id": "tour.boathouse",
    "page": "tour",
    "pageName": "Tour",
    "name": "The Boathouse",
    "photo": "bathhouse",
    "ratio": "21:9"
  },
  {
    "id": "contact.mist",
    "page": "contact",
    "pageName": "Contact",
    "name": "Lake in the mist",
    "photo": "mist",
    "ratio": "4:3"
  }
], photos);
