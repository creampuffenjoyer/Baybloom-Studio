import { StudioSections } from "@/templates/_kit/studio/site";
import { Front } from "@/templates/plane-and-light/edition";
import photos from "@/templates/plane-and-light/photos.json";
import { BASE, site } from "@/templates/plane-and-light/site";

export default function Page() {
  return <><Front /><StudioSections site={site} base={BASE} photos={photos} /></>;
}
