export type BlockType = "photo" | "text" | "rating" | "map" | "note" | "hashtag";

type BaseBlock = {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
};

export type PhotoBlock = BaseBlock & {
  type: "photo";
  url: string;
  caption: string;
};

export type TextBlock = BaseBlock & {
  type: "text";
  heading: string;
  body: string;
};

export type RatingBlock = BaseBlock & {
  type: "rating";
  label: string;
  value: number;
  max: number;
  icon: "heart" | "star";
};

export type MapBlock = BaseBlock & {
  type: "map";
  placeName: string;
  coordinates: string;
};

export type NoteBlock = BaseBlock & {
  type: "note";
  text: string;
};

export type HashtagBlock = BaseBlock & {
  type: "hashtag";
  tags: string;
};

export type LayoutBlock = PhotoBlock | TextBlock | RatingBlock | MapBlock | NoteBlock | HashtagBlock;

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  photo: "사진",
  text: "텍스트",
  rating: "평점",
  map: "지도",
  note: "메모",
  hashtag: "해시태그",
};

function baseDefaults(zIndex: number): BaseBlock {
  const jitter = Math.floor(Math.random() * 40) - 20;
  return {
    id: `block-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type: "text",
    x: 40 + jitter,
    y: 40 + jitter,
    width: 240,
    height: 160,
    rotation: 0,
    zIndex,
  };
}

function randomRotation(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

export function createDefaultBlock(type: BlockType, zIndex: number): LayoutBlock {
  const base = { ...baseDefaults(zIndex), type };

  switch (type) {
    case "photo":
      return {
        ...base,
        type: "photo",
        width: 220,
        height: 260,
        url: "",
        caption: "",
        rotation: randomRotation(-4, -1),
      };
    case "text":
      return { ...base, type: "text", width: 260, height: 180, heading: "", body: "" };
    case "rating":
      return {
        ...base,
        type: "rating",
        width: 220,
        height: 100,
        label: "",
        value: 5,
        max: 5,
        icon: "heart",
      };
    case "map":
      return { ...base, type: "map", width: 220, height: 160, placeName: "", coordinates: "" };
    case "note":
      return { ...base, type: "note", width: 220, height: 160, text: "" };
    case "hashtag":
      return { ...base, type: "hashtag", width: 260, height: 80, tags: "" };
  }
}
