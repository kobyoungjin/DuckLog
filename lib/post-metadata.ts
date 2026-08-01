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

export type DiaryRating = {
  label: string;
  value: number;
  max?: number;
  icon?: "star" | "favorite" | "palette";
};

export type DiaryMetadata = {
  subtitle?: string;
  location?: string;
  ratings?: DiaryRating[];
  note?: string;
  tags?: string[];
};
