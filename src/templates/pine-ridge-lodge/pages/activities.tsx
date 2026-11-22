"use client";
import { TripPlanner } from "../components/trip-planner";
import { usePine } from "../language";
import { usePersonalization } from "../personalization";
export function ActivitiesPage() {
  const { t } = usePine();
  const page = usePersonalization().pinePages?.activities;
  return <div className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
    <h1 className="font-tpl-display text-5xl font-bold sm:text-6xl">{page?.heading || t("Activities")}</h1>
    <p className="mt-4 max-w-2xl text-lg text-tpl-muted">{page?.intro || t("From first tracks to lakeside mornings. Plan around the season and the people coming with you.")}</p>
    <TripPlanner />
  </div>;
}
