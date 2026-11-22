import photos from "./photos.json";
import { createPhotoRegistry } from "../_kit/photo-placements";

export const PHOTO_REGISTRY = createPhotoRegistry([
  {
    "id": "home",
    "name": "Home"
  },
  {
    "id": "treatments",
    "name": "Treatments"
  },
  {
    "id": "packages",
    "name": "Packages"
  },
  {
    "id": "about",
    "name": "About"
  },
  {
    "id": "visit",
    "name": "Visit"
  },
  {
    "id": "gift-cards",
    "name": "Gift cards"
  },
  {
    "id": "book",
    "name": "Sample booking"
  },
  {
    "id": "hilot",
    "name": "Hilot healing massage"
  },
  {
    "id": "deep-tissue",
    "name": "Deep tissue massage"
  },
  {
    "id": "hot-stone",
    "name": "Hot stone massage"
  },
  {
    "id": "botanical-facial",
    "name": "Botanical facial"
  },
  {
    "id": "coffee-scrub",
    "name": "Coffee and coconut scrub"
  },
  {
    "id": "eucalyptus-wrap",
    "name": "Eucalyptus body wrap"
  },
  {
    "id": "thermal-circuit",
    "name": "Thermal circuit"
  },
  {
    "id": "private-soak",
    "name": "Private soak for two"
  }
], [
  {
    "id": "home.hero",
    "page": "home",
    "pageName": "Home",
    "name": "Main pool photo",
    "photo": "long-pool",
    "ratio": "5:4"
  },
  {
    "id": "home.ritual.massage",
    "page": "home",
    "pageName": "Home",
    "name": "massage ritual",
    "photo": "room",
    "ratio": "1:1"
  },
  {
    "id": "home.ritual.facial",
    "page": "home",
    "pageName": "Home",
    "name": "facial ritual",
    "photo": "oil",
    "ratio": "1:1"
  },
  {
    "id": "home.ritual.body",
    "page": "home",
    "pageName": "Home",
    "name": "body ritual",
    "photo": "eucalyptus",
    "ratio": "1:1"
  },
  {
    "id": "home.ritual.bathing",
    "page": "home",
    "pageName": "Home",
    "name": "bathing ritual",
    "photo": "hot-spring",
    "ratio": "1:1"
  },
  {
    "id": "home.steam",
    "page": "home",
    "pageName": "Home",
    "name": "Bathhouse section",
    "photo": "steam",
    "ratio": "4:3"
  },
  {
    "id": "treatments.hilot",
    "page": "treatments",
    "pageName": "Treatments",
    "name": "Hilot healing massage",
    "photo": "room",
    "ratio": "4:3"
  },
  {
    "id": "treatment.hilot",
    "page": "hilot",
    "pageName": "Hilot healing massage",
    "name": "Treatment photo",
    "photo": "room",
    "ratio": "1:1"
  },
  {
    "id": "treatments.deep-tissue",
    "page": "treatments",
    "pageName": "Treatments",
    "name": "Deep tissue massage",
    "photo": "table",
    "ratio": "4:3"
  },
  {
    "id": "treatment.deep-tissue",
    "page": "deep-tissue",
    "pageName": "Deep tissue massage",
    "name": "Treatment photo",
    "photo": "table",
    "ratio": "1:1"
  },
  {
    "id": "treatments.hot-stone",
    "page": "treatments",
    "pageName": "Treatments",
    "name": "Hot stone massage",
    "photo": "stones",
    "ratio": "4:3"
  },
  {
    "id": "treatment.hot-stone",
    "page": "hot-stone",
    "pageName": "Hot stone massage",
    "name": "Treatment photo",
    "photo": "stones",
    "ratio": "1:1"
  },
  {
    "id": "treatments.botanical-facial",
    "page": "treatments",
    "pageName": "Treatments",
    "name": "Botanical facial",
    "photo": "oil",
    "ratio": "4:3"
  },
  {
    "id": "treatment.botanical-facial",
    "page": "botanical-facial",
    "pageName": "Botanical facial",
    "name": "Treatment photo",
    "photo": "oil",
    "ratio": "1:1"
  },
  {
    "id": "treatments.coffee-scrub",
    "page": "treatments",
    "pageName": "Treatments",
    "name": "Coffee and coconut scrub",
    "photo": "leaves",
    "ratio": "4:3"
  },
  {
    "id": "treatment.coffee-scrub",
    "page": "coffee-scrub",
    "pageName": "Coffee and coconut scrub",
    "name": "Treatment photo",
    "photo": "leaves",
    "ratio": "1:1"
  },
  {
    "id": "treatments.eucalyptus-wrap",
    "page": "treatments",
    "pageName": "Treatments",
    "name": "Eucalyptus body wrap",
    "photo": "eucalyptus",
    "ratio": "4:3"
  },
  {
    "id": "treatment.eucalyptus-wrap",
    "page": "eucalyptus-wrap",
    "pageName": "Eucalyptus body wrap",
    "name": "Treatment photo",
    "photo": "eucalyptus",
    "ratio": "1:1"
  },
  {
    "id": "treatments.thermal-circuit",
    "page": "treatments",
    "pageName": "Treatments",
    "name": "Thermal circuit",
    "photo": "long-pool",
    "ratio": "4:3"
  },
  {
    "id": "treatment.thermal-circuit",
    "page": "thermal-circuit",
    "pageName": "Thermal circuit",
    "name": "Treatment photo",
    "photo": "long-pool",
    "ratio": "1:1"
  },
  {
    "id": "treatments.private-soak",
    "page": "treatments",
    "pageName": "Treatments",
    "name": "Private soak for two",
    "photo": "bath-hall",
    "ratio": "4:3"
  },
  {
    "id": "treatment.private-soak",
    "page": "private-soak",
    "pageName": "Private soak for two",
    "name": "Treatment photo",
    "photo": "bath-hall",
    "ratio": "1:1"
  },
  {
    "id": "packages.0",
    "page": "packages",
    "pageName": "Packages",
    "name": "Half day of quiet",
    "photo": "pool",
    "ratio": "5:4"
  },
  {
    "id": "packages.1",
    "page": "packages",
    "pageName": "Packages",
    "name": "Together",
    "photo": "treatment-room",
    "ratio": "5:4"
  },
  {
    "id": "packages.2",
    "page": "packages",
    "pageName": "Packages",
    "name": "Mountain reset",
    "photo": "stones",
    "ratio": "5:4"
  },
  {
    "id": "about.reception",
    "page": "about",
    "pageName": "About",
    "name": "reception",
    "photo": "reception",
    "ratio": "3:4"
  },
  {
    "id": "about.round-leaves",
    "page": "about",
    "pageName": "About",
    "name": "round leaves",
    "photo": "round-leaves",
    "ratio": "3:4"
  },
  {
    "id": "visit.pool",
    "page": "visit",
    "pageName": "Visit",
    "name": "Green pool",
    "photo": "green-pool",
    "ratio": "4:3"
  },
  {
    "id": "gift-cards.room",
    "page": "gift-cards",
    "pageName": "Gift cards",
    "name": "Treatment room",
    "photo": "treatment-room",
    "ratio": "4:5"
  }
], photos);
