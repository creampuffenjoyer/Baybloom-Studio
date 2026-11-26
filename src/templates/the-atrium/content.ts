export const arrangements = [
  { id: "ceremony", label: "Ceremony", detail: "Rows of chairs with an open center aisle and a focal point at the far end." },
  { id: "dinner", label: "Seated dinner", detail: "Round tables with room for service and a clear path through the center." },
  { id: "reception", label: "Standing reception", detail: "Cocktail tables and open circulation between a welcome point and a bar." },
] as const;

export type Arrangement = (typeof arrangements)[number]["id"];

export const spaces = [
  {
    id: "glasshouse", name: "The Glasshouse", photo: "glasshouseDay", shelter: "indoor", size: "340 m²",
    blurb: "A central aisle under repeating steel arches. Garden doors give the room a soft, open edge.",
    details: ["Covered and weather-protected", "Level entry from the lobby", "Vendor load-in from the side court"],
    capacity: { ceremony: 160, dinner: 120, reception: 180 },
  },
  {
    id: "gallery", name: "The Gallery", photo: "galleryRoom", shelter: "indoor", size: "155 m²",
    blurb: "A quieter room with a long bar, a garden-facing window and space for one long table or a small talk.",
    details: ["Covered and weather-protected", "Built-in bar", "Space for a presentation setup"],
    capacity: { ceremony: 80, dinner: 64, reception: 110 },
  },
  {
    id: "court", name: "The Garden Court", photo: "court", shelter: "outdoor", size: "205 m²",
    blurb: "A walled garden for outdoor vows, a standing welcome or long tables under the trees.",
    details: ["Open air", "Level path to the Glasshouse", "Indoor backup is arranged separately"],
    capacity: { ceremony: 100, dinner: 70, reception: 120 },
  },
] as const;

export type Space = (typeof spaces)[number];

export const events = [
  { id: "wedding", label: "Wedding", title: "Vows into dinner", photo: "reception", arrangement: "ceremony", space: "glasshouse", guests: 115, description: "Walk the central aisle, head out for drinks, then return for dinner under the glass.", itinerary: ["Ceremony in the Glasshouse", "Cocktails in the Garden Court", "Dinner in the Glasshouse"] },
  { id: "gathering", label: "Private gathering", title: "A long table", photo: "court", arrangement: "dinner", space: "court", guests: 55, description: "Host a birthday, anniversary, or reunion with a long dinner and room for a few speeches.", itinerary: ["Welcome at the garden doors", "Seated dinner in the court", "Dessert and a toast"] },
  { id: "work", label: "Work event", title: "Space to think", photo: "galleryRoom", arrangement: "reception", space: "gallery", guests: 65, description: "Give a launch, team gathering, or exhibition a room with space to talk and move around.", itinerary: ["Arrival and coffee at the bar", "Presentation or exhibition", "Drinks and conversation"] },
] as const;

export const venueNotes = [
  { question: "Can we hold an outdoor event?", answer: "Yes. The Garden Court is open air. Ask for an indoor backup in your inquiry. The event team confirms whether the backup can be held for your date." },
  { question: "Can we bring our vendors?", answer: "Share your vendor list and arrival times in the inquiry. The team can confirm load-in, sound, power, and cleanup requirements with you." },
  { question: "Can we visit first?", answer: "Choose a venue walkthrough when you inquire. The team will use your guest count and preferred setup to plan the visit." },
];
