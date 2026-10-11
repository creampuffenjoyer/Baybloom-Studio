"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { isStayAvailable } from "./availability";
import { isDay, nightsBetween, type Day } from "./dates";

/*
 * Headless state for a room-booking flow: dates → room → guest details →
 * review → confirmation. Templates render their own UI on top of it.
 * Reads ?checkin=&checkout=&guests=&room= so other pages can deep-link in
 * (render inside <Suspense>).
 */

export type StayRoom = { slug: string; name: string; price: number; maxGuests: number };
export type StayExtra = { id: string; name: string; price: number; per: "stay" | "night" | "guest" };

export const STAY_STEPS = ["Dates", "Room", "Details", "Review"] as const;
export type StayStep = 0 | 1 | 2 | 3 | 4; // 4 = confirmed

export function useStayBooking<R extends StayRoom>(rooms: R[], extras: StayExtra[] = []) {
  const params = useSearchParams();
  const initialIn = params.get("checkin");
  const initialOut = params.get("checkout");
  const initialRoom = rooms.find((r) => r.slug === params.get("room")) ?? null;
  const hasDates = isDay(initialIn) && isDay(initialOut) && initialOut > initialIn;

  const [step, setStep] = useState<StayStep>(hasDates ? 1 : 0);
  const [checkIn, setCheckIn] = useState<Day | null>(hasDates ? initialIn : null);
  const [checkOut, setCheckOut] = useState<Day | null>(hasDates ? initialOut : null);
  const [guests, setGuests] = useState(() => {
    const n = Number(params.get("guests"));
    return Number.isInteger(n) && n > 0 && n <= 12 ? n : 2;
  });
  const [roomSlug, setRoomSlug] = useState<string | null>(initialRoom?.slug ?? null);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<string | null>(null);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const room = rooms.find((r) => r.slug === roomSlug) ?? null;

  const availability = useMemo(
    () =>
      Object.fromEntries(
        rooms.map((r) => [
          r.slug,
          !!checkIn && nights > 0 && r.maxGuests >= guests && isStayAvailable(r.slug, checkIn, nights),
        ]),
      ) as Record<string, boolean>,
    [rooms, checkIn, nights, guests],
  );

  const chosenExtras = extras.filter((e) => extraIds.includes(e.id));
  const extraCost = (e: StayExtra) =>
    e.per === "night" ? e.price * nights : e.per === "guest" ? e.price * guests : e.price;
  const roomTotal = room ? room.price * nights : 0;
  const extrasTotal = chosenExtras.reduce((s, e) => s + extraCost(e), 0);

  return {
    step,
    setStep,
    goTo: (s: StayStep) => setStep(s),
    checkIn,
    checkOut,
    setDates: (a: Day | null, b: Day | null) => {
      setCheckIn(a);
      setCheckOut(b);
    },
    nights,
    guests,
    setGuests,
    room,
    selectRoom: (slug: string) => setRoomSlug(slug),
    availability,
    extras,
    extraIds,
    toggleExtra: (id: string) =>
      setExtraIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])),
    extraCost,
    chosenExtras,
    details,
    setDetails,
    roomTotal,
    extrasTotal,
    total: roomTotal + extrasTotal,
    reference,
    confirm: (ref: string) => {
      setReference(ref);
      setStep(4);
    },
  };
}

export type StayBooking<R extends StayRoom = StayRoom> = ReturnType<typeof useStayBooking<R>>;
