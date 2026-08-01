"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: "menu_book" },
  { href: "/reviews", label: "기록", icon: "history_edu" },
  { href: "/photocards", label: "포토카드", icon: "collections" },
  { href: "/book/builder", label: "책 만들기", icon: "auto_stories" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
        <Link href="/" className="font-headline-md text-headline-md text-primary">
          DuckLog
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">account_circle</span>
            <span className="hidden sm:inline font-body-md text-sm">마이페이지</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            <span className="hidden sm:inline font-body-md text-sm">관리자모드</span>
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-12 px-container-padding-mobile md:px-container-padding-desktop paper-texture min-h-screen">
        <div className="max-w-[1120px] mx-auto">
          {!isAdmin && (
            <nav className="flex items-center gap-2 overflow-x-auto md:flex-wrap mb-10 pb-1 -mx-1 px-1">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 whitespace-nowrap transition-all duration-300 ${
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
                className="flex-shrink-0 whitespace-nowrap md:ml-auto py-2 px-4 bg-primary text-on-primary rounded-full font-label-caps flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span> 새 기록 추가
              </Link>
            </nav>
          )}

          {children}
        </div>
      </main>

      <div className="fixed bottom-10 right-10 w-32 h-8 bg-tertiary/10 washi-tape rotate-12 -z-10 pointer-events-none opacity-50" />
      <div className="fixed top-40 left-10 w-24 h-6 bg-secondary/10 washi-tape -rotate-[25deg] -z-10 pointer-events-none opacity-50" />
    </div>
  );
}
