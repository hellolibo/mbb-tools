'use strict';

var mtContent = {
    url: location.href,
    getHomeData: function () {
        return this.pageData()
    },
    getActivityData: function () {
        var self = this;
        return self.pageData({
            page: 'a-',
            url_key: self.getActivityName()
        })
    },
    pageData: function (queryData) {
        return $.ajax({
            url: "http://dashboard.mbaobao.com/data/indexPvServlet",
            data: _.extend({
                d: (new Date()).getTime()
            }, queryData || {}),
            type: "GET",
            dataType: "JSON"
        })

    },
    checkBI: function (href, bi) {
        return (bi && bi !== '' && (href.indexOf('l_bi') == -1)) ? href.replace(/^([^?#]+)(\?.*)?(#.*)?$/i, function (href, path, query, hash) {
            href = href || '';
            path = path || '';
            query = query || '';
            hash = hash || '';

            if (query.indexOf('l_bi') == -1) {
                if (query.length === 0) {
                    query = "?l_bi=" + bi;
                } else {
                    query = query + (query.length > 1 ? '&' : '') + 'l_bi=' + bi
                }
            }

            return path + query + hash;
        }) : href
    },
    getActivityName: function () {
        var url = this.url;
        var matchs = url.match(/^http:\/\/mkt\.mbaobao\.com\/a-([^\/]+)/i);
        return matchs && matchs[1] || '';
    },
    where: function () {
        var url = this.url;
        return {
            "isHome": /^http:\/\/www\.mbaobao\.com\/(?:\?[^?]+)?(?:#[-a-z0-9_]+)?$/i.test(url),
            "isActivity": /^http:\/\/mkt\.mbaobao\.com\/a\-/i.test(url),
            "isSearch": /^http:\/\/search\.mbaobao\.com\/search\/search/i.test(url)
        }
    }
}


var analyzeView = {
    timeGroup: 1,
    setNodeView: function (urlData, dom) {
        var self = this
        setTimeout(function () {
            var box = $(document.createElement("b")).addClass("mt-point").html(urlData.ratio)
            var position = dom.css("position")

            if (!position || (position != "relative" && position != "absolute")) {
                dom.css({
                    "position": "relative"
                })
            }

            dom.append(box).data(urlData)

        }, 100 * self.timeGroup)

        self.timeGroup = self.timeGroup + 1
        if (self.timeGroup > 4) {
            self.timeGroup = 1
        }

    },
    showNodeTip: function (a) {
        var tip = self.getNodeTip()
        var offset = $(a).offset()
        var data = $(a).data()
        var newTop = offset.top - 44;
        if (newTop <= 0) {
            newTop = offset.top + 20;
        }
        tip.css({
            "top": newTop,
            "left": offset.left
        }).html('<div>' + data.ratio + '</div><div>' + data.pv + '</div>').show()
    },
    hideNodeTip: function () {
        this.getNodeTip().hide()
    },
    getNodeTip: function () {
        var tip = $("body").find(".mt-tip")
        if (!tip.length) {
            tip = $(document.createElement("div")).addClass("mt-tip").appendTo("body")
        }
        return tip
    }
}

var sideBarView = {

};


var homeAnalyzeView = _.extend(analyzeView, {
    init: function () {
        mtContent.getHomeData().done(this.render)
    },
    render: function (linkJson) {
        var self = this
        console.group('A tag match')
        $("a").each(function (index, item) {
            var link = $(item)
            var org_href = link.attr("href")
            var bi = link.attr('bi')
            var href = org_href

            if (href && href.charAt(0) != "#" && href != '') {

                href = href.replace(/\s+\?/, "?")
                    .replace(/\.com(\?.+)?$/, ".com/$1")
                    .replace(/\?p=[0-9]+/, "") //去除清缓存的随机数

                href = mtContent.checkBI(href, bi)

                var urlData = linkJson[href]

                if (urlData) {
                    self.setNodeView(urlData, link)
                } else {
                    console.log("fail:", org_href)
                }
            }

        })

        console.groupEnd()

        $("form").each(function (index, item) {
            var action = $(item).attr("action")
            var urlData = linkJson[action]
            if (urlData) {
                self.setNodeView(urlData, $(item))
            }
        })

        $("body").on("mouseenter", "a,form", function () {
            var point = $(this).find(".mt-point")
            if (point.length) {
                point.hide()
                self.showNodeTip(this)
            }
        }).on("mouseleave", "a, form", function () {
            var point = $(this).find(".mt-point")
            if (point.length) {
                point.show()
                self.hideNodeTip()
            }
        })
    }

});

console.log(homeAnalyzeView)


$(function () {
    chrome.runtime.sendMessage({
        action: "getSetting"
    }, function (response) {
        if (response.setting.homeAnalyzeOn) {
            homeAnalyzeView.init()
        } else if (response.setting.activityAnalyzeOn) {

        }
    });

})