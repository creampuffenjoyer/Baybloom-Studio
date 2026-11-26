import { StudioCredits } from "@/templates/_kit/studio/site";
import photos from "@/templates/form-and-field/photos.json";
import { BASE } from "@/templates/form-and-field/site";

export const metadata = { title: "Image credits" };

export default function Page() {
  return <StudioCredits base={BASE} photos={photos} />;
}
