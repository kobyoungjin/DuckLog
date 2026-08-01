export type PostStyle = "DC" | "REVIEW" | "DIARY";

export const POST_STYLE_LABELS: Record<PostStyle, string> = {
  DC: "DC 스타일",
  REVIEW: "후기 스타일",
  DIARY: "다이어리 스타일",
};

export const POST_STYLE_LIST = Object.keys(POST_STYLE_LABELS) as PostStyle[];
