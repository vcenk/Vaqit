/**
 * Expo config plugin: Android athan foreground service
 *
 * Declares VaqitAthanService in the AndroidManifest so athan audio
 * can be played as a foreground service on Android, surviving battery
 * optimization and background process kills.
 *
 * Runs only during `eas build` (native prebuild) — has no effect on
 * Expo Go or Metro bundler.
 *
 * Usage: already wired into app.json plugins array as
 * "./plugins/withAthanService". No manual steps needed.
 */

const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * @param {import('@expo/config-plugins').AndroidManifest} androidManifest
 */
function addAthanService(androidManifest) {
  const application = androidManifest.manifest.application[0];

  if (!application.service) {
    application.service = [];
  }

  const serviceName = 'com.vaqit.app.VaqitAthanService';
  const alreadyDeclared = application.service.some(
    (s) => s.$?.['android:name'] === serviceName
  );

  if (!alreadyDeclared) {
    application.service.push({
      $: {
        'android:name': serviceName,
        'android:enabled': 'true',
        'android:exported': 'false',
        'android:foregroundServiceType': 'mediaPlayback',
        'android:stopWithTask': 'false',
      },
    });
  }

  return androidManifest;
}

/**
 * @param {import('@expo/config-plugins').ExpoConfig} config
 */
module.exports = function withAthanService(config) {
  return withAndroidManifest(config, (config) => {
    config.modResults = addAthanService(config.modResults);
    return config;
  });
};
