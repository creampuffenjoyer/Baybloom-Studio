import type { ReactElement } from "react";
import { MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { STUDIO_EMAIL, STUDIO_EMAIL_HREF } from "@/lib/checkout-methods";

export function OrderContactDialog({ children, subject, details }: {
  children: ReactElement;
  subject: string;
  details?: string;
}) {
  const body = ["Hi Baybloom Studio,", "", "I'd like to proceed with this order.", details ?? ""].join("\n");
  const emailHref = `${STUDIO_EMAIL_HREF}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Continue your order by email</DialogTitle>
          <DialogDescription>
            Stripe and GCash payments are still in development. Email Baybloom Studio to confirm your order and arrange payment.
          </DialogDescription>
        </DialogHeader>
        <Button asChild className="min-h-11 w-fit max-w-full">
          <a href={emailHref}><MailIcon aria-hidden />{STUDIO_EMAIL}</a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
