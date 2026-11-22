import { placementImageHandlers } from "@/lib/personalization/placement-images";
import { PHOTO_REGISTRY } from "@/templates/still-water-spa/photo-placements";
export const { GET, PUT, DELETE } = placementImageHandlers("still-water-spa", PHOTO_REGISTRY.is);
