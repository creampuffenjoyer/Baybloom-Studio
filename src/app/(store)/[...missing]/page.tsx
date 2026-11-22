import { notFound } from "next/navigation";

/** Sends unmatched URLs to (store)/not-found.tsx so they keep the site chrome. */
export default function Missing() {
  notFound();
}

// Always a 404, so there's no instant UI to validate.
export const instant = false;
