"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeliveryUrlForm({ orderItemId, initialUrl }: { orderItemId: string; initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <form className="mt-4 space-y-2" onSubmit={async event => {
      event.preventDefault();
      setBusy(true);
      setError("");
      setMessage("");
      try {
        const response = await fetch("/api/admin/deliveries", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderItemId, url }),
        });
        const result = await response.json();
        if (!response.ok) setError(result.error ?? "The live URL could not be saved.");
        else { setMessage("Live URL saved. Delivery will be emailed when the ZIP is ready."); router.refresh(); }
      } catch { setError("The live URL could not be saved. Try again."); }
      finally { setBusy(false); }
    }}>
      <label className="block text-sm font-medium">Live website URL
        <input type="url" required maxLength={2048} placeholder="https://your-client-site.example" value={url}
          onChange={event => setUrl(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-border px-3" />
      </label>
      <p className="text-xs text-muted-foreground">Confirm that this URL opens the customer’s deployed website.</p>
      <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Confirm live URL"}</Button>
      {message && <p role="status" className="text-sm">{message}</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
