"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function RichTextEditor({
  initialValue,
  onChange,
}: {
  initialValue: string;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue || "";
    }
    // only seed the editor once on mount — re-applying on every keystroke would reset the cursor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  }

  function handleInput() {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  function handleImageButton() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);

    if (res.ok) {
      const data = await res.json();
      exec(
        "insertHTML",
        `<img src="${data.url}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`
      );
    }
  }

  return (
    <div className="border border-outline-variant rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-outline-variant bg-surface-container-low px-2 py-1.5">
        <ToolbarButton onClick={() => exec("bold")} label="굵게">
          <b>B</b>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} label="기울임">
          <i>I</i>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} label="밑줄">
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("strikeThrough")} label="취소선">
          <s>S</s>
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => exec("fontSize", "4")} label="글자 크게">
          A+
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("fontSize", "2")} label="글자 작게">
          A-
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => exec("justifyLeft")} label="왼쪽 정렬">
          <span className="material-symbols-outlined text-base">format_align_left</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("justifyCenter")} label="가운데 정렬">
          <span className="material-symbols-outlined text-base">format_align_center</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("justifyRight")} label="오른쪽 정렬">
          <span className="material-symbols-outlined text-base">format_align_right</span>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => {
            const url = prompt("링크 주소를 입력하세요");
            if (url) exec("createLink", url);
          }}
          label="링크"
        >
          <span className="material-symbols-outlined text-base">link</span>
        </ToolbarButton>
        <ToolbarButton onClick={handleImageButton} label="이미지" disabled={uploading}>
          <span className="material-symbols-outlined text-base">image</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertHorizontalRule")} label="구분선">
          <span className="material-symbols-outlined text-base">horizontal_rule</span>
        </ToolbarButton>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[280px] p-4 font-body-md text-on-surface outline-none [&_img]:max-w-full [&_a]:text-secondary [&_a]:underline"
        suppressContentEditableWarning
      />
    </div>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-outline-variant mx-1" />;
}

function ToolbarButton({
  children,
  onClick,
  label,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-variant/50 text-on-surface-variant text-sm disabled:opacity-50"
    >
      {children}
    </button>
  );
}
