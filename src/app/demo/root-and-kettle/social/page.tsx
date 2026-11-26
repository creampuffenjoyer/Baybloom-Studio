import { StudioSocial } from "@/templates/_kit/studio/social";
import photos from "@/templates/root-and-kettle/photos.json";
import { site } from "@/templates/root-and-kettle/site";

export const metadata = { title: "Social kit" };

export default function Page() {
  return <StudioSocial site={site} photos={photos} />;
}
