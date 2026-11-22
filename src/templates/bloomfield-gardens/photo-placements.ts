import photos from "./photos.json";
import { createPhotoRegistry } from "../_kit/photo-placements";

export const PHOTO_REGISTRY = createPhotoRegistry([
  {
    "id": "home",
    "name": "Home"
  },
  {
    "id": "spaces",
    "name": "Spaces"
  },
  {
    "id": "weddings",
    "name": "Weddings"
  },
  {
    "id": "planning",
    "name": "Planning"
  },
  {
    "id": "gallery",
    "name": "Gallery"
  },
  {
    "id": "inquire",
    "name": "Inquire"
  },
  {
    "id": "the-lawn",
    "name": "The Cedar Lawn"
  },
  {
    "id": "the-glasshouse",
    "name": "The Glasshouse"
  },
  {
    "id": "the-barn",
    "name": "The Hay Barn"
  },
  {
    "id": "the-rose-walk",
    "name": "The Rose Walk"
  },
  {
    "id": "the-ruin",
    "name": "The Chapel Ruin"
  }
], [
  {
    "id": "home.hero.0",
    "page": "home",
    "pageName": "Home",
    "name": "Left hero photo",
    "photo": "bouquet",
    "ratio": "3:4"
  },
  {
    "id": "home.hero.1",
    "page": "home",
    "pageName": "Home",
    "name": "Main center photo",
    "photo": "lawn",
    "ratio": "4:5"
  },
  {
    "id": "home.hero.2",
    "page": "home",
    "pageName": "Home",
    "name": "Right hero photo",
    "photo": "glasshouse-dinner",
    "ratio": "3:4"
  },
  {
    "id": "home.space.the-lawn",
    "page": "home",
    "pageName": "Home",
    "name": "The Cedar Lawn — Preview",
    "photo": "lawn",
    "ratio": "1:1"
  },
  {
    "id": "spaces.the-lawn.photo.1",
    "page": "spaces",
    "pageName": "Spaces",
    "name": "The Cedar Lawn — Photo 1",
    "photo": "lawn",
    "ratio": "4:5"
  },
  {
    "id": "spaces.the-lawn.photo.2",
    "page": "spaces",
    "pageName": "Spaces",
    "name": "The Cedar Lawn — Photo 2",
    "photo": "house",
    "ratio": "3:4"
  },
  {
    "id": "home.space.the-glasshouse",
    "page": "home",
    "pageName": "Home",
    "name": "The Glasshouse — Preview",
    "photo": "glasshouse-dinner",
    "ratio": "1:1"
  },
  {
    "id": "spaces.the-glasshouse.photo.1",
    "page": "spaces",
    "pageName": "Spaces",
    "name": "The Glasshouse — Photo 1",
    "photo": "glasshouse-dinner",
    "ratio": "4:5"
  },
  {
    "id": "spaces.the-glasshouse.photo.2",
    "page": "spaces",
    "pageName": "Spaces",
    "name": "The Glasshouse — Photo 2",
    "photo": "glasshouse",
    "ratio": "3:4"
  },
  {
    "id": "home.space.the-barn",
    "page": "home",
    "pageName": "Home",
    "name": "The Hay Barn — Preview",
    "photo": "barn-dinner",
    "ratio": "1:1"
  },
  {
    "id": "spaces.the-barn.photo.1",
    "page": "spaces",
    "pageName": "Spaces",
    "name": "The Hay Barn — Photo 1",
    "photo": "barn-dinner",
    "ratio": "4:5"
  },
  {
    "id": "spaces.the-barn.photo.2",
    "page": "spaces",
    "pageName": "Spaces",
    "name": "The Hay Barn — Photo 2",
    "photo": "barn",
    "ratio": "3:4"
  },
  {
    "id": "home.space.the-rose-walk",
    "page": "home",
    "pageName": "Home",
    "name": "The Rose Walk — Preview",
    "photo": "rose-tunnel",
    "ratio": "1:1"
  },
  {
    "id": "spaces.the-rose-walk.photo.1",
    "page": "spaces",
    "pageName": "Spaces",
    "name": "The Rose Walk — Photo 1",
    "photo": "rose-tunnel",
    "ratio": "4:5"
  },
  {
    "id": "spaces.the-rose-walk.photo.2",
    "page": "spaces",
    "pageName": "Spaces",
    "name": "The Rose Walk — Photo 2",
    "photo": "orangery",
    "ratio": "3:4"
  },
  {
    "id": "home.space.the-ruin",
    "page": "home",
    "pageName": "Home",
    "name": "The Chapel Ruin — Preview",
    "photo": "ruin",
    "ratio": "1:1"
  },
  {
    "id": "spaces.the-ruin.photo.1",
    "page": "spaces",
    "pageName": "Spaces",
    "name": "The Chapel Ruin — Photo 1",
    "photo": "ruin",
    "ratio": "4:5"
  },
  {
    "id": "spaces.the-ruin.photo.2",
    "page": "spaces",
    "pageName": "Spaces",
    "name": "The Chapel Ruin — Photo 2",
    "photo": "pond",
    "ratio": "3:4"
  },
  {
    "id": "space.the-lawn.photo.1",
    "page": "the-lawn",
    "pageName": "The Cedar Lawn",
    "name": "Main space photo",
    "photo": "lawn",
    "ratio": "16:9"
  },
  {
    "id": "space.the-lawn.photo.2",
    "page": "the-lawn",
    "pageName": "The Cedar Lawn",
    "name": "Gallery — Photo 2",
    "photo": "house",
    "ratio": "4:3"
  },
  {
    "id": "space.the-lawn.photo.3",
    "page": "the-lawn",
    "pageName": "The Cedar Lawn",
    "name": "Gallery — Photo 3",
    "photo": "night-path",
    "ratio": "4:3"
  },
  {
    "id": "space.the-glasshouse.photo.1",
    "page": "the-glasshouse",
    "pageName": "The Glasshouse",
    "name": "Main space photo",
    "photo": "glasshouse-dinner",
    "ratio": "16:9"
  },
  {
    "id": "space.the-glasshouse.photo.2",
    "page": "the-glasshouse",
    "pageName": "The Glasshouse",
    "name": "Gallery — Photo 2",
    "photo": "glasshouse",
    "ratio": "4:3"
  },
  {
    "id": "space.the-glasshouse.photo.3",
    "page": "the-glasshouse",
    "pageName": "The Glasshouse",
    "name": "Gallery — Photo 3",
    "photo": "glasshouse-inside",
    "ratio": "4:3"
  },
  {
    "id": "space.the-barn.photo.1",
    "page": "the-barn",
    "pageName": "The Hay Barn",
    "name": "Main space photo",
    "photo": "barn-dinner",
    "ratio": "16:9"
  },
  {
    "id": "space.the-barn.photo.2",
    "page": "the-barn",
    "pageName": "The Hay Barn",
    "name": "Gallery — Photo 2",
    "photo": "barn",
    "ratio": "4:3"
  },
  {
    "id": "space.the-barn.photo.3",
    "page": "the-barn",
    "pageName": "The Hay Barn",
    "name": "Gallery — Photo 3",
    "photo": "florals",
    "ratio": "4:3"
  },
  {
    "id": "space.the-rose-walk.photo.1",
    "page": "the-rose-walk",
    "pageName": "The Rose Walk",
    "name": "Main space photo",
    "photo": "rose-tunnel",
    "ratio": "16:9"
  },
  {
    "id": "space.the-rose-walk.photo.2",
    "page": "the-rose-walk",
    "pageName": "The Rose Walk",
    "name": "Gallery — Photo 2",
    "photo": "orangery",
    "ratio": "4:3"
  },
  {
    "id": "space.the-rose-walk.photo.3",
    "page": "the-rose-walk",
    "pageName": "The Rose Walk",
    "name": "Gallery — Photo 3",
    "photo": "pergola",
    "ratio": "4:3"
  },
  {
    "id": "space.the-ruin.photo.1",
    "page": "the-ruin",
    "pageName": "The Chapel Ruin",
    "name": "Main space photo",
    "photo": "ruin",
    "ratio": "16:9"
  },
  {
    "id": "space.the-ruin.photo.2",
    "page": "the-ruin",
    "pageName": "The Chapel Ruin",
    "name": "Gallery — Photo 2",
    "photo": "pond",
    "ratio": "4:3"
  },
  {
    "id": "space.the-ruin.photo.3",
    "page": "the-ruin",
    "pageName": "The Chapel Ruin",
    "name": "Gallery — Photo 3",
    "photo": "rose-gate",
    "ratio": "4:3"
  },
  {
    "id": "weddings.tent",
    "page": "weddings",
    "pageName": "Weddings",
    "name": "Evening marquee",
    "photo": "tent-night",
    "ratio": "4:3"
  },
  {
    "id": "gallery.lawn",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 1 — lawn",
    "photo": "lawn",
    "ratio": "1:1"
  },
  {
    "id": "gallery.glasshouse-dinner",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 2 — glasshouse dinner",
    "photo": "glasshouse-dinner",
    "ratio": "1:1"
  },
  {
    "id": "gallery.rose-tunnel",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 3 — rose tunnel",
    "photo": "rose-tunnel",
    "ratio": "1:1"
  },
  {
    "id": "gallery.bouquet",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 4 — bouquet",
    "photo": "bouquet",
    "ratio": "1:1"
  },
  {
    "id": "gallery.barn-dinner",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 5 — barn dinner",
    "photo": "barn-dinner",
    "ratio": "1:1"
  },
  {
    "id": "gallery.ruin",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 6 — ruin",
    "photo": "ruin",
    "ratio": "1:1"
  },
  {
    "id": "gallery.table",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 7 — table",
    "photo": "table",
    "ratio": "1:1"
  },
  {
    "id": "gallery.glasshouse",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 8 — glasshouse",
    "photo": "glasshouse",
    "ratio": "1:1"
  },
  {
    "id": "gallery.pergola",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 9 — pergola",
    "photo": "pergola",
    "ratio": "1:1"
  },
  {
    "id": "gallery.night-path",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 10 — night path",
    "photo": "night-path",
    "ratio": "1:1"
  },
  {
    "id": "gallery.florals",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 11 — florals",
    "photo": "florals",
    "ratio": "1:1"
  },
  {
    "id": "gallery.pond",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 12 — pond",
    "photo": "pond",
    "ratio": "1:1"
  },
  {
    "id": "gallery.orangery-out",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 13 — orangery out",
    "photo": "orangery-out",
    "ratio": "1:1"
  },
  {
    "id": "gallery.wildflowers",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 14 — wildflowers",
    "photo": "wildflowers",
    "ratio": "1:1"
  },
  {
    "id": "gallery.tent-night",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 15 — tent night",
    "photo": "tent-night",
    "ratio": "1:1"
  },
  {
    "id": "gallery.rose-arch",
    "page": "gallery",
    "pageName": "Gallery",
    "name": "Photo 16 — rose arch",
    "photo": "rose-arch",
    "ratio": "1:1"
  }
], photos);
