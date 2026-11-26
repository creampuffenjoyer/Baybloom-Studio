import { StudioSections } from "@/templates/_kit/studio/site";
import { Front } from "@/templates/afterglow-rental/edition";
import photos from "@/templates/afterglow-rental/photos.json";
import { BASE, site } from "@/templates/afterglow-rental/site";

export default function Page() {
  return <><Front /><StudioSections site={site} base={BASE} photos={photos} /></>;
}
