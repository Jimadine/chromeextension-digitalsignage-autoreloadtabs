(function() {
    let browser, notificationSeconds, reloadIntervalMinutes
    let alarmName = 'reloadAlarm' + (Math.floor(Math.random() * 1000)).toString()
    if (navigator.userAgentData) {
        let vendors = navigator.userAgentData.brands;
        if (vendors.filter(e => e.brand === 'Google Chrome').length > 0) {
            browser = 'Chrome'
        } else {
            browser = 'Chromium'
        }
    }

    function setVars() {
        chrome.storage.local.get(['reload_interval', 'notification_period'], function(result) {
            reloadIntervalMinutes = parseInt(result.reload_interval) || 15;
            notificationSeconds = parseInt(result.notification_period) || 5;
            chrome.alarms.create(alarmName, {
                'periodInMinutes': reloadIntervalMinutes
            })
        });
    }

    // Reload the vars any time the user clicks "Save"
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        setVars()
    });
    setVars()

    chrome.alarms.onAlarm.addListener(function(alarm) {
        if (alarm.name == alarmName) {
            let notificationId = (Math.floor(Math.random() * 1000)).toString()
            const title = `${browser} tabs will be reloaded`
            const options = {
                body: `${browser} will reload all open tabs in ${notificationSeconds} seconds`,
                icon: '../icons/refresh-white-48.png',
                tag: notificationId,
                requireInteraction: true
            }
            self.registration.showNotification(title, options).then(() => new Promise(resolve => setTimeout(resolve, notificationSeconds * 1000))).then(() => self.registration.getNotifications()).then(notifications => {
                const notification = notifications.find(notification => notification.tag === notificationId)
                if (notification) {
                    notification.close()
                }
            })
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
})();
