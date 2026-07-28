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
