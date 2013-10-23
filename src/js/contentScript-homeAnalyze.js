
$(function () {

    'use strict';

    var allLinks = $("a")

    var timeGroup = 1

    var dataPromise = $.ajax({
        url: "http://dashboard.mbaobao.com/data/indexPvServlet" + "?" + (new Date()).getTime(),
        type: "GET",
        dataType: "JSON"
    })

    dataPromise.done(function (linkJson) {

        $("body").on("mouseenter", "a,form", function () {
            var point = $(this).find(".mt-point")
            if (point.length) {
                point.hide()
                showTip(this)
            }
        }).on("mouseleave", "a, form", function () {
            var point = $(this).find(".mt-point")
            if (point.length) {
                point.show()
                hideTip()
            }
        })


        $("a").each(function (index, item) {
            var link = $(item)
            var org_href = link.attr("href")
            var href = org_href
            if (href && href.charAt(0) != "#") {

                href = href.replace(/\s+\?/, "?").replace(/\.com(\?.+)?$/, ".com/$1").replace(/\?p=[0-9]+/, "")

                var urlData = linkJson[href]

                if (urlData) {
                    setMTBox(urlData, link)
                } else {
                    console.log("fail:", org_href)
                }
            }

        })

        $("form").each(function (index, item) {
            var action = $(item).attr("action")
            var urlData = linkJson[action]
            console.log(action)
            if (urlData) {
                setMTBox(urlData, $(item))
            }
        })


    });

    function setMTBox(urlData, dom) {
        setTimeout(function () {
            var box = $(document.createElement("b")).addClass("mt-point").html(urlData.ratio)
            var position = dom.css("position")

            if (!position || (position != "relative" && position != "absolute")) {
                dom.css({
                    "position": "relative"
                })
            }

            dom.append(box).data(urlData)

        }, 100 * timeGroup)

        timeGroup = timeGroup + 1
        if (timeGroup > 4) {
            timeGroup = 1
        }

    }


    function showTip(a) {
        var tip = getTip()
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
    }

    function hideTip() {
        getTip().hide()
    }

    function getTip() {
        var tip = $("body").find(".mt-tip")
        if (!tip.length) {
            tip = $(document.createElement("div")).addClass("mt-tip").appendTo("body")
        }
        return tip
    }

})