import { placementImageHandlers } from "@/lib/personalization/placement-images";
import { PHOTO_REGISTRY } from "@/templates/isla-verde-boutique/photo-placements";
export const { GET, PUT, DELETE } = placementImageHandlers("isla-verde-boutique", PHOTO_REGISTRY.is);
