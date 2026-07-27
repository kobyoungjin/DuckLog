import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-6 bg-secondary/20 washi-tape rotate-[-6deg]" />
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary italic">
        DuckLog
      </h1>
      <p className="mt-4 font-body-lg text-body-lg text-on-surface-variant scribble-underline inline-block">
        팬덤 기록을 책으로 만드는 서비스
      </p>
      <Link
        href="/dashboard"
        className="mt-8 px-6 py-2 rounded-lg bg-primary text-on-primary font-label-caps shadow-sm hover:brightness-110 active:scale-95 transition-all"
      >
        대시보드로 이동
      </Link>
    </div>
  );
}
