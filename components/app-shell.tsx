"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "대시보드", icon: "menu_book" },
  { href: "/posts/new", label: "기록 작성", icon: "edit_note" },
  { href: "/reviews", label: "후기", icon: "rate_review" },
  { href: "/book/builder", label: "책 만들기", icon: "auto_stories" },
  { href: "/admin", label: "관리자", icon: "inventory_2" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
        <Link href="/dashboard" className="font-headline-md text-headline-md text-primary">
          DuckLog
        </Link>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform">
            settings
          </span>
          <div className="w-10 h-10 rounded-full border-2 border-primary-fixed bg-secondary-container flex items-center justify-center font-label-caps text-on-secondary-container">
            G
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-container-padding-mobile md:px-container-padding-desktop paper-texture min-h-screen">
        <div className="max-w-[1120px] mx-auto">
          <nav className="flex items-center gap-2 flex-wrap mb-10">
            {NAV_ITEMS.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300 ${
                    active
                      ? "bg-secondary-container/50 text-on-secondary-container"
                      : "text-on-surface-variant hover:bg-surface-variant/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span className="font-body-md">{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/posts/new"
              className="ml-auto py-2 px-4 bg-primary text-on-primary rounded-full font-label-caps flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span> 새 기록 추가
            </Link>
          </nav>

          {children}
        </div>
      </main>

      <div className="fixed bottom-10 right-10 w-32 h-8 bg-tertiary/10 washi-tape rotate-12 -z-10 pointer-events-none opacity-50" />
      <div className="fixed top-40 left-10 w-24 h-6 bg-secondary/10 washi-tape -rotate-[25deg] -z-10 pointer-events-none opacity-50" />
    </div>
  );
}
