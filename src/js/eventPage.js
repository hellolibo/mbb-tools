/*global mtModel:true,homeAnalyze:true,activityAnalyze:true,helper:true,OrderNotify:true*/

var orderNotifyInterval;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status && changeInfo.status == "loading") {

        var where = helper.where(tab.url)
        var model = mtModel.get();

        if (model.homeAnalyzeOn && where.isHome) {
            homeAnalyze.install(tabId)
        }

        if (model.activityAnalyzeOn && where.isActivity) {
            activityAnalyze.install(tabId)
        }

    }
})

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    console.log(info, tab)
})

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action == "getActivityPageName") {
            var url = sender.tab.url;
            var matchs = url.match(/^http:\/\/mkt\.mbaobao\.com\/a-([^\/]+)/i)
            if (matchs) {
                sendResponse({
                    activityPageName: matchs[1]
                })
            }

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