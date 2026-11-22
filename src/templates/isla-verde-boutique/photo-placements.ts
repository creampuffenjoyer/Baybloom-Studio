import photos from "./photos.json";
import { createPhotoRegistry } from "../_kit/photo-placements";

export const PHOTO_REGISTRY = createPhotoRegistry([
  {
    "id": "home",
    "name": "Home"
  },
  {
    "id": "rooms",
    "name": "Rooms"
  },
  {
    "id": "story",
    "name": "Story"
  },
  {
    "id": "dining",
    "name": "Dining"
  },
  {
    "id": "events",
    "name": "Events"
  },
  {
    "id": "journal",
    "name": "Journal"
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
    "id": "casa-room",
    "name": "Casa Room"
  },
  {
    "id": "courtyard-suite",
    "name": "Courtyard Suite"
  },
  {
    "id": "pool-suite",
    "name": "Pool Courtyard Suite"
  },
  {
    "id": "mansion-suite",
    "name": "The Mansion Suite"
  },
  {
    "id": "a-morning-on-calle-crisologo",
    "name": "A morning on Calle Crisologo"
  },
  {
    "id": "restoring-the-capiz-windows",
    "name": "Restoring two hundred capiz windows"
  },
  {
    "id": "the-longganisa-question",
    "name": "The longganisa question"
  }
], [
  {
    "id": "home.hero",
    "page": "home",
    "pageName": "Home",
    "name": "Main courtyard photo",
    "photo": "courtyard",
    "ratio": "3:4"
  },
  {
    "id": "home.room.casa-room",
    "page": "home",
    "pageName": "Home",
    "name": "Casa Room — Card photo",
    "photo": "carved-bed",
    "ratio": "3:4"
  },
  {
    "id": "rooms.casa-room.photo.1",
    "page": "rooms",
    "pageName": "Rooms",
    "name": "Casa Room — Photo 1",
    "photo": "carved-bed",
    "ratio": "3:4"
  },
  {
    "id": "rooms.casa-room.photo.2",
    "page": "rooms",
    "pageName": "Rooms",
    "name": "Casa Room — Photo 2",
    "photo": "heritage-room",
    "ratio": "3:4"
  },
  {
    "id": "book.room.casa-room",
    "page": "book",
    "pageName": "Sample booking",
    "name": "Casa Room — Choice photo",
    "photo": "carved-bed",
    "ratio": "4:3"
  },
  {
    "id": "home.room.courtyard-suite",
    "page": "home",
    "pageName": "Home",
    "name": "Courtyard Suite — Card photo",
    "photo": "canopy-bed",
    "ratio": "3:4"
  },
  {
    "id": "rooms.courtyard-suite.photo.1",
    "page": "rooms",
    "pageName": "Rooms",
    "name": "Courtyard Suite — Photo 1",
    "photo": "canopy-bed",
    "ratio": "3:4"
  },
  {
    "id": "rooms.courtyard-suite.photo.2",
    "page": "rooms",
    "pageName": "Rooms",
    "name": "Courtyard Suite — Photo 2",
    "photo": "suite",
    "ratio": "3:4"
  },
  {
    "id": "book.room.courtyard-suite",
    "page": "book",
    "pageName": "Sample booking",
    "name": "Courtyard Suite — Choice photo",
    "photo": "canopy-bed",
    "ratio": "4:3"
  },
  {
    "id": "home.room.pool-suite",
    "page": "home",
    "pageName": "Home",
    "name": "Pool Courtyard Suite — Card photo",
    "photo": "pool-courtyard",
    "ratio": "3:4"
  },
  {
    "id": "rooms.pool-suite.photo.1",
    "page": "rooms",
    "pageName": "Rooms",
    "name": "Pool Courtyard Suite — Photo 1",
    "photo": "pool-courtyard",
    "ratio": "3:4"
  },
  {
    "id": "rooms.pool-suite.photo.2",
    "page": "rooms",
    "pageName": "Rooms",
    "name": "Pool Courtyard Suite — Photo 2",
    "photo": "bathtub",
    "ratio": "3:4"
  },
  {
    "id": "book.room.pool-suite",
    "page": "book",
    "pageName": "Sample booking",
    "name": "Pool Courtyard Suite — Choice photo",
    "photo": "pool-courtyard",
    "ratio": "4:3"
  },
  {
    "id": "home.room.mansion-suite",
    "page": "home",
    "pageName": "Home",
    "name": "The Mansion Suite — Card photo",
    "photo": "salon",
    "ratio": "3:4"
  },
  {
    "id": "rooms.mansion-suite.photo.1",
    "page": "rooms",
    "pageName": "Rooms",
    "name": "The Mansion Suite — Photo 1",
    "photo": "salon",
    "ratio": "3:4"
  },
  {
    "id": "rooms.mansion-suite.photo.2",
    "page": "rooms",
    "pageName": "Rooms",
    "name": "The Mansion Suite — Photo 2",
    "photo": "balcony",
    "ratio": "3:4"
  },
  {
    "id": "book.room.mansion-suite",
    "page": "book",
    "pageName": "Sample booking",
    "name": "The Mansion Suite — Choice photo",
    "photo": "salon",
    "ratio": "4:3"
  },
  {
    "id": "room.casa-room.photo.1",
    "page": "casa-room",
    "pageName": "Casa Room",
    "name": "Main room photo",
    "photo": "carved-bed",
    "ratio": "3:4"
  },
  {
    "id": "room.casa-room.photo.2",
    "page": "casa-room",
    "pageName": "Casa Room",
    "name": "Gallery — Photo 2",
    "photo": "heritage-room",
    "ratio": "3:4"
  },
  {
    "id": "room.casa-room.photo.3",
    "page": "casa-room",
    "pageName": "Casa Room",
    "name": "Gallery — Photo 3",
    "photo": "balcony",
    "ratio": "3:4"
  },
  {
    "id": "room.courtyard-suite.photo.1",
    "page": "courtyard-suite",
    "pageName": "Courtyard Suite",
    "name": "Main room photo",
    "photo": "canopy-bed",
    "ratio": "3:4"
  },
  {
    "id": "room.courtyard-suite.photo.2",
    "page": "courtyard-suite",
    "pageName": "Courtyard Suite",
    "name": "Gallery — Photo 2",
    "photo": "suite",
    "ratio": "3:4"
  },
  {
    "id": "room.courtyard-suite.photo.3",
    "page": "courtyard-suite",
    "pageName": "Courtyard Suite",
    "name": "Gallery — Photo 3",
    "photo": "vanity",
    "ratio": "3:4"
  },
  {
    "id": "room.pool-suite.photo.1",
    "page": "pool-suite",
    "pageName": "Pool Courtyard Suite",
    "name": "Main room photo",
    "photo": "pool-courtyard",
    "ratio": "3:4"
  },
  {
    "id": "room.pool-suite.photo.2",
    "page": "pool-suite",
    "pageName": "Pool Courtyard Suite",
    "name": "Gallery — Photo 2",
    "photo": "bathtub",
    "ratio": "3:4"
  },
  {
    "id": "room.pool-suite.photo.3",
    "page": "pool-suite",
    "pageName": "Pool Courtyard Suite",
    "name": "Gallery — Photo 3",
    "photo": "canopy-bed",
    "ratio": "3:4"
  },
  {
    "id": "room.mansion-suite.photo.1",
    "page": "mansion-suite",
    "pageName": "The Mansion Suite",
    "name": "Main room photo",
    "photo": "salon",
    "ratio": "3:4"
  },
  {
    "id": "room.mansion-suite.photo.2",
    "page": "mansion-suite",
    "pageName": "The Mansion Suite",
    "name": "Gallery — Photo 2",
    "photo": "balcony",
    "ratio": "3:4"
  },
  {
    "id": "room.mansion-suite.photo.3",
    "page": "mansion-suite",
    "pageName": "The Mansion Suite",
    "name": "Gallery — Photo 3",
    "photo": "heritage-room",
    "ratio": "3:4"
  },
  {
    "id": "home.dining",
    "page": "home",
    "pageName": "Home",
    "name": "Dining section",
    "photo": "restaurant",
    "ratio": "4:3"
  },
  {
    "id": "home.events",
    "page": "home",
    "pageName": "Home",
    "name": "Events banner",
    "photo": "garden-night",
    "ratio": "4:3"
  },
  {
    "id": "home.post.a-morning-on-calle-crisologo",
    "page": "home",
    "pageName": "Home",
    "name": "A morning on Calle Crisologo",
    "photo": "street",
    "ratio": "4:3"
  },
  {
    "id": "home.post.restoring-the-capiz-windows",
    "page": "home",
    "pageName": "Home",
    "name": "Restoring two hundred capiz windows",
    "photo": "balcony",
    "ratio": "4:3"
  },
  {
    "id": "home.post.the-longganisa-question",
    "page": "home",
    "pageName": "Home",
    "name": "The longganisa question",
    "photo": "dining-table",
    "ratio": "4:3"
  },
  {
    "id": "journal.lead",
    "page": "journal",
    "pageName": "Journal",
    "name": "Featured article",
    "photo": "street",
    "ratio": "4:3"
  },
  {
    "id": "post.a-morning-on-calle-crisologo",
    "page": "a-morning-on-calle-crisologo",
    "pageName": "A morning on Calle Crisologo",
    "name": "Article photo",
    "photo": "street",
    "ratio": "4:5"
  },
  {
    "id": "post.restoring-the-capiz-windows",
    "page": "restoring-the-capiz-windows",
    "pageName": "Restoring two hundred capiz windows",
    "name": "Article photo",
    "photo": "balcony",
    "ratio": "4:5"
  },
  {
    "id": "post.the-longganisa-question",
    "page": "the-longganisa-question",
    "pageName": "The longganisa question",
    "name": "Article photo",
    "photo": "dining-table",
    "ratio": "4:5"
  },
  {
    "id": "story.facade",
    "page": "story",
    "pageName": "Story",
    "name": "House facade",
    "photo": "facade",
    "ratio": "3:4"
  },
  {
    "id": "dining.banner",
    "page": "dining",
    "pageName": "Dining",
    "name": "Dining table banner",
    "photo": "dining-table",
    "ratio": "21:9"
  },
  {
    "id": "events.banner",
    "page": "events",
    "pageName": "Events",
    "name": "Garden at night",
    "photo": "garden-night",
    "ratio": "4:3"
  },
  {
    "id": "events.0",
    "page": "events",
    "pageName": "Events",
    "name": "The Courtyard",
    "photo": "courtyard",
    "ratio": "4:3"
  },
  {
    "id": "events.1",
    "page": "events",
    "pageName": "Events",
    "name": "The Salon",
    "photo": "salon",
    "ratio": "4:3"
  },
  {
    "id": "events.2",
    "page": "events",
    "pageName": "Events",
    "name": "The Library",
    "photo": "library",
    "ratio": "4:3"
  },
  {
    "id": "story.street",
    "page": "story",
    "pageName": "Story",
    "name": "street",
    "photo": "street",
    "ratio": "3:4"
  },
  {
    "id": "story.bougainvillea",
    "page": "story",
    "pageName": "Story",
    "name": "bougainvillea",
    "photo": "bougainvillea",
    "ratio": "3:4"
  },
  {
    "id": "story.library",
    "page": "story",
    "pageName": "Story",
    "name": "library",
    "photo": "library",
    "ratio": "3:4"
  }
], photos);
