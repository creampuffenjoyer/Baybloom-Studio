export const HARBOR_ROOM_IMAGE_KEYS = ["lighthouse-room", "captains-room", "rose-room", "attic-twin"] as const;
export type HarborRoomImageKey = typeof HARBOR_ROOM_IMAGE_KEYS[number];

export function isHarborRoomImageKey(value: string): value is HarborRoomImageKey {
  return (HARBOR_ROOM_IMAGE_KEYS as readonly string[]).includes(value);
}
