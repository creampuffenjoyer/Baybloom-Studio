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
    "id": "activities",
    "name": "Activities"
  },
  {
    "id": "dining",
    "name": "Dining"
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
    "id": "how-to-dress-for-a-bluebird-day",
    "name": "How to dress for a bluebird day"
  },
  {
    "id": "larch-season-is-coming",
    "name": "Larch season is coming"
  },
  {
    "id": "trapper-twin",
    "name": "Trapper Twin"
  },
  {
    "id": "hearth-room",
    "name": "Hearth Room"
  },
  {
    "id": "family-loft",
    "name": "Family Loft"
  },
  {
    "id": "ridge-chalet",
    "name": "Ridge Chalet"
  }
], [
  {
    "id": "home.hero.winter",
    "page": "home",
    "pageName": "Home",
    "name": "Winter — Main banner",
    "photo": "snow-chalets",
    "ratio": "21:9"
  },
  {
    "id": "home.hero.summer",
    "page": "home",
    "pageName": "Home",
    "name": "Summer — Main banner",
    "photo": "lodge-lake",
    "ratio": "21:9"
  },
  {
    "id": "home.activity.ridge-ski",
    "page": "home",
    "pageName": "Home",
    "name": "Ski and ride the Ridge — Seasonal photo",
    "photo": "ski-slope",
    "ratio": "4:3"
  },
  {
    "id": "home.activity.backcountry",
    "page": "home",
    "pageName": "Home",
    "name": "Backcountry touring — Seasonal photo",
    "photo": "skiers",
    "ratio": "4:3"
  },
  {
    "id": "home.activity.snowshoe",
    "page": "home",
    "pageName": "Home",
    "name": "Snowshoe to the falls — Seasonal photo",
    "photo": "ski-village",
    "ratio": "4:3"
  },
  {
    "id": "home.activity.lake-hike",
    "page": "home",
    "pageName": "Home",
    "name": "Larch Lake hike — Seasonal photo",
    "photo": "trail",
    "ratio": "4:3"
  },
  {
    "id": "home.activity.paddle",
    "page": "home",
    "pageName": "Home",
    "name": "Sunrise paddle — Seasonal photo",
    "photo": "canoe-dock",
    "ratio": "4:3"
  },
  {
    "id": "home.activity.wildflowers",
    "page": "home",
    "pageName": "Home",
    "name": "Wildflower meadows — Seasonal photo",
    "photo": "meadow-hike",
    "ratio": "4:3"
  },
  {
    "id": "home.room.trapper-twin",
    "page": "home",
    "pageName": "Home",
    "name": "Trapper Twin — Card photo",
    "photo": "twin-room",
    "ratio": "3:4"
  },
  {
    "id": "rooms.trapper-twin",
    "page": "rooms",
    "pageName": "Rooms",
    "name": "Trapper Twin — Comparison photo",
    "photo": "twin-room",
    "ratio": "1:1"
  },
  {
    "id": "book.room.trapper-twin",
    "page": "book",
    "pageName": "Sample booking",
    "name": "Trapper Twin — Choice photo",
    "photo": "twin-room",
    "ratio": "4:3"
  },
  {
    "id": "home.room.hearth-room",
    "page": "home",
    "pageName": "Home",
    "name": "Hearth Room — Card photo",
    "photo": "fireplace",
    "ratio": "3:4"
  },
  {
    "id": "rooms.hearth-room",
    "page": "rooms",
    "pageName": "Rooms",
    "name": "Hearth Room — Comparison photo",
    "photo": "fireplace",
    "ratio": "1:1"
  },
  {
    "id": "book.room.hearth-room",
    "page": "book",
    "pageName": "Sample booking",
    "name": "Hearth Room — Choice photo",
    "photo": "fireplace",
    "ratio": "4:3"
  },
  {
    "id": "home.room.family-loft",
    "page": "home",
    "pageName": "Home",
    "name": "Family Loft — Card photo",
    "photo": "lounge",
    "ratio": "3:4"
  },
  {
    "id": "rooms.family-loft",
    "page": "rooms",
    "pageName": "Rooms",
    "name": "Family Loft — Comparison photo",
    "photo": "lounge",
    "ratio": "1:1"
  },
  {
    "id": "book.room.family-loft",
    "page": "book",
    "pageName": "Sample booking",
    "name": "Family Loft — Choice photo",
    "photo": "lounge",
    "ratio": "4:3"
  },
  {
    "id": "home.room.ridge-chalet",
    "page": "home",
    "pageName": "Home",
    "name": "Ridge Chalet — Card photo",
    "photo": "chalet",
    "ratio": "3:4"
  },
  {
    "id": "rooms.ridge-chalet",
    "page": "rooms",
    "pageName": "Rooms",
    "name": "Ridge Chalet — Comparison photo",
    "photo": "chalet",
    "ratio": "1:1"
  },
  {
    "id": "book.room.ridge-chalet",
    "page": "book",
    "pageName": "Sample booking",
    "name": "Ridge Chalet — Choice photo",
    "photo": "chalet",
    "ratio": "4:3"
  },
  {
    "id": "home.dining",
    "page": "home",
    "pageName": "Home",
    "name": "dining section",
    "photo": "dining",
    "ratio": "3:4"
  },
  {
    "id": "home.restaurant",
    "page": "home",
    "pageName": "Home",
    "name": "restaurant section",
    "photo": "restaurant",
    "ratio": "4:3"
  },
  {
    "id": "home.lobby",
    "page": "home",
    "pageName": "Home",
    "name": "lobby section",
    "photo": "lobby",
    "ratio": "4:3"
  },
  {
    "id": "home.post.how-to-dress-for-a-bluebird-day",
    "page": "home",
    "pageName": "Home",
    "name": "How to dress for a bluebird day — Journal preview",
    "photo": "skiers",
    "ratio": "1:1"
  },
  {
    "id": "journal.how-to-dress-for-a-bluebird-day",
    "page": "journal",
    "pageName": "Journal",
    "name": "How to dress for a bluebird day",
    "photo": "skiers",
    "ratio": "4:3"
  },
  {
    "id": "post.how-to-dress-for-a-bluebird-day",
    "page": "how-to-dress-for-a-bluebird-day",
    "pageName": "How to dress for a bluebird day",
    "name": "Article banner",
    "photo": "skiers",
    "ratio": "4:3"
  },
  {
    "id": "home.post.larch-season-is-coming",
    "page": "home",
    "pageName": "Home",
    "name": "Larch season is coming — Journal preview",
    "photo": "autumn-hike",
    "ratio": "1:1"
  },
  {
    "id": "journal.larch-season-is-coming",
    "page": "journal",
    "pageName": "Journal",
    "name": "Larch season is coming",
    "photo": "autumn-hike",
    "ratio": "4:3"
  },
  {
    "id": "post.larch-season-is-coming",
    "page": "larch-season-is-coming",
    "pageName": "Larch season is coming",
    "name": "Article banner",
    "photo": "autumn-hike",
    "ratio": "4:3"
  },
  {
    "id": "room.trapper-twin.photo.1",
    "page": "trapper-twin",
    "pageName": "Trapper Twin",
    "name": "Main room photo",
    "photo": "twin-room",
    "ratio": "21:9"
  },
  {
    "id": "room.trapper-twin.photo.2",
    "page": "trapper-twin",
    "pageName": "Trapper Twin",
    "name": "Gallery — Photo 2",
    "photo": "lounge",
    "ratio": "4:3"
  },
  {
    "id": "room.trapper-twin.photo.3",
    "page": "trapper-twin",
    "pageName": "Trapper Twin",
    "name": "Gallery — Photo 3",
    "photo": "ski-slope",
    "ratio": "4:3"
  },
  {
    "id": "room.hearth-room.photo.1",
    "page": "hearth-room",
    "pageName": "Hearth Room",
    "name": "Main room photo",
    "photo": "fireplace",
    "ratio": "21:9"
  },
  {
    "id": "room.hearth-room.photo.2",
    "page": "hearth-room",
    "pageName": "Hearth Room",
    "name": "Gallery — Photo 2",
    "photo": "peaks",
    "ratio": "4:3"
  },
  {
    "id": "room.hearth-room.photo.3",
    "page": "hearth-room",
    "pageName": "Hearth Room",
    "name": "Gallery — Photo 3",
    "photo": "lobby",
    "ratio": "4:3"
  },
  {
    "id": "room.family-loft.photo.1",
    "page": "family-loft",
    "pageName": "Family Loft",
    "name": "Main room photo",
    "photo": "lounge",
    "ratio": "21:9"
  },
  {
    "id": "room.family-loft.photo.2",
    "page": "family-loft",
    "pageName": "Family Loft",
    "name": "Gallery — Photo 2",
    "photo": "terrace",
    "ratio": "4:3"
  },
  {
    "id": "room.family-loft.photo.3",
    "page": "family-loft",
    "pageName": "Family Loft",
    "name": "Gallery — Photo 3",
    "photo": "meadow-hike",
    "ratio": "4:3"
  },
  {
    "id": "room.ridge-chalet.photo.1",
    "page": "ridge-chalet",
    "pageName": "Ridge Chalet",
    "name": "Main room photo",
    "photo": "chalet",
    "ratio": "21:9"
  },
  {
    "id": "room.ridge-chalet.photo.2",
    "page": "ridge-chalet",
    "pageName": "Ridge Chalet",
    "name": "Gallery — Photo 2",
    "photo": "snow-chalets",
    "ratio": "4:3"
  },
  {
    "id": "room.ridge-chalet.photo.3",
    "page": "ridge-chalet",
    "pageName": "Ridge Chalet",
    "name": "Gallery — Photo 3",
    "photo": "terrace",
    "ratio": "4:3"
  },
  {
    "id": "activities.ridge-ski",
    "page": "activities",
    "pageName": "Activities",
    "name": "Ski and ride the Ridge",
    "photo": "ski-slope",
    "ratio": "4:3"
  },
  {
    "id": "activities.backcountry",
    "page": "activities",
    "pageName": "Activities",
    "name": "Backcountry touring",
    "photo": "skiers",
    "ratio": "4:3"
  },
  {
    "id": "activities.snowshoe",
    "page": "activities",
    "pageName": "Activities",
    "name": "Snowshoe to the falls",
    "photo": "ski-village",
    "ratio": "4:3"
  },
  {
    "id": "activities.lake-hike",
    "page": "activities",
    "pageName": "Activities",
    "name": "Larch Lake hike",
    "photo": "trail",
    "ratio": "4:3"
  },
  {
    "id": "activities.paddle",
    "page": "activities",
    "pageName": "Activities",
    "name": "Sunrise paddle",
    "photo": "canoe-dock",
    "ratio": "4:3"
  },
  {
    "id": "activities.wildflowers",
    "page": "activities",
    "pageName": "Activities",
    "name": "Wildflower meadows",
    "photo": "meadow-hike",
    "ratio": "4:3"
  },
  {
    "id": "activities.larch",
    "page": "activities",
    "pageName": "Activities",
    "name": "Larch season",
    "photo": "autumn-hike",
    "ratio": "4:3"
  },
  {
    "id": "dining.banner",
    "page": "dining",
    "pageName": "Dining",
    "name": "Restaurant banner",
    "photo": "restaurant",
    "ratio": "21:9"
  }
], photos);
