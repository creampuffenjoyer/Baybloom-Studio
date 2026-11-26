import { StudioCredits } from "@/templates/_kit/studio/site";
import photos from "@/templates/fern-and-stone/photos.json";
import { BASE } from "@/templates/fern-and-stone/site";

export const metadata = { title: "Image credits" };

export default function Page() {
  return <StudioCredits base={BASE} photos={photos} />;
}
