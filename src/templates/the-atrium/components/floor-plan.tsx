import type { Arrangement } from "../content";
import { getArrangement } from "../plan";

export function FloorPlan({ setup, room }: { setup: Arrangement; room: string }) {
  const arrangement = getArrangement(setup);
  const tiles = setup === "ceremony" ? 40 : setup === "dinner" ? 12 : 9;

  return (
    <figure className="at-floor-plan" data-setup={setup}>
      <div className="at-floor-diagram" aria-hidden="true">
        <span className="at-floor-label">{setup === "ceremony" ? "Altar or stage" : setup === "dinner" ? "Head table" : "Bar and service"}</span>
        <div className="at-floor-marks">{Array.from({ length: tiles }, (_, i) => <i key={i} />)}</div>
        <span className="at-floor-label">Entrance</span>
      </div>
      <figcaption><strong>{arrangement.label} · {room}</strong><p>{arrangement.detail} Illustrative layout. The venue confirms the final floor plan.</p></figcaption>
    </figure>
  );
}
