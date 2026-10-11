import { CreditsList } from "../../_kit/credits-list";
import { PageIntro } from "../components/page-intro";
import photos from "../photos.json";

export function CreditsPage() {
  return (
    <>
      <PageIntro title="Photo credits" lede="The photographs on this site are used under the licences below." />
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <CreditsList photos={Object.values(photos)} className="divide-y divide-t-line" />
      </div>
    </>
  );
}
