"use client";

import { useRef, useState } from "react";

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "업로드에 실패했습니다.");
  }
  const data = await res.json();
  return data.url as string;
}

export function MultiImageUploadField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      try {
        uploaded.push(await uploadFile(file));
      } catch (err) {
        setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
      }
    }

    setUploading(false);
    if (uploaded.length > 0) onChange([...value, ...uploaded]);
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value.map((url) => (
          <div key={url} className="relative aspect-square rounded overflow-hidden border border-outline-variant group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-error text-on-error text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square border-2 border-dashed border-outline-variant rounded flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:bg-surface-variant/20 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">add_photo_alternate</span>
          <span className="font-annotation-sm text-xs">{uploading ? "업로드 중..." : "추가"}</span>
        </button>
      </div>

      {error && <p className="text-error text-xs mt-2">{error}</p>}
    </div>
  );
}
