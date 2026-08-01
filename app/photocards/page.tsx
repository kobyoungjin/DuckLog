"use client";

import { useEffect, useRef, useState } from "react";
import { PhotocardPositionPicker } from "@/components/photocard-position-picker";

type Photocard = {
  id: string;
  imageUrl: string;
  positionX: number;
  positionY: number;
  name: string | null;
  memo: string | null;
  createdAt: string;
};

export default function PhotocardsPage() {
  const [cards, setCards] = useState<Photocard[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [positioningQueue, setPositioningQueue] = useState<string[]>([]);
  const [positioningIndex, setPositioningIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/photocards")
      .then((res) => res.json())
      .then(setCards)
      .finally(() => setLoading(false));
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    const uploadedUrls: string[] = [];
    let failedCount = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });

      if (!uploadRes.ok) {
        failedCount++;
        continue;
      }

      const { url } = await uploadRes.json();
      uploadedUrls.push(url);
    }

    setUploading(false);

    if (failedCount > 0) {
      setError(`${failedCount}개 항목 업로드에 실패했습니다.`);
    }

    if (uploadedUrls.length > 0) {
      setPositioningQueue(uploadedUrls);
      setPositioningIndex(0);
    }
  }

  async function createPhotocard(imageUrl: string, positionX: number, positionY: number) {
    const res = await fetch("/api/photocards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, positionX, positionY, name }),
    });

    if (res.ok) {
      const created: Photocard = await res.json();
      setCards((prev) => [created, ...prev]);
    } else {
      setError("일부 항목 등록에 실패했습니다.");
    }
  }

  function advancePositioningQueue() {
    setPositioningIndex((i) => {
      if (i + 1 >= positioningQueue.length) {
        setPositioningQueue([]);
        setName("");
        return 0;
      }
      return i + 1;
    });
  }

  async function handlePositionConfirm(position: { positionX: number; positionY: number }) {
    const imageUrl = positioningQueue[positioningIndex];
    await createPhotocard(imageUrl, position.positionX, position.positionY);
    advancePositioningQueue();
  }

  async function handlePositionSkip() {
    const imageUrl = positioningQueue[positioningIndex];
    await createPhotocard(imageUrl, 50, 50);
    advancePositioningQueue();
  }

  async function handleDelete(id: string) {
    if (!confirm("이 포토카드를 삭제할까요?")) return;

    const res = await fetch(`/api/photocards/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCards((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <h1 className="font-headline-md text-headline-md text-primary">포토카드 갤러리</h1>
        <div className="h-[1px] flex-1 bg-outline-variant/40" />
        <span className="font-annotation-sm text-on-surface-variant">{cards.length}장</span>
      </div>

      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <input
          type="text"
          placeholder="멤버 이름 (선택)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-outline-variant rounded-lg px-3 py-2 bg-white font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-caps shadow-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
          {uploading ? "업로드 중..." : "포토카드 추가"}
        </button>
        {error && <p className="text-error text-sm">{error}</p>}
      </div>

      {loading ? (
        <p className="text-on-surface-variant">불러오는 중...</p>
      ) : cards.length === 0 ? (
        <p className="text-on-surface-variant">아직 등록된 포토카드가 없어요.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {cards.map((card, i) => (
            <div
              key={card.id}
              className={`bg-white p-2 pb-6 polaroid-shadow relative hover:rotate-0 transition-transform duration-300 ${
                i % 2 === 0 ? "rotated-left" : "rotated-right"
              }`}
            >
              <button
                type="button"
                onClick={() => handleDelete(card.id)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-on-error text-xs flex items-center justify-center z-10"
              >
                ✕
              </button>
              <div className="aspect-[3/4] bg-surface-container-high overflow-hidden">
                {/* external, user-submitted URLs — next/image would require allow-listing every domain */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `${card.positionX}% ${card.positionY}%` }}
                />
              </div>
              {card.name && (
                <p className="mt-2 text-center font-annotation-sm text-on-surface-variant">
                  {card.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {positioningQueue.length > 0 && (
        <PhotocardPositionPicker
          imageUrl={positioningQueue[positioningIndex]}
          stepLabel={
            positioningQueue.length > 1
              ? `${positioningIndex + 1} / ${positioningQueue.length}`
              : undefined
          }
          onConfirm={handlePositionConfirm}
          onSkip={handlePositionSkip}
        />
      )}
    </div>
  );
}
