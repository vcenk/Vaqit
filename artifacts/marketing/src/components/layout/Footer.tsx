import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
              <div className="w-3 h-3 bg-primary rounded-sm" />
            </div>
            <span className="font-serif font-bold text-lg tracking-wide text-foreground">Vaqit</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            A quiet, premium prayer companion for practicing Muslims. Zero ads, zero tracking, zero compromise.
          </p>
        </div>
        
        <div className="flex gap-8">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/roadmap" className="text-sm text-muted-foreground hover:text-primary transition-colors">Roadmap</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy & Transparency</Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vaqit. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">
          Built for the community.
        </p>
      </div>
    </footer>
  );
}
