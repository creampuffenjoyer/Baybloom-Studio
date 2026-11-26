"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { themeStyle } from "../_kit/theme";
import { body, display } from "./fonts";
import { afterDarkTheme, theme } from "./site";

type Mode = "day" | "night";
type ModeSelection = { mode: Mode; setMode: (mode: Mode) => void };
const ModeContext = createContext<ModeSelection>({ mode: "day", setMode: () => {} });
const subscribe = () => () => {};
const initialMode = () => "day" as const;

function savedMode(): Mode {
  try { return sessionStorage.getItem("atrium-mode") === "night" ? "night" : "day"; }
  catch { return "day"; }
}

export function useAtriumMode() {
  return useContext(ModeContext);
}

export function ModeFrame({ children }: { children: ReactNode }) {
  const persisted = useSyncExternalStore(subscribe, savedMode, initialMode);
  const [choice, choose] = useState<Mode>();
  const mode = choice ?? persisted;

  function setMode(next: Mode) {
    choose(next);
    try { sessionStorage.setItem("atrium-mode", next); }
    catch { /* The current page still keeps its selected mode. */ }
  }

  return <ModeContext value={{ mode, setMode }}><div className="at-site" data-template="the-atrium" data-mode={mode} style={themeStyle(mode === "night" ? afterDarkTheme : theme, { display, body })}>{children}</div></ModeContext>;
}

export function ModeSwitch({ label = "Venue lighting" }: { label?: string }) {
  const { mode, setMode } = useAtriumMode();
  return <div className="at-mode" role="group" aria-label={label}>
    <button type="button" aria-pressed={mode === "day"} onClick={() => setMode("day")}>Daylight</button>
    <button type="button" aria-pressed={mode === "night"} onClick={() => setMode("night")}>After dark</button>
  </div>;
}
