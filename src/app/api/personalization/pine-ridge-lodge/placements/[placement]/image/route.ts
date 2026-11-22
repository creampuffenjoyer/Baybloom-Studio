import { placementImageHandlers } from "@/lib/personalization/placement-images";
import { PHOTO_REGISTRY } from "@/templates/pine-ridge-lodge/photo-placements";
export const { GET, PUT, DELETE } = placementImageHandlers("pine-ridge-lodge", PHOTO_REGISTRY.is);
