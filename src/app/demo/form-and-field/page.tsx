import { StudioSections } from "@/templates/_kit/studio/site";
import { Front } from "@/templates/form-and-field/edition";
import photos from "@/templates/form-and-field/photos.json";
import { BASE, site } from "@/templates/form-and-field/site";

export default function Page() {
  return <><Front /><StudioSections site={site} base={BASE} photos={photos} /></>;
}
