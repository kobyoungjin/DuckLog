"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function PhotocardPositionPicker({
  imageUrl,
  stepLabel,
  onConfirm,
  onSkip,
}: {
  imageUrl: string;
  stepLabel?: string;
  onConfirm: (position: { positionX: number; positionY: number }) => void;
  onSkip: () => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const dragState = useRef<{
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragState.current;
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!drag || !frame || !img || !img.naturalWidth || !img.naturalHeight) return;

    const rect = frame.getBoundingClientRect();
    const scale = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
    const renderedW = img.naturalWidth * scale;
    const renderedH = img.naturalHeight * scale;
    const overflowX = Math.max(renderedW - rect.width, 1);
    const overflowY = Math.max(renderedH - rect.height, 1);

    const dx = e.clientX - drag.startClientX;
    const dy = e.clientY - drag.startClientY;

    setPosition({
      x: clamp(drag.startX - (dx / overflowX) * 100, 0, 100),
      y: clamp(drag.startY - (dy / overflowY) * 100, 0, 100),
    });
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragState.current) e.currentTarget.releasePointerCapture(e.pointerId);
    dragState.current = null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">사진 위치 조절</h2>
          {stepLabel && (
            <p className="font-annotation-sm text-on-surface-variant mt-0.5">{stepLabel}</p>
          )}
          <p className="font-annotation-sm text-on-surface-variant mt-1">
            사진을 드래그해서 카드에 보여질 부분을 골라주세요.
          </p>
        </div>

        <div
          ref={frameRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: "none" }}
          className="mx-auto w-48 aspect-[3/4] bg-surface-container-high rounded-lg overflow-hidden cursor-move select-none polaroid-shadow"
        >
          {/* external, user-submitted URL — next/image would require allow-listing every domain */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt=""
            draggable={false}
            className="w-full h-full object-cover pointer-events-none"
            style={{ objectPosition: `${position.x}% ${position.y}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="font-label-caps text-on-surface-variant hover:underline"
          >
            건너뛰기 (가운데로)
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ positionX: position.x, positionY: position.y })}
            className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-caps shadow-sm hover:brightness-110 active:scale-95 transition-all"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
