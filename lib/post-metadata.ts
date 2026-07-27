export type EventType = "CONCERT" | "BIRTHDAY_CAFE" | "POPUP";
export type MatchResult = "WIN" | "LOSE" | "DRAW";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  CONCERT: "콘서트",
  BIRTHDAY_CAFE: "생일카페",
  POPUP: "팝업스토어",
};

export const MATCH_RESULT_LABELS: Record<MatchResult, string> = {
  WIN: "승",
  LOSE: "패",
  DRAW: "무",
};

export const MUSICAL_METADATA_FIELDS = [
  "showTitle",
  "seat",
  "cast",
  "viewRating",
  "soundRating",
] as const;

export const SPORTS_METADATA_FIELDS = [
  "stadium",
  "homeTeam",
  "awayTeam",
  "result",
  "score",
] as const;

export const IDOL_METADATA_FIELDS = ["eventType", "photocardUrl"] as const;

export const REVIEW_METADATA_FIELDS = ["subtitle", "seat", "passType", "highlights"] as const;

export type ReviewHighlight = {
  label: string;
  time?: string;
};

export type ReviewMetadata = {
  subtitle?: string;
  seat?: string;
  passType?: string;
  highlights?: ReviewHighlight[];
};
