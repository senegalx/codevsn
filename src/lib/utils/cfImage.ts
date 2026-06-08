export const cfImage = (
  url: string,
  { w = 640, h, fit = "fill", q = 80 }: { w?: number; h?: number; fit?: string; q?: number } = {}
): string => {
  if (!url) return "";
  const base = url.startsWith("//") ? `https:${url}` : url;
  const params = new URLSearchParams({ w: String(w), fm: "webp", q: String(q), fit });
  if (h) params.set("h", String(h));
  return `${base}?${params.toString()}`;
};
