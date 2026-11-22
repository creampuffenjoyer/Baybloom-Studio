import { placementImageHandlers } from "@/lib/personalization/placement-images";
import { PHOTO_REGISTRY } from "@/templates/lumen-lake-villas/photo-placements";
export const { GET, PUT, DELETE } = placementImageHandlers("lumen-lake-villas", PHOTO_REGISTRY.is);
