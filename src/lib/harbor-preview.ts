export const HARBOR_BASE = "/demo/harbor-house";
export const HARBOR_PAGES = [
  ["", "Home"], ["/rooms", "Rooms"], ["/guide", "Local guide"],
  ["/book", "Sample booking"], ["/breakfast", "Breakfast"],
  ["/guestbook", "Guestbook"], ["/contact", "Contact"], ["/credits", "Photo credits"],
  ["/rooms/lighthouse-room", "Lighthouse Room"], ["/rooms/captains-room", "Captain’s Room"],
  ["/rooms/rose-room", "Rose Room"], ["/rooms/attic-twin", "Attic Twin"],
] as const;

export function harborPage(value: string | null) {
  return HARBOR_PAGES.some(([path]) => path === value) ? value! : "";
}
