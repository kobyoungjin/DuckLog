"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full border border-outline-variant rounded-lg px-3 py-2 bg-white text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";
const labelClass = "block font-label-caps text-on-surface-variant mb-2";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "로그인에 실패했습니다.");
      setSubmitting(false);
      return;
    }

    const from = new URLSearchParams(window.location.search).get("from");
    router.push(from ?? "/admin");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="text-center mb-8">
        <h1 className="font-headline-md text-headline-md text-primary">관리자 로그인</h1>
        <p className="font-annotation-sm text-on-surface-variant mt-1">
          관리자 계정으로만 접근할 수 있어요.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-8 rounded-xl polaroid-shadow"
      >
        <div>
          <label className={labelClass}>아이디</label>
          <input
            type="text"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>비밀번호</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-2 rounded-lg bg-primary text-on-primary font-label-caps shadow-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {submitting ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
