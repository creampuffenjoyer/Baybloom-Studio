import { StudioSections } from "@/templates/_kit/studio/site";
import { Front } from "@/templates/common-room/edition";
import photos from "@/templates/common-room/photos.json";
import { BASE, site } from "@/templates/common-room/site";

export default function Page() {
  return <><Front /><StudioSections site={site} base={BASE} photos={photos} /></>;
}
