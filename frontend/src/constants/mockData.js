export const MOCK_INGREDIENTS = [
  {
    id: 1,
    name: "Maltodextrin",
    description: "A thickener and filler commonly found in processed foods. It has a high glycemic index and can cause blood sugar spikes.",
    safety_level: "Code Yellow",
    category: "Additive"
  },
  {
    id: 2,
    name: "Ascorbic Acid",
    description: "Also known as Vitamin C. Used as a preservative to prevent spoilage and color changes.",
    safety_level: "Code Green",
    category: "Preservative"
  },
  {
    id: 3,
    name: "Red 40",
    description: "Artificial food dye. Some studies suggest a link to hyperactivity in children.",
    safety_level: "Code Red",
    category: "Colorant"
  }
];

export const MOCK_CHAT_HISTORY = [
  {
    id: "chat_1",
    date: "2024-05-20",
    preview: "What is Maltodextrin?",
    messages: [
      { role: "user", content: "What is Maltodextrin?" },
      { role: "ai", content: "Maltodextrin is a thickener and filler..." }
    ]
  },
  {
    id: "chat_2",
    date: "2024-05-19",
    preview: "Is Red 40 safe?",
    messages: [
      { role: "user", content: "Is Red 40 safe?" },
      { role: "ai", content: "Red 40 is an artificial food dye..." }
    ]
  }
];
