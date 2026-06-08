export const CATEGORY_COLORS = ["#24A1FF", "#7B5AFF", "#FDC528", "#FF5874", "#12E189", "#E545FF"];

export const colorForCategory = (cat: string, categories: string[]): string =>
  CATEGORY_COLORS[categories.indexOf(cat) % CATEGORY_COLORS.length] || "#24A1FF";

export const mainCategory = (cat: string | string[]): string =>
  (Array.isArray(cat) ? cat[0] : cat) || "";
