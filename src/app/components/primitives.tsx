import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/**
 * Minimal, shared loading placeholder for pages waiting on a service call.
 * Mock services resolve almost immediately, so in practice this renders
 * for a single frame — but the seam is real for when a service is backed
 * by an actual network call.
 */
export function PageLoading() {
  return (
    <div className="grid min-h-[40vh] place-items-center text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sa-magenta)]">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl md:text-4xl text-[var(--sa-ink)]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  children,
  className,
  title,
  action,
  eyebrow,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <section className={cx("rounded-2xl border border-border bg-card p-5 shadow-sm", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            {eyebrow && (
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {eyebrow}
              </div>
            )}
            {title && <h3 className="text-[var(--sa-ink)]">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function TrendChip({ delta, up }: { delta: string; up?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
        up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
      )}
    >
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {delta}
    </span>
  );
}

export function StatCard({
  label,
  value,
  delta,
  up,
  accent,
}: {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border p-4 shadow-sm transition-transform hover:-translate-y-0.5",
        accent
          ? "sa-gradient border-transparent text-white"
          : "border-border bg-card text-[var(--sa-ink)]",
      )}
    >
      <div className={cx("text-[11px] font-semibold uppercase tracking-[0.14em]", accent ? "text-white/80" : "text-muted-foreground")}>
        {label}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="font-display text-3xl leading-none">{value}</div>
        {delta &&
          (accent ? (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-semibold">{delta}</span>
          ) : (
            <TrendChip delta={delta} up={up} />
          ))}
      </div>
    </div>
  );
}

const insightColors: Record<string, string> = {
  OPPORTUNITY: "text-[var(--sa-magenta)] bg-[var(--sa-magenta)]/10",
  TREND: "text-[var(--sa-violet)] bg-[var(--sa-violet)]/10",
  COMMERCIAL: "text-emerald-600 bg-emerald-50",
  PERFORMANCE: "text-indigo-600 bg-indigo-50",
  RISK: "text-rose-600 bg-rose-50",
};

export function InsightCard({
  kind,
  title,
  body,
  cta,
  onAction,
}: {
  kind: string;
  title: string;
  body: string;
  cta?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-lg sa-gradient text-white">
          <Sparkles className="size-3.5" />
        </span>
        <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]", insightColors[kind] ?? insightColors.TREND)}>
          {kind}
        </span>
      </div>
      <div className="text-[var(--sa-ink)]" style={{ fontWeight: 600 }}>{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {cta && (
        <button
          onClick={onAction}
          className="mt-3 text-sm font-semibold text-[var(--sa-magenta)] hover:underline"
        >
          {cta} →
        </button>
      )}
    </div>
  );
}

export function Btn({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className,
  type,
  disabled,
  title,
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline" | "dark";
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  title?: string;
}) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50";
  const sizes = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm";
  const variants = {
    primary: "sa-gradient text-white hover:opacity-90 shadow-sm",
    dark: "bg-[var(--sa-ink)] text-white hover:bg-[var(--sa-violet)]",
    outline: "border border-border bg-card text-[var(--sa-ink)] hover:bg-muted",
    ghost: "text-[var(--sa-ink)] hover:bg-muted",
  }[variant];
  return (
    <button type={type ?? "button"} onClick={onClick} disabled={disabled} title={title} className={cx(base, sizes, variants, className)}>
      {children}
    </button>
  );
}

/** Standard text input, styled to match the rest of the prototype's forms. */
export function TextField({
  label,
  className,
  ...props
}: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>}
      <input
        {...props}
        className={cx(
          "w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--sa-magenta)]/40",
          className,
        )}
      />
    </label>
  );
}

/** Standard textarea, styled to match the rest of the prototype's forms. */
export function TextAreaField({
  label,
  className,
  ...props
}: { label?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>}
      <textarea
        {...props}
        className={cx(
          "w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--sa-magenta)]/40",
          className,
        )}
      />
    </label>
  );
}

/** Labeled select, styled to match the rest of the prototype's forms. */
export function SelectField({
  label,
  className,
  children,
  ...props
}: { label?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>}
      <select
        {...props}
        className={cx(
          "w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--sa-magenta)]/40",
          className,
        )}
      >
        {children}
      </select>
    </label>
  );
}

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "green" | "orange" | "red" | "violet" }) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-amber-50 text-amber-700",
    red: "bg-rose-50 text-rose-700",
    violet: "bg-[var(--sa-violet)]/10 text-[var(--sa-violet)]",
  }[tone];
  return <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", tones)}>{children}</span>;
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full sa-gradient font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

export function AvailabilityDot({ state }: { state: "green" | "orange" | "red" }) {
  const c = { green: "bg-emerald-500", orange: "bg-amber-500", red: "bg-rose-500" }[state];
  return <span className={cx("inline-block size-2.5 rounded-full", c)} />;
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cx("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full sa-gradient" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
