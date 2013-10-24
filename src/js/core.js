
var MbbToolsModel = function () {

    'use strict';

    var defaults = {
        homeAnalyzeOn: true,
        activityAnalyzeOn: false,
        orderWarningOn: false
    };

    this.keyName = "mt";

    var model = this.get();

    if (!model) {
        this.set(defaults);
    }
}

MbbToolsModel.prototype.get = function () {
    var model = JSON.parse(localStorage.getItem(this.keyName))

    if (arguments.length === 0) {
        return model;
    }

    if (_.isString(arguments[0])) {
        return model[arguments[0]];
    }
}

MbbToolsModel.prototype.set = function () {
    if (arguments.length === 0) {
        return;
    }

    var firstArg = arguments[0];

    if (_.isObject(firstArg)) {
        localStorage.setItem(this.keyName, JSON.stringify(firstArg))
    } else if (_.isString(firstArg) && !_.isUndefined(arguments[1])) {
        var model = this.get();
        model[firstArg] = arguments[1];
        localStorage.setItem(this.keyName, JSON.stringify(model))
    }

}


var HomeAnalyze = function () {}

HomeAnalyze.prototype.install = function (tabId) {

    chrome.tabs.executeScript(tabId, {
        file: "js/libs/jquery-2.0.3.min.js",
        runAt: "document_end"
    }, function () {
        chrome.tabs.executeScript(tabId, {
            file: "js/libs/underscore-min.js",
            runAt: "document_end"
        }, function () {
            chrome.tabs.executeScript(tabId, {
                file: "js/contentScript-homeAnalyze.js",
                runAt: "document_end"
            })
        })
    })

    chrome.tabs.insertCSS(tabId, {
        file: "css/analyze.css"
    })

    chrome.contextMenus.create({
        type: "normal",
        id: "showURLAnalyzeHistory",
        title: "显示历史统计",
        contexts: ["link"],
    }, function () {
        console.log("home contexts menu created.")
    })
}

var ActivityAnalyze = function () {}

ActivityAnalyze.prototype.install = function (tabId) {

    chrome.tabs.executeScript(tabId, {
        file: "js/libs/jquery-2.0.3.min.js",
        runAt: "document_end"
    }, function () {
        chrome.tabs.executeScript(tabId, {
            file: "js/libs/underscore-min.js",
            runAt: "document_end"
        }, function () {
            chrome.tabs.executeScript(tabId, {
                file: "js/contentScript-activityAnalyze.js",
                runAt: "document_end"
            })
        })
    })

    chrome.tabs.insertCSS(tabId, {
        file: "css/analyze.css"
    })

}

var OrderNotify = (function () {
    var self = {};

    var startNotifyTime = 5
    var notifyTitle = '官网订单监测警报'
    var notifyBody = '已经{time}分种没有订单鸟。'
    var icon = 'img/80-alert-icon.png'

    var serverTime
    var _pollData
    var _pollTime
    var zeroTimes = 0
    var curOrderCount = 0
    var api = 'http://dashboard.mbaobao.com/data/OrderAlert?mode=1'

    self.start = function () {
        zeroTimes = 0
        curOrderCount = 0
        pollData()
    }

    self.stop = function () {
        clearInterval(_pollData)
    }

    function pollData() {
        _pollData = setInterval(function () {
            $.ajax({
                url: api,
                type: "GET",
                dataType: "json",
                success: function (json) {
                    var data = {
                        count: 0,
                        time: json.time
                    }
                    var serverNow = (new Date(json.time)).getTime();
                    var total = isNaN(parseInt(json.order_total, 10)) ? 0 : json.order_total;

                    var raise = total - curOrderCount;
                    data.count = (raise > 0) ? raise : 0;
                    curOrderCount = total;

                    if (data.count === 0) {
                        zeroTimes = zeroTimes + 1;
                        var _timeDiv = timeDiv()
                        if (zeroTimes >= _timeDiv) {
                            warning(_timeDiv);
                        }
                    } else {
                        zeroTimes = 0;
                    }

                    serverTime = new Date(data.time).getTime();
                }
            })
        }, intervalTime());
    }

    function timeDiv() {
        var now = new Date();
        var h = now.getHours();
        if (h > 9 && h < 23) {
            return 3;
        } else {
            return 5;
        }
    }

    function warning(time) {
        chrome.notifications.create("orderNotify", {
            type: "basic",
            title: notifyTitle,
            message: notifyBody.replace("{time}", time),
            iconUrl: icon
        }, function () {

        });
    }

    function intervalTime() {
        return 1000 * 60;
    }

    return self;

})()


var helper = {
    where: function (url) {
        return {
            "isHome": /^http:\/\/www\.mbaobao\.com\/(?:\?[^?]+)?(?:#[-a-z0-9_]+)?$/i.test(url),
            "isActivity": /^http:\/\/mkt\.mbaobao\.com\/a\-/i.test(url),
            "isSearch": /^http:\/\/search\.mbaobao\.com\/search\/search/i.test(url)
        }
    }
}


var mtModel = new MbbToolsModel()
var homeAnalyze = new HomeAnalyze()
var activityAnalyze = new ActivityAnalyze()