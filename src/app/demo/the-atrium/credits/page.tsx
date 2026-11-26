import { PhotoCredits } from "@/templates/_kit/hospitality-site";
import photos from "@/templates/the-atrium/photos.json";

export const metadata = { title: "Photo credits" };

export default function Page() {
  return <PhotoCredits photos={photos} />;
}
