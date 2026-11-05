"use client";
import { TripPlanner } from "../components/trip-planner";
import { usePine } from "../language";
export function ActivitiesPage() {
  const { t } = usePine();
  return <div className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
    <h1 className="font-tpl-display text-5xl font-bold sm:text-6xl">{t("Activities")}</h1>
    <p className="mt-4 max-w-2xl text-lg text-tpl-muted">{t("From first tracks to lakeside mornings. Plan around the season and the people coming with you.")}</p>
    <TripPlanner />
  </div>;
}
