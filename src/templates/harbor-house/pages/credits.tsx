import { CreditsList } from "../../_kit/credits-list";
import photos from "../photos.json";

export function CreditsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 sm:px-8">
      <h1 className="font-t-display text-5xl">Photo credits</h1>
      <p className="mt-4 text-lg text-t-muted">The photographs on this site are used under the licences below.</p>
      <CreditsList photos={Object.values(photos)} className="mt-10 divide-y divide-t-line" />
    </div>
  );
}
