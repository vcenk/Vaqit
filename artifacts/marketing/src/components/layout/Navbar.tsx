import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();

  const isHome = location === "/";
  const isRoadmap = location === "/roadmap";
  const isPrivacy = location === "/privacy";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
            <div className="w-4 h-4 bg-primary rounded-sm" />
          </div>
          <span className="font-serif font-bold text-xl tracking-wide text-foreground">Vaqit</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/roadmap"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isRoadmap ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Roadmap
          </Link>
          <Link
            href="/privacy"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isPrivacy ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Privacy
          </Link>
          <a
            href="#waitlist"
            className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Join Waitlist
          </a>
        </nav>
      </div>
    </header>
  );
}
