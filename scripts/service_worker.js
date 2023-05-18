let browser
const alarmName = 'reloadAlarm-12345'

if (navigator.userAgentData) {
  let vendors = navigator.userAgentData.brands;
  browser = vendors.filter(e => e.brand === 'Google Chrome').length > 0 ? 'Chrome' : 'Chromium'
}

chrome.alarms.onAlarm.addListener(function(alarm) {
  chrome.storage.local.get(['reload_interval', 'notification_period'], function(r) {
    if (alarm.name == alarmName) {
      reloadIntervalMinutes = parseInt(r.reload_interval) || 15;
      notificationSeconds = parseInt(r.notification_period) || 5;
      const unit = reloadIntervalMinutes >= 2 ? 'minutes' : 'minute'
      let notificationId = (Math.floor(Math.random() * 1000)).toString()
      const title = `${browser} tabs will be reloaded`
      const options = {
        body: `${browser} will reload all open tabs in ${notificationSeconds} seconds (Reload interval is ${reloadIntervalMinutes} ${unit})`,
        icon: '../icons/refresh-white-48.png',
        tag: notificationId,
        requireInteraction: true
      }
      self.registration.showNotification(title, options).then(() => new Promise(resolve => setTimeout(resolve, notificationSeconds * 1000))).then(() => self.registration.getNotifications()).then(notifications => {
        const notification = notifications.find(notification => notification.tag === notificationId)
        if (notification) {
          notification.close()
          chrome.tabs.query({}, function(tabs) {
            for (var i = 0; i < tabs.length; i++) {
              var tab = tabs[i]
              chrome.tabs.reload(tab.id, {
                bypassCache: true
              })
            }
          })
        }
      })
    }
  })
})

// Load the default values on extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.get(alarmName, (alarm) => {
    // Alarms are remembered by the browser so check for existence before replacing
    if (!alarm) {
      setVars()
    }
  })
})

// Reload the values any time the extension first starts up
chrome.runtime.onStartup.addListener(() => {
  setVars()
})

// Reload the values any time the user clicks "Save"
chrome.storage.onChanged.addListener(function(changes, namespace) {
  setVars()
})

function setVars() {
  chrome.storage.local.get(['reload_interval', 'notification_period'], function(r) {
    reloadIntervalMinutes = parseInt(r.reload_interval) || 15;
    notificationSeconds = parseInt(r.notification_period) || 5;
    chrome.alarms.create(alarmName, {
      'periodInMinutes': reloadIntervalMinutes
    })
  });
}
