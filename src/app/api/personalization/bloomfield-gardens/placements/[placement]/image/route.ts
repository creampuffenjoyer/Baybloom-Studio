import { placementImageHandlers } from "@/lib/personalization/placement-images";
import { PHOTO_REGISTRY } from "@/templates/bloomfield-gardens/photo-placements";
export const { GET, PUT, DELETE } = placementImageHandlers("bloomfield-gardens", PHOTO_REGISTRY.is);
