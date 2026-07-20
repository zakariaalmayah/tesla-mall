import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function buildHref(basePath: string, params: URLSearchParams, page: number): string {
  const next = new URLSearchParams(params);
  if (page <= 1) {
    next.delete("page");
  } else {
    next.set("page", String(page));
  }
  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function CatalogPagination({
  basePath,
  searchParams,
  currentPage,
  totalPages,
}: {
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === "page" || value == null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
  });

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 py-8">
      <PageLink
        href={buildHref(basePath, params, Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronRight className="size-4 rtl:hidden" />
        <ChevronLeft className="size-4 ltr:hidden" />
      </PageLink>

      {pages.map((page, i) =>
        page === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <a
            key={page}
            href={buildHref(basePath, params, page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors",
              page === currentPage
                ? "bg-gold-gradient text-ink-950"
                : "text-foreground hover:bg-secondary hover:text-secondary-foreground",
            )}
          >
            {page}
          </a>
        ),
      )}

      <PageLink
        href={buildHref(basePath, params, Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronLeft className="size-4 rtl:hidden" />
        <ChevronRight className="size-4 ltr:hidden" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { disabled?: boolean }) {
  if (disabled) {
    return (
      <span className="flex size-10 items-center justify-center rounded-lg text-muted-foreground/30">
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      className="flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
      {...props}
    >
      {children}
    </a>
  );
}

function getVisiblePages(current: number, total: number): (number | "…")[] {
  const delta = 1;
  const range: (number | "…")[] = [];
  const rangeWithDots: (number | "…")[] = [];
  let last = 0;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (typeof i === "number") {
      if (last && i - last > 1) rangeWithDots.push("…");
      rangeWithDots.push(i);
      last = i;
    }
  }

  return rangeWithDots;
}
