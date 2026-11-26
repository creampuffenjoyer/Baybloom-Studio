import { StudioCredits } from "@/templates/_kit/studio/site";
import photos from "@/templates/quiet-form/photos.json";
import { BASE } from "@/templates/quiet-form/site";

export const metadata = { title: "Image credits" };

export default function Page() {
  return <StudioCredits base={BASE} photos={photos} />;
}
