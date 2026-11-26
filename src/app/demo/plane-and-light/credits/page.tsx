import { StudioCredits } from "@/templates/_kit/studio/site";
import photos from "@/templates/plane-and-light/photos.json";
import { BASE } from "@/templates/plane-and-light/site";

export const metadata = { title: "Image credits" };

export default function Page() {
  return <StudioCredits base={BASE} photos={photos} />;
}
