/**
 * @bacons/apple-targets configuration for the Vaqit widget extension.
 *
 * Install the plugin first:
 *   pnpm add --filter @workspace/mobile @bacons/apple-targets
 *
 * Then add ["@bacons/apple-targets"] to plugins in app.json.
 *
 * @type {import("@bacons/apple-targets").AppleTargetConfig}
 */
module.exports = {
  type: "widget",
  name: "VaqitWidget",
  // 17.0, not the app's 16.0: the widget views use `containerBackground`, which
  // iOS 17 requires of widgets and doesn't exist before it. The app still runs
  // on iOS 16 — only the widget needs 17.
  deploymentTarget: "17.0",
  colors: {
    $accent: "#4ADE80",
    $background: "#0C1422",
  },
  entitlements: {
    // Shared App Group container — lets the widget read prayer times written
    // by PrayerContext via SharedDefaultsModule without launching the main app.
    "com.apple.security.application-groups": ["group.online.vaqit.app"],
  },
};
