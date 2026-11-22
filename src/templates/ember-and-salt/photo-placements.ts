import photos from "./photos.json";
import { createPhotoRegistry } from "../_kit/photo-placements";

export const PHOTO_REGISTRY = createPhotoRegistry([
  {
    "id": "home",
    "name": "Home"
  },
  {
    "id": "menu",
    "name": "Menu"
  },
  {
    "id": "private-dining",
    "name": "Private dining"
  },
  {
    "id": "story",
    "name": "Story"
  },
  {
    "id": "visit",
    "name": "Visit"
  },
  {
    "id": "reserve",
    "name": "Reserve"
  },
  {
    "id": "gift-cards",
    "name": "Gift cards"
  }
], [
  {
    "id": "home.hero",
    "page": "home",
    "pageName": "Home",
    "name": "Main firewood photo",
    "photo": "logs",
    "ratio": "4:5"
  },
  {
    "id": "home.dish.0",
    "page": "home",
    "pageName": "Home",
    "name": "T-bone, dry-aged 30 days",
    "photo": "t-bone",
    "ratio": "4:3"
  },
  {
    "id": "home.dish.1",
    "page": "home",
    "pageName": "Home",
    "name": "Whole catch of the day",
    "photo": "fish-coals",
    "ratio": "4:3"
  },
  {
    "id": "home.dish.2",
    "page": "home",
    "pageName": "Home",
    "name": "Flatbread, smoked butter",
    "photo": "flatbread",
    "ratio": "4:3"
  },
  {
    "id": "home.cooking",
    "page": "home",
    "pageName": "Home",
    "name": "Cooking section",
    "photo": "fish-coals",
    "ratio": "4:3"
  },
  {
    "id": "home.bar",
    "page": "home",
    "pageName": "Home",
    "name": "Bar section",
    "photo": "bar",
    "ratio": "4:3"
  },
  {
    "id": "home.private",
    "page": "home",
    "pageName": "Home",
    "name": "Private dining banner",
    "photo": "back-room",
    "ratio": "4:3"
  },
  {
    "id": "private-dining.back-room",
    "page": "private-dining",
    "pageName": "Private dining",
    "name": "The Back Room",
    "photo": "back-room",
    "ratio": "4:3"
  },
  {
    "id": "private-dining.chefs-counter",
    "page": "private-dining",
    "pageName": "Private dining",
    "name": "Chef’s Counter",
    "photo": "oven",
    "ratio": "4:3"
  },
  {
    "id": "private-dining.full-house",
    "page": "private-dining",
    "pageName": "Private dining",
    "name": "The whole house",
    "photo": "room",
    "ratio": "4:3"
  },
  {
    "id": "story.oven",
    "page": "story",
    "pageName": "Story",
    "name": "Oven photo",
    "photo": "oven",
    "ratio": "4:3"
  },
  {
    "id": "visit.room",
    "page": "visit",
    "pageName": "Visit",
    "name": "Dining room",
    "photo": "room",
    "ratio": "4:3"
  },
  {
    "id": "story.flame",
    "page": "story",
    "pageName": "Story",
    "name": "flame",
    "photo": "flame",
    "ratio": "4:3"
  },
  {
    "id": "story.fire-dish",
    "page": "story",
    "pageName": "Story",
    "name": "fire dish",
    "photo": "fire-dish",
    "ratio": "4:3"
  },
  {
    "id": "story.tables",
    "page": "story",
    "pageName": "Story",
    "name": "tables",
    "photo": "tables",
    "ratio": "4:3"
  },
  {
    "id": "menu.tomahawk",
    "page": "menu",
    "pageName": "Menu",
    "name": "tomahawk",
    "photo": "tomahawk",
    "ratio": "4:3"
  },
  {
    "id": "menu.fish-plate",
    "page": "menu",
    "pageName": "Menu",
    "name": "fish plate",
    "photo": "fish-plate",
    "ratio": "4:3"
  },
  {
    "id": "menu.cocktail",
    "page": "menu",
    "pageName": "Menu",
    "name": "cocktail",
    "photo": "cocktail",
    "ratio": "4:3"
  },
  {
    "id": "menu.dessert",
    "page": "menu",
    "pageName": "Menu",
    "name": "dessert",
    "photo": "dessert",
    "ratio": "4:3"
  }
], photos);
