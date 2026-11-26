import { StudioSections } from "@/templates/_kit/studio/site";
import { Front } from "@/templates/quiet-form/edition";
import photos from "@/templates/quiet-form/photos.json";
import { BASE, site } from "@/templates/quiet-form/site";

export default function Page() {
  return <><Front /><StudioSections site={site} base={BASE} photos={photos} /></>;
}
