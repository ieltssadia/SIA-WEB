import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

type Crumb = { label: string; href?: string };

/**
 * Shared hero banner for inner pages — breadcrumb + serif title + subtitle
 * on the soft sage brand band with emerald accents.
 */
export function PageHeader({
  title,
  subtitle,
  crumbs = [],
}: {
  title: React.ReactNode;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="relative overflow-hidden border-b border-primary/10">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[360px] w-[360px] rounded-full bg-radial-glow blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-[320px] w-[320px] rounded-full bg-radial-glow blur-2xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:py-14 md:py-20 lg:px-8">
        <Reveal y={12}>
          <nav aria-label="Breadcrumb" className="mb-3 sm:mb-4 overflow-x-auto pb-1">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <li>
                <Link
                  href="#/"
                  className="transition-colors hover:text-primary"
                >
                  Home
                </Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-primary/50" aria-hidden />
                  {crumb.href ? (
                    <Link
                      href={`#${crumb.href}`}
                      className="transition-colors hover:text-primary"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-medium text-primary">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground break-words">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 sm:mt-4 max-w-2xl text-pretty leading-relaxed text-sm sm:text-base text-muted-foreground break-words">
              {subtitle}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
