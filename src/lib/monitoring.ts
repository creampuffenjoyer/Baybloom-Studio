/** Deliberately accepts safe metadata only; never pass exception messages or bodies. */
export function reportEvent(event: string, fields: Record<string, string | number | boolean | undefined> = {}) {
  console.error(JSON.stringify({ event, time: new Date().toISOString(), ...fields }));
}
