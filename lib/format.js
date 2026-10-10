// Цвета статусов и пометок. Подписи к ним лежат в словарях dictionaries/*.js.
export const STATUS_STYLE = {
  planned: { badge: "bg-planned-soft text-planned-text", tone: "#2d6cdf", ground: "#e6eefc" },
  building: { badge: "bg-building-soft text-building-text", tone: "#e2711d", ground: "#fcebdd" },
  completed: { badge: "bg-done-soft text-done-text", tone: "#2e9d6b", ground: "#e2f3ea" },
};

export const QUALITY_STYLE = {
  unverified: "bg-slate-100 text-slate-700",
  catalog: "bg-planned-soft text-planned-text",
  news: "bg-news-soft text-news-text",
  verified: "bg-done-soft text-done-text",
};

export const STATUS_KEYS = Object.keys(STATUS_STYLE);
export const QUALITY_KEYS = Object.keys(QUALITY_STYLE);
export const CLASS_KEYS = ["econom", "comfort", "comfort_plus", "business", "premium"];
