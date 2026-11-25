export type EditorStep = "name" | "color" | "photos" | "save" | "review" | "packages";
export type TutorialProgress = {
  slug?: string;
  discovery?: { stage: "business" | "lodging" | "match"; slug?: string };
  preview?: "edit";
  editor?: EditorStep;
  packages?: "pricing";
};

const key = "baybloom.tutorial.v1";
let current: TutorialProgress | null = null;

export function readTutorial() {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) as TutorialProgress : null;
  } catch {
    return current;
  }
}

export function writeTutorial(progress: TutorialProgress | null) {
  current = progress;
  try {
    if (progress) sessionStorage.setItem(key, JSON.stringify(progress));
    else sessionStorage.removeItem(key);
  } catch {}
}
