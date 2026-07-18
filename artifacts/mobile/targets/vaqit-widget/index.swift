//
// VaqitWidget.swift
// Vaqit — iOS WidgetKit Extension
//
// Two widgets:
//   • VaqitNextPrayerWidget  — small/medium: next prayer name + countdown
//   • VaqitAllTimesWidget    — medium/large: full grid of today's 5 prayers
//
// Data flow:
//   PrayerContext (JS) → SharedDefaultsModule (Swift bridge) →
//   UserDefaults(suiteName: "group.com.vaqit.app") →
//   Widget providers read the JSON on every timeline refresh.
//
// HOW TO BUILD
// ─────────────
//   pnpm add --filter @workspace/mobile @bacons/apple-targets
//   eas build --profile development --platform ios

import WidgetKit
import SwiftUI

// MARK: - App Group constants

private let kAppGroupSuite  = "group.com.vaqit.app"
private let kWidgetTimesKey = "vaqit_widget_times"

// MARK: - Shared data model

/// Mirrors the WidgetPrayerData interface in modules/shared-defaults/index.ts
private struct WidgetPrayerData: Codable {
    let fajr:         String
    let sunrise:      String
    let dhuhr:        String
    let asr:          String
    let maghrib:      String
    let isha:         String
    let locationName: String
    let date:         String
}

private struct ParsedPrayer {
    let name: String
    let key:  String
    let time: Date
}

// MARK: - Helpers

private let isoFormatter: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return f
}()

private let displayFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "h:mm a"
    f.amSymbol = "AM"
    f.pmSymbol = "PM"
    return f
}()

/// Reads and decodes the shared JSON from the App Group container.
/// Returns nil when no data has been written yet (before first app launch).
private func readWidgetData() -> WidgetPrayerData? {
    guard
        let defaults = UserDefaults(suiteName: kAppGroupSuite),
        let json = defaults.string(forKey: kWidgetTimesKey),
        let data = json.data(using: .utf8)
    else { return nil }
    return try? JSONDecoder().decode(WidgetPrayerData.self, from: data)
}

/// Parses a single ISO string, returns nil on failure.
private func parseDate(_ iso: String) -> Date? {
    isoFormatter.date(from: iso)
        ?? ISO8601DateFormatter().date(from: iso)
}

/// Builds the ordered list of prayers from decoded data.
/// Sunrise is shown in "All Times" but not counted as a prayer for "Next".
private func prayers(from data: WidgetPrayerData, includeSunrise: Bool) -> [ParsedPrayer] {
    var list: [(key: String, name: String, iso: String)] = [
        ("fajr",    "Fajr",    data.fajr),
        ("sunrise", "Sunrise", data.sunrise),
        ("dhuhr",   "Dhuhr",   data.dhuhr),
        ("asr",     "Asr",     data.asr),
        ("maghrib", "Maghrib", data.maghrib),
        ("isha",    "Isha",    data.isha),
    ]
    if !includeSunrise {
        list = list.filter { $0.key != "sunrise" }
    }
    return list.compactMap { item in
        guard let t = parseDate(item.iso) else { return nil }
        return ParsedPrayer(name: item.name, key: item.key, time: t)
    }
}

/// Returns the prayer that comes right after `after`, or nil if after Isha.
private func nextPrayer(in list: [ParsedPrayer], after reference: Date) -> ParsedPrayer? {
    list.first { $0.time > reference }
}

// MARK: - Entry

struct VaqitPrayerEntry: TimelineEntry {
    let date:            Date
    // Next-prayer widget fields
    let nextName:        String
    let nextTime:        String
    let minutesUntil:    Int
    // All-times widget fields
    let allPrayers:      [(name: String, time: String, isNext: Bool)]
    let locationName:    String
}

private extension VaqitPrayerEntry {
    /// Placeholder shown while WidgetKit loads real data.
    static var placeholder: VaqitPrayerEntry {
        VaqitPrayerEntry(
            date:         Date(),
            nextName:     "Fajr",
            nextTime:     "5:32 AM",
            minutesUntil: 47,
            allPrayers: [
                ("Fajr",    "5:32 AM",  true),
                ("Sunrise", "6:58 AM",  false),
                ("Dhuhr",   "1:10 PM",  false),
                ("Asr",     "5:02 PM",  false),
                ("Maghrib", "8:28 PM",  false),
                ("Isha",    "10:04 PM", false),
            ],
            locationName: "Your City"
        )
    }

    /// Stub shown when no App Group data is present yet.
    static var noData: VaqitPrayerEntry {
        VaqitPrayerEntry(
            date:         Date(),
            nextName:     "—",
            nextTime:     "--:--",
            minutesUntil: 0,
            allPrayers: [
                ("Fajr",    "--:--", false),
                ("Sunrise", "--:--", false),
                ("Dhuhr",   "--:--", false),
                ("Asr",     "--:--", false),
                ("Maghrib", "--:--", false),
                ("Isha",    "--:--", false),
            ],
            locationName: "Open app to set location"
        )
    }
}

// MARK: - Build entry from live data

private func buildEntry(at entryDate: Date, from data: WidgetPrayerData) -> VaqitPrayerEntry {
    let prayerList    = prayers(from: data, includeSunrise: false)
    let allList       = prayers(from: data, includeSunrise: true)
    let upcoming      = nextPrayer(in: prayerList, after: entryDate)

    // "Next Prayer" fields
    let nextName: String
    let nextTime: String
    let minutesUntil: Int
    if let up = upcoming {
        nextName     = up.name
        nextTime     = displayFormatter.string(from: up.time)
        minutesUntil = max(0, Int(up.time.timeIntervalSince(entryDate) / 60))
    } else {
        // After Isha — show Fajr tomorrow as next
        nextName     = "Fajr"
        nextTime     = "--:--"
        minutesUntil = 0
    }

    // "All Times" fields — mark whichever prayer is next
    let nextKey = upcoming?.key ?? ""
    let allRows = allList.map { p in
        (name: p.name, time: displayFormatter.string(from: p.time), isNext: p.key == nextKey)
    }

    return VaqitPrayerEntry(
        date:         entryDate,
        nextName:     nextName,
        nextTime:     nextTime,
        minutesUntil: minutesUntil,
        allPrayers:   allRows,
        locationName: data.locationName
    )
}

// MARK: - Next Prayer Provider

struct VaqitNextPrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> VaqitPrayerEntry {
        .placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (VaqitPrayerEntry) -> Void) {
        if let data = readWidgetData() {
            completion(buildEntry(at: Date(), from: data))
        } else {
            completion(.placeholder)
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VaqitPrayerEntry>) -> Void) {
        guard let data = readWidgetData() else {
            // No data yet — show stub, refresh in an hour to pick up first launch
            let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
            completion(Timeline(entries: [.noData], policy: .after(next)))
            return
        }

        let now          = Date()
        let prayerList   = prayers(from: data, includeSunrise: false)

        // Build one entry per prayer transition:
        //   • one entry right now
        //   • one at each upcoming prayer time (so the widget text flips automatically)
        var entries: [VaqitPrayerEntry] = [buildEntry(at: now, from: data)]
        for prayer in prayerList where prayer.time > now {
            entries.append(buildEntry(at: prayer.time, from: data))
        }

        // After the last prayer, refresh at the next midnight so tomorrow's
        // times are fetched (PrayerContext will have re-written new times).
        let midnight = Calendar.current.startOfDay(
            for: Calendar.current.date(byAdding: .day, value: 1, to: now)!
        )
        completion(Timeline(entries: entries, policy: .after(midnight)))
    }
}

// MARK: - All Times Provider

struct VaqitAllTimesProvider: TimelineProvider {
    func placeholder(in context: Context) -> VaqitPrayerEntry {
        .placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (VaqitPrayerEntry) -> Void) {
        if let data = readWidgetData() {
            completion(buildEntry(at: Date(), from: data))
        } else {
            completion(.placeholder)
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VaqitPrayerEntry>) -> Void) {
        guard let data = readWidgetData() else {
            let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
            completion(Timeline(entries: [.noData], policy: .after(next)))
            return
        }

        let now    = Date()
        var entries: [VaqitPrayerEntry] = [buildEntry(at: now, from: data)]

        // Add an entry at each prayer time so the "is next" highlight moves.
        let prayerList = prayers(from: data, includeSunrise: false)
        for prayer in prayerList where prayer.time > now {
            entries.append(buildEntry(at: prayer.time, from: data))
        }

        let midnight = Calendar.current.startOfDay(
            for: Calendar.current.date(byAdding: .day, value: 1, to: now)!
        )
        completion(Timeline(entries: entries, policy: .after(midnight)))
    }
}

// MARK: - Design tokens

private enum VaqitColor {
    static let background = Color(red: 0.047, green: 0.078, blue: 0.133)  // #0C1422
    static let emerald    = Color(red: 0.290, green: 0.867, blue: 0.502)  // #4ADE80
    static let foreground = Color(red: 0.910, green: 0.894, blue: 0.859)  // #E8E4DB
    static let muted      = Color(red: 0.478, green: 0.545, blue: 0.627)  // #7A8BA0
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
            Text(entry.nextName)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(VaqitColor.foreground)
            Text(entry.nextTime)
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
                Text(entry.locationName)
                    .font(.system(size: 9))
                    .foregroundColor(VaqitColor.muted)
                    .lineLimit(1)
            }
            .padding(.bottom, 8)

            ForEach(entry.allPrayers, id: \.name) { prayer in
                HStack {
                    Text(prayer.name)
                        .font(.system(size: 13, weight: prayer.isNext ? .semibold : .regular))
                        .foregroundColor(prayer.isNext ? VaqitColor.emerald : VaqitColor.muted)
                    Spacer()
                    Text(prayer.time)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(prayer.isNext ? VaqitColor.emerald : VaqitColor.foreground)
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
