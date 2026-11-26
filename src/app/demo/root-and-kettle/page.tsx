import { StudioSections } from "@/templates/_kit/studio/site";
import { Front } from "@/templates/root-and-kettle/edition";
import photos from "@/templates/root-and-kettle/photos.json";
import { BASE, site } from "@/templates/root-and-kettle/site";

export default function Page() {
  return <><Front /><StudioSections site={site} base={BASE} photos={photos} /></>;
}
