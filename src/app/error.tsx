"use client";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return <main className="mx-auto max-w-xl space-y-4 px-6 py-24" role="alert">
    <h1 className="font-serif text-3xl">We couldn’t load this page.</h1>
    <p>Please try again in a moment.</p>
    <button className="rounded-full border px-5 py-3" onClick={() => retry()}>Try again</button>
  </main>;
}
