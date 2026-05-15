import { TopNavBar } from "@/components/layout/top-nav-bar";
import { PublicFooter } from "@/components/layout/public-footer";

export function MarketingPageShell({ eyebrow, title, subtitle, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/[0.04] rounded-full blur-[140px] -z-10" />

      <TopNavBar />

      <main className="flex-1 w-full">
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
            {subtitle && (
              <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </section>

        <section className="w-full max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {children}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
