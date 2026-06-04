import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="text-[15px] font-semibold tracking-tight text-foreground">
          VibeSafe
        </Link>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <div className="h-7 w-24 animate-pulse rounded-md bg-[var(--color-surface)]" />
          ) : isSignedIn ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-[var(--color-surface)]"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-[var(--color-surface)]">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:opacity-90">
                  Get started
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
