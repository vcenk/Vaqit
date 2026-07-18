import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, Clock, Calendar, ArrowRight } from "lucide-react";

export default function RoadmapPage() {
  const tiers = [
    {
      title: "MVP Release",
      date: "Shipping Dec 2026",
      status: "in-progress",
      description: "The foundation. A bulletproof prayer companion that gets the basics perfectly right.",
      features: [
        "Bulletproof notification engine with Health Check",
        "Prayer times for all standard calculation methods",
        "Qibla compass",
        "Prayer tracker & daily streaks",
        "Travel mode & qasr (shortened prayer) guidance",
        "Mosque timetable sync",
        "Hijri calendar integration",
        "Onboarding in under 90 seconds",
        "Privacy-first architecture (zero network requests)",
        "iOS home & lock screen widgets"
      ]
    },
    {
      title: "Version 1.1",
      date: "Expected Jan 2027",
      status: "planned",
      description: "Expanding the core utility with essential learning and tracking tools.",
      features: [
        "Quran reader (text & high-quality audio)",
        "Apple Watch complications",
        "Turkish localization & Diyanet default settings",
        "Qaza (missed prayer) tracker & planner",
        "Vaqit Plus tier introduction (one-time or subscription)"
      ]
    },
    {
      title: "Ramadan 2027",
      date: "Expected Feb 2027",
      status: "planned",
      description: "A complete toolkit for the blessed month.",
      features: [
        "Ramadan Mode: specialized interface for the month",
        "Suhoor & Iftar Live Activities",
        "Daily fasting tracker",
        "Ramadan dashboard & statistics",
        "Ramadan-specific notification flow"
      ]
    }
  ];

  const futureConcepts = [
    "AI companion (tafsir Q&A, dua finder)",
    "Family plan & household sync",
    "iPad optimized layout",
    "Android Wear integration"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 pb-24">
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border/50 bg-card/20">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
              The Path Forward
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're building this in public. No false promises, no vaporware. Just a steady march toward the best prayer app in the world.
            </p>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-16">
              {tiers.map((tier, index) => (
                <div key={index} className="relative pl-8 md:pl-0">
                  {/* Timeline Line */}
                  <div className="hidden md:block absolute top-0 bottom-0 left-[50%] w-px bg-border -translate-x-1/2 z-0" />
                  
                  <div className={`md:flex items-start justify-between gap-12 relative z-10 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    {/* Timeline Node */}
                    <div className="absolute left-[-2rem] top-6 md:left-[50%] md:-translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary z-20 flex items-center justify-center">
                      {tier.status === "in-progress" && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                    </div>

                    <div className="md:w-1/2 flex-shrink-0" /> {/* Spacer */}
                    
                    <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <div className="bg-card border border-border p-8 rounded-2xl shadow-lg relative overflow-hidden group hover:border-primary/50 transition-colors">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mb-4 ${
                          tier.status === "in-progress" 
                            ? "border-primary/30 bg-primary/10 text-primary" 
                            : "border-border bg-muted/50 text-muted-foreground"
                        }`}>
                          {tier.status === "in-progress" ? <Clock className="w-3 h-3 mr-1.5" /> : <Calendar className="w-3 h-3 mr-1.5" />}
                          {tier.date}
                        </div>
                        
                        <h2 className="text-2xl font-bold font-serif mb-2">{tier.title}</h2>
                        <p className="text-muted-foreground mb-6 text-sm">{tier.description}</p>
                        
                        <ul className="space-y-3">
                          {tier.features.map((feature, fIndex) => (
                            <li key={fIndex} className={`flex items-start text-sm ${index % 2 === 0 ? 'md:flex-row-reverse md:text-right' : ''}`}>
                              <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${tier.status === "in-progress" ? "text-primary" : "text-muted-foreground/50"} ${index % 2 === 0 ? 'md:ml-3 md:mr-0 mr-3' : 'mr-3'}`} />
                              <span className="text-foreground/90">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-24 pt-16 border-t border-border">
              <h3 className="text-2xl font-serif font-bold text-center mb-8">Exploring for the Future</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {futureConcepts.map((concept, idx) => (
                  <div key={idx} className="bg-background border border-border/50 p-4 rounded-xl flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">{concept}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
