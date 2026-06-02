import type { GeneratedImage } from "./imageGenerators/types";

interface ArasaacPictogram {
  _id: number;
  keywords?: Array<{ keyword: string }>;
}

export async function findArasaacImage(word: string, locale = "en"): Promise<GeneratedImage | null> {
  const query = encodeURIComponent(word.trim().split(/\s+/)[0]);
  if (!query) return null;

  const response = await fetch(`https://api.arasaac.org/v1/pictograms/${locale}/search/${query}`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) return null;
  const results = (await response.json()) as ArasaacPictogram[];
  const first = results[0];
  if (!first?._id) return null;

  return {
    url: `https://static.arasaac.org/pictograms/${first._id}/${first._id}_300.png`,
    source: "arasaac",
    format: "png",
    isAnimated: false,
  };
}
