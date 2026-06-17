const ADJECTIVES = [
  "thunder",
  "cosmic",
  "sparkling",
  "brave",
  "silent",
  "swift",
  "golden",
  "mystic",
  "radiant",
  "stellar",
  "fierce",
  "gentle",
  "wild",
  "crimson",
  "azure",
  "frozen",
  "blazing",
  "shadow",
  "crystal",
  "electric",
  "lucky",
  "mighty",
  "nimble",
  "peaceful",
  "roaring",
  "shiny",
  "turbo",
  "velvet",
  "vivid",
  "zen",
] as const;

const NOUNS = [
  "avenger",
  "comet",
  "falcon",
  "sparkles",
  "nova",
  "phoenix",
  "rocket",
  "storm",
  "tiger",
  "wizard",
  "badger",
  "beacon",
  "dragon",
  "eagle",
  "galaxy",
  "horizon",
  "jaguar",
  "meteor",
  "nebula",
  "oracle",
  "panther",
  "pioneer",
  "quasar",
  "ranger",
  "sentinel",
  "shadow",
  "spark",
  "thunder",
  "voyager",
  "wolf",
] as const;

/** Short words (4–6 letters) used as join codes — independent of display name. */
const JOIN_CODE_WORDS = [...ADJECTIVES, ...NOUNS]
  .filter((word) => word.length >= 4 && word.length <= 6)
  .filter((word, index, words) => words.indexOf(word) === index);

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function toTitleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function formatSlugAsName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map(toTitleCase)
    .join(" ");
}

export function generatePrettyRoomName(): string {
  const adjective = pickRandom(ADJECTIVES);
  const noun = pickRandom(NOUNS);
  return `${toTitleCase(adjective)} ${toTitleCase(noun)}`;
}

export function generateJoinCode(): string {
  return pickRandom(JOIN_CODE_WORDS).toUpperCase();
}

export function generateRoomIdentity(): { code: string; name: string } {
  return {
    code: generateJoinCode(),
    name: generatePrettyRoomName(),
  };
}

export function displayRoomName(room: {
  name?: string | null;
  code: string;
}): string {
  if (room.name?.trim()) return room.name.trim();
  if (room.code.includes("-")) return formatSlugAsName(room.code);
  return room.code;
}
