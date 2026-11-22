import { placementImageHandlers } from "@/lib/personalization/placement-images";
import { PHOTO_REGISTRY } from "@/templates/ember-and-salt/photo-placements";
export const { GET, PUT, DELETE } = placementImageHandlers("ember-and-salt", PHOTO_REGISTRY.is);
