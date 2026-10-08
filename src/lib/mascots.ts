export const MASCOTS = [
  { id: "fox-pixel", name: { vi: "Cáo pixel", en: "Pixel fox" } },
  { id: "cat", name: { vi: "Mèo", en: "Cat" } },
  { id: "otter", name: { vi: "Rái cá", en: "Otter" } },
  { id: "panda", name: { vi: "Gấu trúc", en: "Panda" } },
  { id: "gearbot", name: { vi: "Robot", en: "Robot" } },
  { id: "astronaut", name: { vi: "Phi hành gia", en: "Astronaut" } },
  { id: "none", name: { vi: "Ẩn nhân vật", en: "Hide mascot" } },
] as const;

export type MascotId = (typeof MASCOTS)[number]["id"];
export const DEFAULT_MASCOT_ID: MascotId = "fox-pixel";

export function getMascot(id?: string | null) {
  return MASCOTS.find((mascot) => mascot.id === id) ?? MASCOTS[0];
}

export function getMascotSheets(id: Exclude<MascotId, "none">) {
  return {
    directions: `/mascots/${id}-directions.webp`,
    reactions: `/mascots/${id}-reactions.webp`,
  };
}
