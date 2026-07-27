"use client";

import { useRef } from "react";
import {
  BLOCK_TYPE_LABELS,
  createDefaultBlock,
  type BlockType,
  type LayoutBlock,
} from "@/lib/layout-blocks";
import { ImageUploadField } from "@/components/image-upload-field";

type DragMode = "move" | "resize" | "rotate";

type DragState = {
  id: string;
  mode: DragMode;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origWidth: number;
  origHeight: number;
  centerX: number;
  centerY: number;
};

const MIN_SIZE = 80;

export function LayoutCanvasEditor({
  blocks,
  onChange,
}: {
  blocks: LayoutBlock[];
  onChange: (blocks: LayoutBlock[]) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  function updateBlock(id: string, patch: Record<string, unknown>) {
    onChange(
      blocksRef.current.map((b) => (b.id === id ? ({ ...b, ...patch } as LayoutBlock) : b))
    );
  }

  function addBlock(type: BlockType) {
    const maxZ = blocks.reduce((m, b) => Math.max(m, b.zIndex), 0);
    onChange([...blocks, createDefaultBlock(type, maxZ + 1)]);
  }

  function removeBlock(id: string) {
    onChange(blocksRef.current.filter((b) => b.id !== id));
  }

  function bringToFront(id: string) {
    const maxZ = blocksRef.current.reduce((m, b) => Math.max(m, b.zIndex), 0);
    updateBlock(id, { zIndex: maxZ + 1 });
  }

  function handlePointerMove(e: PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    const canvasEl = canvasRef.current;

    if (drag.mode === "move") {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const maxX = Math.max(0, (canvasEl?.clientWidth ?? Infinity) - drag.origWidth);
      const maxY = Math.max(0, (canvasEl?.clientHeight ?? Infinity) - drag.origHeight);
      updateBlock(drag.id, {
        x: Math.min(Math.max(0, drag.origX + dx), maxX),
        y: Math.min(Math.max(0, drag.origY + dy), maxY),
      });
    } else if (drag.mode === "resize") {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      updateBlock(drag.id, {
        width: Math.max(MIN_SIZE, drag.origWidth + dx),
        height: Math.max(MIN_SIZE, drag.origHeight + dy),
      });
    } else if (drag.mode === "rotate") {
      const angle = (Math.atan2(e.clientY - drag.centerY, e.clientX - drag.centerX) * 180) / Math.PI;
      updateBlock(drag.id, { rotation: Math.round(angle + 90) });
    }
  }

  function handlePointerUp() {
    dragRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }

  function startDrag(e: React.PointerEvent, block: LayoutBlock, mode: DragMode) {
    e.stopPropagation();
    e.preventDefault();
    const canvasRect = canvasRef.current?.getBoundingClientRect();

    dragRef.current = {
      id: block.id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origX: block.x,
      origY: block.y,
      origWidth: block.width,
      origHeight: block.height,
      centerX: (canvasRect?.left ?? 0) + block.x + block.width / 2,
      centerY: (canvasRect?.top ?? 0) + block.y + block.height / 2,
    };
    bringToFront(block.id);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {(Object.keys(BLOCK_TYPE_LABELS) as BlockType[]).map((type) => (
          <button
            type="button"
            key={type}
            onClick={() => addBlock(type)}
            className="px-3 py-1.5 text-sm font-label-caps border border-outline-variant rounded-full text-on-surface-variant hover:bg-surface-variant/40"
          >
            + {BLOCK_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div
        ref={canvasRef}
        className="relative w-full min-h-[500px] bg-surface-container-low rounded-xl border border-outline-variant"
      >
        {blocks.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-center px-8 font-annotation-sm text-on-surface-variant">
            위 버튼으로 블록을 추가하고, 자유롭게 드래그·크기조절·회전해서 꾸며보세요.
          </p>
        )}

        {blocks.map((block) => (
          <div
            key={block.id}
            className="absolute bg-white rounded-lg shadow-md border border-outline-variant/60 group"
            style={{
              left: block.x,
              top: block.y,
              width: block.width,
              height: block.height,
              transform: `rotate(${block.rotation}deg)`,
              zIndex: block.zIndex,
            }}
          >
            <button
              type="button"
              onClick={() => removeBlock(block.id)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-on-error text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
            >
              ✕
            </button>

            <div
              onPointerDown={(e) => startDrag(e, block, "move")}
              className="h-5 rounded-t-lg bg-outline-variant/30 flex items-center justify-center cursor-move"
            >
              <span className="text-[10px] text-on-surface-variant select-none">⠿⠿⠿</span>
            </div>

            <div className="p-2 overflow-hidden" style={{ height: "calc(100% - 20px)" }}>
              <BlockContent block={block} onUpdate={(patch) => updateBlock(block.id, patch)} />
            </div>

            <div
              onPointerDown={(e) => startDrag(e, block, "rotate")}
              className="absolute left-1/2 -top-6 -translate-x-1/2 w-4 h-4 rounded-full bg-primary cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
            />

            <div
              onPointerDown={(e) => startDrag(e, block, "resize")}
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity bg-primary rounded-tl"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockContent({
  block,
  onUpdate,
}: {
  block: LayoutBlock;
  onUpdate: (patch: Record<string, unknown>) => void;
}) {
  const fieldClass = "w-full outline-none bg-transparent";

  switch (block.type) {
    case "photo":
      return (
        <div className="w-full h-full flex flex-col gap-1">
          <ImageUploadField
            value={block.url}
            onChange={(url) => onUpdate({ url })}
            className="flex-1 min-h-0"
          />
          <input
            type="text"
            placeholder="캡션"
            defaultValue={block.caption}
            onBlur={(e) => onUpdate({ caption: e.target.value })}
            className={`${fieldClass} text-[11px] text-center`}
          />
        </div>
      );
    case "text":
      return (
        <div className="w-full h-full flex flex-col gap-1">
          <input
            type="text"
            placeholder="제목"
            defaultValue={block.heading}
            onBlur={(e) => onUpdate({ heading: e.target.value })}
            className={`${fieldClass} font-bold text-sm`}
          />
          <textarea
            placeholder="내용"
            defaultValue={block.body}
            onBlur={(e) => onUpdate({ body: e.target.value })}
            className={`${fieldClass} flex-1 text-xs resize-none`}
          />
        </div>
      );
    case "rating":
      return (
        <div className="w-full h-full flex flex-col gap-1 justify-center">
          <input
            type="text"
            placeholder="항목명 (예: 시야)"
            defaultValue={block.label}
            onBlur={(e) => onUpdate({ label: e.target.value })}
            className={`${fieldClass} text-xs font-bold`}
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={block.max}
              defaultValue={block.value}
              onBlur={(e) => onUpdate({ value: Number(e.target.value) })}
              className="w-12 text-xs border border-outline-variant rounded px-1"
            />
            <span className="text-sm text-secondary">
              {(block.icon === "heart" ? "♥" : "★").repeat(Math.max(0, block.value))}
            </span>
          </div>
        </div>
      );
    case "map":
      return (
        <div className="w-full h-full flex flex-col gap-1 justify-center items-center text-center bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.03)_0_10px,transparent_10px_20px)] rounded">
          <span className="material-symbols-outlined text-secondary">location_on</span>
          <input
            type="text"
            placeholder="장소명"
            defaultValue={block.placeName}
            onBlur={(e) => onUpdate({ placeName: e.target.value })}
            className={`${fieldClass} text-xs font-bold text-center`}
          />
          <input
            type="text"
            placeholder="좌표/주소 (선택)"
            defaultValue={block.coordinates}
            onBlur={(e) => onUpdate({ coordinates: e.target.value })}
            className={`${fieldClass} text-[10px] text-center`}
          />
        </div>
      );
    case "note":
      return (
        <textarea
          placeholder="메모를 남겨보세요"
          defaultValue={block.text}
          onBlur={(e) => onUpdate({ text: e.target.value })}
          className={`${fieldClass} h-full text-xs italic resize-none`}
        />
      );
    case "hashtag":
      return (
        <textarea
          placeholder="#해시태그 #공백으로_구분"
          defaultValue={block.tags}
          onBlur={(e) => onUpdate({ tags: e.target.value })}
          className={`${fieldClass} h-full text-xs resize-none`}
        />
      );
  }
}
