import { StudioSections } from "@/templates/_kit/studio/site";
import { Front } from "@/templates/fern-and-stone/edition";
import photos from "@/templates/fern-and-stone/photos.json";
import { BASE, site } from "@/templates/fern-and-stone/site";

export default function Page() {
  return <><Front /><StudioSections site={site} base={BASE} photos={photos} /></>;
}
