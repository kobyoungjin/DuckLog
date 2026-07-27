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

export function ImageUploadField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="relative w-full h-full group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover rounded" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-error text-on-error text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-full min-h-[80px] border-2 border-dashed border-outline-variant rounded flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:bg-surface-variant/20 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">upload</span>
          <span className="font-annotation-sm">{uploading ? "업로드 중..." : "이미지 업로드"}</span>
        </button>
      )}

      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}
