import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
};

const BEFORE = `create policy "Public read access"
on public.profiles
for select
using ( true );`;

const AFTER = `create policy "Users read own profile"
on public.profiles
for select
using ( auth.uid() = user_id );`;

export default function FixModal({ open, onClose, title }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "#00000066" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[600px] rounded-lg border bg-background"
        style={{ borderColor: "#E4E4E7" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <h2 className="text-[16px] font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-foreground transition-opacity hover:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="px-5 pt-2 text-[14px] text-muted-foreground">
          Your policy allows anyone to read every row in the table. Restrict it
          so users can only read their own data by checking the authenticated
          user's id.
        </p>

        {/* Diff */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-2 gap-3 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <div>Before</div>
            <div>After</div>
          </div>
          <div className="grid grid-cols-2 gap-3 font-mono text-[13px] leading-relaxed">
            <pre
              className="overflow-x-auto rounded-sm p-3"
              style={{ backgroundColor: "#FEF2F2", borderLeft: "2px solid #DC2626" }}
            >
              {BEFORE}
            </pre>
            <pre
              className="overflow-x-auto rounded-sm p-3"
              style={{ backgroundColor: "#F0FDF4", borderLeft: "2px solid #16A34A" }}
            >
              {AFTER}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-border px-5 py-4">
          <button
            onClick={() => {}}
            className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Copy fix
          </button>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-[var(--color-surface)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
