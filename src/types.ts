/** Westeros Codex — domain types */

export type Region =
  | "The North"
  | "The Westerlands"
  | "The Riverlands"
  | "The Vale"
  | "The Stormlands"
  | "The Reach"
  | "Dorne"
  | "The Iron Islands"
  | "The Crownlands"
  | "Essos"
  | "Beyond the Wall";

export type Faction =
  | "House Stark"
  | "House Lannister"
  | "House Targaryen"
  | "House Baratheon"
  | "House Tyrell"
  | "House Greyjoy"
  | "House Tully"
  | "House Bolton"
  | "House Clegane"
  | "Night's Watch"
  | "Free Folk"
  | "Brotherhood Without Banners"
  | "Faceless Men"
  | "The Crown"
  | "Army of the Dead";

export type Alignment =
  | "Lawful Honor"
  | "Pragmatic Survivor"
  | "Ruthless Ambition"
  | "Chaotic Schemer"
  | "Vengeful Justice"
  | "Protective Loyalty"
  | "Cold Entropy";

export type LifeStatus = "Alive" | "Deceased" | "Resurrected" | "Transformed";

export type RelationshipKind =
  | "family"
  | "spouse"
  | "lover"
  | "mentor"
  | "apprentice"
  | "ally"
  | "rival"
  | "enemy"
  | "killer-of"
  | "killed-by"
  | "sworn-to";

export interface Relationship {
  /** id of the related character (must exist in the database) */
  targetId: string;
  kind: RelationshipKind;
  /** short lore note, e.g. "Pushed him from the Broken Tower" */
  note: string;
}

export interface TimelineEvent {
  /** Season.Episode marker, e.g. "S1E9"; "PRE" for pre-series lore */
  marker: string;
  /** era bucket used by the global Timeline component */
  era: Era;
  title: string;
  description: string;
  /** pivotal events get highlighted on the timeline */
  pivotal: boolean;
}

export type Era =
  | "Before the Series"
  | "S1 — The Wolf and the Lion"
  | "S2 — Clash of Kings"
  | "S3 — Red Wedding Era"
  | "S4 — Lion's Fall"
  | "S5 — Faith and Fire"
  | "S6 — Winds of Winter"
  | "S7 — The Great War Begins"
  | "S8 — The Last War";

export interface CharacterStats {
  /** 0–100 quantified attribute meters */
  combat: number;
  intellect: number;
  loyalty: number;
  influence: number;
  survivability: number;
  moralCompass: number;
  /** raw metadata */
  screenTimeMinutes: number;
  episodeCount: number;
  debutYear: number;
  debutEpisode: string;
  namedKills: number;
  loreMilestones: number;
}

export interface PhysicalTraits {
  hair: string;
  eyes: string;
  build: string;
  distinguishing: string;
}

export interface Character {
  id: string;
  name: string;
  aliases: string[];
  titles: string[];
  house: Faction;
  /** additional sworn or adopted factions */
  affiliations: Faction[];
  origin: Region;
  seat: string;
  alignment: Alignment;
  status: LifeStatus;
  causeOfDeath?: string;
  actor: string;
  firstAppearance: { season: number; episode: number; title: string };
  physical: PhysicalTraits;
  /** long-form, multi-paragraph biography */
  biography: string[];
  /** signature quote */
  quote: string;
  stats: CharacterStats;
  relationships: Relationship[];
  timeline: TimelineEvent[];
  trivia: string[];
  /** keywords that should surface this character in fuzzy search */
  keywords: string[];
  /** emoji sigil used as visual avatar */
  sigil: string;
  /** accent for theming the card: amber | cerulean | blood | verdant */
  accent: "amber" | "cerulean" | "blood" | "verdant";
}

export interface FilterState {
  query: string;
  factions: Faction[];
  origins: Region[];
  alignments: Alignment[];
  statuses: LifeStatus[];
  debutSeason: number | null;
  hairColor: string | null;
}

export const ERAS: Era[] = [
  "Before the Series",
  "S1 — The Wolf and the Lion",
  "S2 — Clash of Kings",
  "S3 — Red Wedding Era",
  "S4 — Lion's Fall",
  "S5 — Faith and Fire",
  "S6 — Winds of Winter",
  "S7 — The Great War Begins",
  "S8 — The Last War",
];
