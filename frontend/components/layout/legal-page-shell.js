import Link from "next/link";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { PublicFooter } from "@/components/layout/public-footer";

export function LegalPageShell({ title, eyebrow, lastUpdated, children, sections }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <TopNavBar />

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="w-full max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
            {eyebrow && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                {eyebrow}
              </span>
            )}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-sm text-on-surface-variant">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>
        </section>

        {/* Body */}
        <section className="w-full max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {sections && sections.length > 0 && (
            <aside className="lg:col-span-3 hidden lg:block">
              <nav className="sticky top-24 flex flex-col gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 px-3 mb-2">
                  On this page
                </p>
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-sm text-on-surface-variant hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </aside>
          )}

          <article className="lg:col-span-9 prose-invert max-w-none">
            <div className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] border-white/5 p-6 sm:p-10 lg:p-12 flex flex-col gap-8 text-on-surface-variant leading-relaxed">
              {children}
            </div>
          </article>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export function LegalSection({ id, title, children }) {
  return (
    <section id={id} className="flex flex-col gap-3 scroll-mt-28">
      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-sm sm:text-base text-on-surface-variant leading-relaxed">
        {children}
      </div>
    </section>
  );
}
