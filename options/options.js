// Saves options using chrome.storage.local
var storage = chrome.storage.local;
var reload_interval_default = '15';
var notification_period_default = '5';

function saveOptions() {
  var statusEl = document.getElementById("status");
  // Save it using the Chrome extension storage API
  var result = {
    'reload_interval': document.getElementById("reload_interval").value,
    'notification_period': document.getElementById("notification_period").value
  }
  storage.set(result, function() {
    storage.get(result, function() {
      var storedReloadInterval = result.reload_interval
      var storedNotificationPeriod = result.notification_period
      // Notify that we saved
      if (storedReloadInterval != "" && storedNotificationPeriod != "") {
        statusEl.textContent = "Fields saved.";
      } else statusEl.textContent = "Save failure or empty/invalid field(s)";
    });
  });
}

// Restores input box value to saved values from chrome.storage
function restoreOptions() {
  var statusEl = document.getElementById("status");
  storage.get(['reload_interval', 'notification_period'], function(result) {
    var storedReloadInterval = result.reload_interval || reload_interval_default
    var storedNotificationPeriod = result.notification_period || notification_period_default
    document.getElementById("reload_interval").value = storedReloadInterval;
    document.getElementById("notification_period").value = storedNotificationPeriod;
  });
}

function resetNotify() {
  document.getElementById("reload_interval").defaultValue = reload_interval_default;
  document.getElementById("notification_period").defaultValue = notification_period_default;
  var statusEl = document.getElementById("status");
  statusEl.textContent = "Fields reset to defaults. Saving...";
  setTimeout(saveOptions,4000)
}

document.addEventListener('DOMContentLoaded', (function() {
  document.getElementById("form1").addEventListener('submit', (function(event) {
    event.preventDefault();
    saveOptions()
  }));
  restoreOptions();
  document.getElementById("form1").addEventListener('reset', (function(event) {
    resetNotify()
  }));

}));
