import { GiftCardForm } from "../components/gift-card-form";

export function GiftCardsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-16 pb-24 sm:px-8">
      <h1 className="font-tpl-display text-6xl leading-none sm:text-8xl">Gift cards</h1>
      <p className="mt-5 max-w-[52ch] text-lg text-tpl-muted">
        Sent by email, on the day you choose. Good for food, drinks and private dining for twelve months.
      </p>
      <div className="mt-14">
        <GiftCardForm />
      </div>
    </div>
  );
}
