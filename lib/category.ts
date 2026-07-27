export type PostCategory = "IDOL" | "MUSICAL" | "SPORTS" | "GOODS" | "REVIEW";

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  IDOL: "아이돌",
  MUSICAL: "뮤지컬",
  SPORTS: "스포츠",
  GOODS: "굿즈",
  REVIEW: "후기",
};

export const CATEGORY_LIST = Object.keys(CATEGORY_LABELS) as PostCategory[];
