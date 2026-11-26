export type Weather = "clear" | "rain";
export type Pace = "slow" | "full";

export const weekendIdeas = {
  clear: [
    { time: "8:30 am", name: "Coffee on the veranda", note: "Pick up breakfast pastries the night before and take the first pot outside." },
    { time: "10 am", name: "A walk along the ridge", note: "Start before midday, take a light layer and pick a quiet stretch for photos." },
    { time: "12:30 pm", name: "Bulalo for the table", note: "Find a place that serves the soup in one large bowl and order rice to share." },
    { time: "3 pm", name: "Pick up a market basket", note: "Grab fruit, bread and coffee for an easy second breakfast at the house." },
  ],
  rain: [
    { time: "9 am", name: "Slow breakfast indoors", note: "Keep the coffee going and set out bread, fruit and eggs for whoever is awake." },
    { time: "11 am", name: "Find a covered market", note: "Leave time to browse local produce, and bring a tote for the trip back." },
    { time: "1 pm", name: "A warm lunch stop", note: "Share a bowl of soup and wait out the rain before heading back." },
    { time: "3:30 pm", name: "Games around the long table", note: "Pick a quick card game and put the market snacks out between rounds." },
  ],
} as const;
