export type BookPage =
  | { id: string; type: "post"; postId: string }
  | { id: string; type: "photocards"; photocardIds: string[] };

export function isBookPageArray(value: unknown): value is BookPage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (p) =>
        p &&
        typeof p === "object" &&
        typeof p.id === "string" &&
        (p.type === "post"
          ? typeof p.postId === "string"
          : p.type === "photocards"
            ? Array.isArray(p.photocardIds) && p.photocardIds.every((id: unknown) => typeof id === "string")
            : false)
    )
  );
}

export function flattenPostIds(pages: BookPage[]): string[] {
  return pages.filter((p) => p.type === "post").map((p) => p.postId);
}

export function flattenPhotocardIds(pages: BookPage[]): string[] {
  return pages.filter((p) => p.type === "photocards").flatMap((p) => p.photocardIds);
}
