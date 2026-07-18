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
  deploymentTarget: "16.0",
  colors: {
    $accent: "#4ADE80",
    $background: "#0C1422",
  },
  entitlements: {
    // App Group for sharing prayer times between the main app and widget (v1.1)
    // "com.apple.security.application-groups": ["group.com.vaqit.app"],
  },
};
