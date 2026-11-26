import { StudioSocial } from "@/templates/_kit/studio/social";
import photos from "@/templates/fern-and-stone/photos.json";
import { site } from "@/templates/fern-and-stone/site";

export const metadata = { title: "Social kit" };

export default function Page() {
  return <StudioSocial site={site} photos={photos} />;
}
