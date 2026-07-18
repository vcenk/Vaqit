import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, ServerOff, Database, Trash2, Smartphone } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 pb-24">
        <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 border-b border-border/50 bg-card/20">
          <div className="container mx-auto max-w-3xl">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
              Privacy & Transparency
            </h1>
            <p className="text-xl text-muted-foreground">
              Plain language. No lawyers. No loopholes. This is how we handle your data (we don't).
            </p>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-3xl">
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="lead text-xl">
                The 2020 data scandal where major Muslim prayer apps were caught selling user location data to military contractors broke trust. We built Vaqit because we believe a tool used for worship should never be a surveillance device.
              </p>

              <div className="my-12 grid sm:grid-cols-2 gap-6 not-prose">
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <ServerOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Zero Network Requests</h3>
                    <p className="text-sm text-muted-foreground">The app calculates prayer times mathematically on your device. It never asks a server for them.</p>
                  </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Local GPS Only</h3>
                    <p className="text-sm text-muted-foreground">Location is accessed locally to determine your coordinates. It never leaves your phone.</p>
                  </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">No Accounts</h3>
                    <p className="text-sm text-muted-foreground">There is no login, no signup, and no user ID. You are completely anonymous.</p>
                  </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Total Deletion</h3>
                    <p className="text-sm text-muted-foreground">Uninstalling the app deletes all your preferences and tracker data forever. We have no backups.</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-serif font-bold mt-12 mb-4">No Third-Party SDKs</h2>
              <p>
                Modern apps are usually built using "SDKs" (Software Development Kits) from companies like Google, Facebook, or Crashlytics. These SDKs make building apps faster, but they silently collect analytics and telemetry data about you in the background.
              </p>
              <p>
                <strong>Vaqit uses zero third-party tracking SDKs.</strong> No Google Analytics. No Facebook Pixel. No crash reporters. We don't know how long you spend in the app, which buttons you tap, or when the app crashes. We prefer to rely on direct user feedback rather than surveillance.
              </p>

              <h2 className="text-2xl font-serif font-bold mt-12 mb-4">How does the app make money?</h2>
              <p>
                The core app will always be free. No ads, ever. 
              </p>
              <p>
                In the future, we will introduce "Vaqit Plus" — an optional, paid tier that unlocks advanced features (like extensive Qaza tracking, high-quality audio Quran recitations, and advanced family sync). If you find value in the app and want to support its development, you can pay for Plus. If not, the core prayer times and notifications remain free, private, and pristine.
              </p>
              <p>
                We sell a product, not our users.
              </p>

              <div className="mt-16 p-6 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-sm text-primary mb-0 font-medium">
                  Have questions about our privacy practices? You'll be able to reach us directly from within the app once we launch, or via our contact channels.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
