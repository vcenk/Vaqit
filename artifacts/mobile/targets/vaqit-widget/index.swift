//
// VaqitWidget.swift
// Vaqit — iOS WidgetKit Extension (scaffold / stub)
//
// Two widgets are registered:
//   • VaqitNextPrayerWidget  — small/medium: next prayer name + time
//   • VaqitAllTimesWidget    — medium/large: grid of all 5 daily prayers
//
// This stub shows placeholder data. Full integration (reading live prayer
// times from a shared App Group container) ships in v1.1 (Jan 2027).
//
// HOW TO ENABLE IN YOUR EAS BUILD
// ─────────────────────────────────
// 1. Install the target plugin:
//      pnpm add --filter @workspace/mobile @bacons/apple-targets
// 2. Add to plugins array in app.json:
//      ["@bacons/apple-targets"]
// 3. Build:
//      eas build --profile development --platform ios
//
// The two widgets will appear in the iOS widget picker under "Vaqit".
//

import WidgetKit
import SwiftUI

// MARK: - Entry

struct VaqitPrayerEntry: TimelineEntry {
    let date: Date
    let prayerName: String
    let prayerTime: String
    let minutesUntil: Int
}

// MARK: - Stub prayer data (replaced in v1.1 with App Group shared storage)

private let stubPrayers: [(name: String, time: String)] = [
    ("Fajr",    "--:--"),
    ("Sunrise", "--:--"),
    ("Dhuhr",   "--:--"),
    ("Asr",     "--:--"),
    ("Maghrib", "--:--"),
    ("Isha",    "--:--"),
]

// MARK: - Design tokens (Vaqit palette)

private enum VaqitColor {
    static let background = Color(red: 0.047, green: 0.078, blue: 0.133)  // #0C1422
    static let emerald    = Color(red: 0.290, green: 0.867, blue: 0.502)  // #4ADE80
    static let foreground = Color(red: 0.910, green: 0.894, blue: 0.859)  // #E8E4DB
    static let muted      = Color(red: 0.478, green: 0.545, blue: 0.627)  // #7A8BA0
}

// MARK: - Next Prayer Provider

struct VaqitNextPrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> VaqitPrayerEntry {
        VaqitPrayerEntry(date: Date(), prayerName: "Fajr", prayerTime: "5:32 AM", minutesUntil: 47)
    }

    func getSnapshot(in context: Context, completion: @escaping (VaqitPrayerEntry) -> Void) {
        completion(VaqitPrayerEntry(date: Date(), prayerName: "Asr", prayerTime: "4:15 PM", minutesUntil: 23))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VaqitPrayerEntry>) -> Void) {
        // Stub: returns placeholder entry, refreshes every hour.
        // v1.1: read from UserDefaults(suiteName: "group.com.vaqit.app")
        let entry = VaqitPrayerEntry(date: Date(), prayerName: "Next Prayer", prayerTime: "--:--", minutesUntil: 0)
        let nextRefresh = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }
}

// MARK: - Next Prayer Widget View

struct VaqitNextPrayerWidgetView: View {
    var entry: VaqitPrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 5) {
                Circle()
                    .fill(VaqitColor.emerald)
                    .frame(width: 6, height: 6)
                Text("VAQIT")
                    .font(.system(size: 9, weight: .semibold))
                    .tracking(1.2)
                    .foregroundColor(VaqitColor.muted)
            }
            Spacer()
            Text(entry.prayerName)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(VaqitColor.foreground)
            Text(entry.prayerTime)
                .font(.system(size: 26, weight: .semibold, design: .rounded))
                .foregroundColor(VaqitColor.emerald)
            if entry.minutesUntil > 0 {
                Text("in \(entry.minutesUntil) min")
                    .font(.system(size: 12))
                    .foregroundColor(VaqitColor.muted)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

// MARK: - All Times Provider

struct VaqitAllTimesProvider: TimelineProvider {
    func placeholder(in context: Context) -> VaqitPrayerEntry {
        VaqitPrayerEntry(date: Date(), prayerName: "Fajr", prayerTime: "--:--", minutesUntil: 0)
    }

    func getSnapshot(in context: Context, completion: @escaping (VaqitPrayerEntry) -> Void) {
        completion(VaqitPrayerEntry(date: Date(), prayerName: "Fajr", prayerTime: "--:--", minutesUntil: 0))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VaqitPrayerEntry>) -> Void) {
        let entry = VaqitPrayerEntry(date: Date(), prayerName: "Fajr", prayerTime: "--:--", minutesUntil: 0)
        let nextRefresh = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }
}

// MARK: - All Times Widget View

struct VaqitAllTimesWidgetView: View {
    var entry: VaqitPrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 5) {
                Circle()
                    .fill(VaqitColor.emerald)
                    .frame(width: 6, height: 6)
                Text("VAQIT")
                    .font(.system(size: 9, weight: .semibold))
                    .tracking(1.2)
                    .foregroundColor(VaqitColor.muted)
                Spacer()
                Text(Date(), style: .date)
                    .font(.system(size: 9))
                    .foregroundColor(VaqitColor.muted)
            }
            .padding(.bottom, 8)

            ForEach(stubPrayers, id: \.name) { prayer in
                HStack {
                    Text(prayer.name)
                        .font(.system(size: 13))
                        .foregroundColor(VaqitColor.muted)
                    Spacer()
                    Text(prayer.time)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(VaqitColor.foreground)
                }
                .padding(.vertical, 3)
                Divider()
                    .background(Color.white.opacity(0.06))
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

// MARK: - Widget Declarations

struct VaqitNextPrayerWidget: Widget {
    let kind = "VaqitNextPrayerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: VaqitNextPrayerProvider()) { entry in
            VaqitNextPrayerWidgetView(entry: entry)
                .containerBackground(VaqitColor.background, for: .widget)
        }
        .configurationDisplayName("Next Prayer")
        .description("Shows your next prayer time.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct VaqitAllTimesWidget: Widget {
    let kind = "VaqitAllTimesWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: VaqitAllTimesProvider()) { entry in
            VaqitAllTimesWidgetView(entry: entry)
                .containerBackground(VaqitColor.background, for: .widget)
        }
        .configurationDisplayName("Prayer Times")
        .description("Shows all prayer times for today.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - Entry Point

@main
struct VaqitWidgetBundle: WidgetBundle {
    var body: some Widget {
        VaqitNextPrayerWidget()
        VaqitAllTimesWidget()
    }
}
