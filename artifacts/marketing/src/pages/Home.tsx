import { Shield, Bell, MapPin, CheckCircle2, AlertTriangle, Search, Lock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WaitlistForm } from "@/components/WaitlistForm";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-32 md:pt-40 md:pb-48 overflow-hidden">
          <div className="absolute inset-0 z-0">
             {/* Fallback gradient if image doesn't load/exist */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
            <img 
              src="/marketing/hero-abstract.jpg" 
              alt="Deep navy to emerald abstract twilight" 
              className="w-full h-full object-cover opacity-30 mix-blend-screen"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
          </div>
          
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
              Free · Launching before Ramadan 2027
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-extrabold tracking-tight mb-6 animate-in slide-in-from-bottom-6 fade-in duration-1000 delay-150 fill-mode-both">
              Prayer alerts <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
                you can verify.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300 fill-mode-both">
              See <em className="not-italic text-foreground">why</em> each prayer time is what it is, whether it matches your mosque, and proof your next athan is actually scheduled. No ads. No tracking.
            </p>

            <div className="animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-500 fill-mode-both">
              <a
                href="#waitlist"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Request Early Access
              </a>
              <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> On-device by default · minimal, explained permissions
              </p>
            </div>
          </div>
        </section>

        {/* PROOF PILLAR 1: NOTIFICATIONS */}
        <section className="py-24 border-t border-border/50 relative overflow-hidden bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-6">
                  <Bell className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Know your athan is armed.</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Every other app shows a toggle and hopes. Vaqit shows you proof your next alerts are scheduled — and tells you exactly what to fix when your phone would silence them (Samsung battery saver, exact-alarm permission, Do Not Disturb).
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>A home-screen status shows your next scheduled athan — or a specific warning when action is needed.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>A Health Check with a delivery ledger and a shareable diagnostic — so a missed Fajr is explainable, not a mystery.</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2 bg-background border border-border rounded-2xl p-6 md:p-8 shadow-xl relative">
                {/* Mockup UI */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">F</div>
                      <div>
                        <div className="font-medium">Fajr</div>
                        <div className="text-sm text-muted-foreground">In 4 hours, 12 mins</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-lg">5:24 AM</div>
                      <div className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
                         <CheckCircle2 className="w-3 h-3" /> Next up
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">D</div>
                      <div>
                        <div className="font-medium">Dhuhr</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">1:15 PM</div>
                    </div>
                  </div>
                  <div className="mt-4 bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-primary">Alerts ready</div>
                      <div className="text-xs text-muted-foreground mt-1">Next scheduled: Fajr 5:24 AM. 5 upcoming alerts armed.</div>
                    </div>
                  </div>
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-accent shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-accent">Example warning</div>
                      <div className="text-xs text-muted-foreground mt-1">Android 12+: allow “Alarms &amp; reminders” so Fajr fires on the exact minute.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF PILLAR 2: ACCURACY */}
        <section className="py-24 border-t border-border/50 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <img 
                  src="/marketing/compass-abstract.jpg" 
                  alt="Abstract brass astrolabe on navy background" 
                  className="rounded-2xl shadow-2xl border border-border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="h-64 rounded-2xl bg-card border border-border flex items-center justify-center"><div class="w-24 h-24 rounded-full border-4 border-accent/30 border-t-accent animate-spin"></div></div>';
                  }}
                />
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Every time, explained. <br />Every estimate, labeled.</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Tap any prayer to see exactly how it was calculated — the method, the angle, and your own adjustments. And when your app disagrees with your mosque, Vaqit tells you which, and <em className="not-italic text-foreground">why</em>.
                </p>
                <p className="text-lg text-muted-foreground">
                  At high latitudes — Vancouver, London, northern Europe in summer — true Fajr and Isha sometimes can’t be observed at all. Most apps quietly invent a time. Vaqit labels it <span className="text-accent font-medium">Estimated</span> and names the rule it used. Honest beats confident-but-wrong.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF PILLAR 3: PRIVACY */}
        <section className="py-24 border-t border-border/50 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mb-8 mx-auto border border-destructive/30">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">No ads. No tracking. Honest about the rest.</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Worship shouldn’t come with ads or a data broker attached. Your location, prayer history, and settings stay on your device — and any optional online feature will clearly show what it sends before you use it.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 text-left">
              <div className="bg-background border border-border p-6 rounded-xl shadow-sm">
                <div className="font-bold text-foreground text-lg mb-2">On-device calculation</div>
                <p className="text-sm text-muted-foreground">Prayer times are computed mathematically on your phone — no prayer-time server, works fully offline.</p>
              </div>
              <div className="bg-background border border-border p-6 rounded-xl shadow-sm">
                <div className="font-bold text-foreground text-lg mb-2">Your location stays local</div>
                <p className="text-sm text-muted-foreground">Coordinates set your times and Qibla on-device. A manual-city option needs no location permission at all.</p>
              </div>
              <div className="bg-background border border-border p-6 rounded-xl shadow-sm">
                <div className="font-bold text-foreground text-lg mb-2">No ads, no data sale</div>
                <p className="text-sm text-muted-foreground">No advertising, no selling your data — ever. Minimal permissions, each explained before it’s asked.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 border-t border-border/50 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <WaitlistForm />
            
            <div className="mt-16 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
              {/* App Store Badge Placeholders */}
              <div className="bg-card border border-border rounded-lg h-12 px-4 flex items-center justify-center text-sm font-medium hover:border-primary/50 transition-colors cursor-not-allowed">
                Coming to App Store
              </div>
              <div className="bg-card border border-border rounded-lg h-12 px-4 flex items-center justify-center text-sm font-medium hover:border-primary/50 transition-colors cursor-not-allowed">
                Coming to Google Play
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
