/*global mtModel:true, OrderNotify:true*/


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
       if (request.action == "getSetting") {
            sendResponse({
                setting: mtModel.get()
            })
        } else if (request.action == "startOrderNotifyMonitor") {
            OrderNotify.start()
        } else if (request.action == "stopOrderNotifyMonitor") {
            OrderNotify.stop()
        }
    }
)



if (mtModel.get().orderWarningOn) {
    OrderNotify.start()
} else {
    OrderNotify.stop()
}