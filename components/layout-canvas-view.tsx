import type { LayoutBlock } from "@/lib/layout-blocks";

function blockHeight(block: LayoutBlock) {
  return Math.max(block.height, block.y + block.height);
}

export function LayoutCanvasView({ blocks }: { blocks: LayoutBlock[] }) {
  if (blocks.length === 0) return null;

  const canvasHeight = blocks.reduce((max, b) => Math.max(max, blockHeight(b)), 0) + 40;

  return (
    <div className="relative w-full" style={{ height: canvasHeight }}>
      <div className="absolute -top-3 left-8 w-20 h-5 bg-secondary/20 washi-tape rotate-[-8deg] pointer-events-none z-0" />

      {blocks.map((block) => (
        <div
          key={block.id}
          className="absolute transition-transform duration-500 hover:!rotate-0"
          style={{
            left: block.x,
            top: block.y,
            width: block.width,
            height: block.height,
            transform: `rotate(${block.rotation}deg)`,
            zIndex: block.zIndex,
          }}
        >
          <BlockView block={block} />
        </div>
      ))}
    </div>
  );
}

function BlockView({ block }: { block: LayoutBlock }) {
  switch (block.type) {
    case "photo":
      return (
        <div className="w-full h-full bg-white p-3 pb-8 polaroid-shadow flex flex-col group">
          <div className="flex-1 bg-surface-container-high overflow-hidden">
            {block.url && (
              // external, user-submitted URLs — next/image would require allow-listing every domain
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={block.url}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            )}
          </div>
          {block.caption && (
            <p className="mt-3 text-center font-annotation-sm text-on-surface-variant uppercase tracking-widest">
              {block.caption}
            </p>
          )}
        </div>
      );
    case "text":
      return (
        <div className="w-full h-full bg-surface-container-high/60 backdrop-blur-sm border border-white/50 rounded-xl p-5 polaroid-shadow overflow-auto">
          {block.heading && (
            <h4 className="font-body-lg font-bold text-on-surface mb-1">{block.heading}</h4>
          )}
          <p className="font-annotation-sm text-on-surface-variant whitespace-pre-wrap">{block.body}</p>
        </div>
      );
    case "rating":
      return (
        <div className="w-full h-full bg-white rounded-xl polaroid-shadow flex flex-col items-center justify-center gap-1">
          <span className="text-2xl text-secondary">
            {(block.icon === "heart" ? "♥" : "★").repeat(Math.max(0, block.value))}
          </span>
          {block.label && (
            <span className="font-annotation-sm text-on-surface-variant uppercase tracking-widest">
              {block.label}
            </span>
          )}
        </div>
      );
    case "map":
      return (
        <div className="w-full h-full bg-surface-container rounded-xl polaroid-shadow flex flex-col items-center justify-center gap-1 text-center p-3 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.03)_0_10px,transparent_10px_20px)]">
          <span className="material-symbols-outlined text-secondary">location_on</span>
          {block.placeName && <span className="font-label-caps text-on-surface">{block.placeName}</span>}
          {block.coordinates && (
            <span className="font-annotation-sm text-on-surface-variant">{block.coordinates}</span>
          )}
        </div>
      );
    case "note":
      return (
        <div className="relative w-full h-full bg-secondary-fixed p-4 pt-6 rounded-lg polaroid-shadow flex items-center">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-secondary/30 washi-tape" />
          <p className="font-body-md text-on-secondary-fixed-variant italic whitespace-pre-wrap">
            {block.text}
          </p>
        </div>
      );
    case "hashtag":
      return (
        <div className="w-full h-full flex flex-wrap content-start gap-2 p-1">
          {block.tags
            .split(/[\s,]+/)
            .map((t) => t.trim())
            .filter(Boolean)
            .map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-secondary-container/60 text-on-secondary-container rounded-full font-label-caps text-xs hover:bg-secondary-container transition-colors"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
        </div>
      );
  }
}
