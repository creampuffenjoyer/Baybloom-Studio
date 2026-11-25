"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ResendProjectEmail({ orderItemId }: { orderItemId: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [queued, setQueued] = useState(false);

  async function resend() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/project-delivery/resend", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderItemId }),
      });
      const result = await response.json();
      if (response.ok) {
        setQueued(true);
        setMessage("A fresh link will be sent to your delivery email.");
      } else setMessage(result.error ?? "We couldn't resend the project email.");
    } catch { setMessage("We couldn't resend the project email. Try again."); }
    finally { setPending(false); }
  }

  return <div className="mt-3 print:hidden">
    <Button variant="outline" type="button" disabled={pending || queued} onClick={() => void resend()}>Email me a fresh ZIP link</Button>
    {message && <p role="status" className="mt-2 text-sm">{message}</p>}
  </div>;
}
