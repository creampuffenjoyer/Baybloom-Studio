import { StudioCredits } from "@/templates/_kit/studio/site";
import photos from "@/templates/common-room/photos.json";
import { BASE } from "@/templates/common-room/site";

export const metadata = { title: "Image credits" };

export default function Page() {
  return <StudioCredits base={BASE} photos={photos} />;
}
