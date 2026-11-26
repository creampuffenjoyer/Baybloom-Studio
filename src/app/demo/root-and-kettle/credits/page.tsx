import { StudioCredits } from "@/templates/_kit/studio/site";
import photos from "@/templates/root-and-kettle/photos.json";
import { BASE } from "@/templates/root-and-kettle/site";

export const metadata = { title: "Image credits" };

export default function Page() {
  return <StudioCredits base={BASE} photos={photos} />;
}
