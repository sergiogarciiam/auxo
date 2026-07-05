const { AndroidConfig, withAndroidManifest } = require("expo/config-plugins");

const SETUP_ACTIONS = [
  "android.intent.action.BOOT_COMPLETED",
  "android.intent.action.REBOOT",
  "android.intent.action.QUICKBOOT_POWERON",
  "com.htc.intent.action.QUICKBOOT_POWERON",
];
const RECEIVE_BOOT_COMPLETED = "android.permission.RECEIVE_BOOT_COMPLETED";

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  return value == null ? [] : [value];
}

function removeSetupActionsFromReceiver(receiver) {
  if (!receiver || !receiver["intent-filter"]) {
    return receiver;
  }

  const intentFilters = normalizeArray(receiver["intent-filter"]);
  const updatedFilters = intentFilters
    .map((filter) => {
      const actions = normalizeArray(filter.action).filter(
        (action) => !SETUP_ACTIONS.includes(action?.["$"]?.["android:name"]),
      );
      if (actions.length === 0) {
        return null;
      }
      return {
        ...filter,
        action: actions,
      };
    })
    .filter(Boolean);

  return {
    ...receiver,
    "intent-filter": updatedFilters.length > 0 ? updatedFilters : undefined,
  };
}

function removeBootReceiverActions(manifest) {
  if (!manifest || !manifest.manifest) {
    return manifest;
  }

  const usesPermission = normalizeArray(
    manifest.manifest["uses-permission"],
  ).filter(
    (permission) =>
      permission?.["$"]?.["android:name"] !== RECEIVE_BOOT_COMPLETED,
  );
  manifest.manifest["uses-permission"] = usesPermission.length
    ? usesPermission
    : undefined;

  const application =
    AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  const receivers = normalizeArray(application.receiver).map((receiver) => {
    const receiverName = receiver?.["$"]?.["android:name"];
    if (
      typeof receiverName === "string" &&
      receiverName.endsWith(".service.NotificationsService")
    ) {
      return removeSetupActionsFromReceiver(receiver);
    }
    return receiver;
  });

  application.receiver = receivers.length ? receivers : undefined;
  return manifest;
}

function removeActivityResizeabilityAndOrientationRestrictions(manifest) {
  if (!manifest || !manifest.manifest) {
    return manifest;
  }

  const application =
    AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  const activities = normalizeArray(application.activity).map((activity) => {
    if (!activity || !activity["$"]) {
      return activity;
    }

    const attrs = { ...activity["$"] };
    delete attrs["android:screenOrientation"];
    attrs["android:resizeableActivity"] = "true";

    return {
      ...activity,
      $: attrs,
    };
  });

  application.activity = activities;
  return manifest;
}

const withDisableNotificationsBootReceiver = (config) =>
  withAndroidManifest(config, (config) => {
    config.modResults = removeBootReceiverActions(config.modResults);
    config.modResults = removeActivityResizeabilityAndOrientationRestrictions(
      config.modResults,
    );
    return config;
  });

module.exports = withDisableNotificationsBootReceiver;
module.exports.withDisableNotificationsBootReceiver =
  withDisableNotificationsBootReceiver;
