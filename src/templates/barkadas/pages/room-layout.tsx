import type { Stay } from "../content";
import { bedLabel } from "../group";

export function RoomLayout({ stay }: { stay: Stay }) {
  return (
    <ul className="bk-room-layout" aria-label="Bedrooms and beds">
      {stay.rooms.map((room) => <li key={room.name}><strong>{room.name}</strong><span>{bedLabel(room)}</span></li>)}
    </ul>
  );
}
