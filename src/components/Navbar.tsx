export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a
          href="/"
          className="text-[15px] font-semibold tracking-tight text-foreground"
        >
          VibeSafe
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {["How it works", "Pricing", "Docs"].map((l) => (
            <a
              key={l}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-[var(--color-surface)]"
          >
            Sign in
          </button>
          <button
            onClick={() => {}}
            className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}
