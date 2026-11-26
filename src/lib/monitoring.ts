/** Deliberately accepts safe metadata only; never pass exception messages or bodies. */
export function reportEvent(event: string, fields: Record<string, string | number | boolean | undefined> = {}) {
  // Request error hooks can run during prerendering, where Next.js tracks reads of the wall clock.
  const time = new Date(performance.timeOrigin + performance.now()).toISOString();
  console.error(JSON.stringify({ event, time, ...fields }));
}
