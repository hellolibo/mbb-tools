$(function () {

    'use strict';

    var allLinks = $("a")

    var timeGroup = 1

    chrome.runtime.sendMessage({
        action: "getActivityPageName"
    }, function (response) {
        init(response.activityPageName)
    });

    function init(activityPageName) {
        var dataPromise = $.ajax({
            url: "http://dashboard.mbaobao.com/data/indexPvServlet?page=a-&url_key=" + activityPageName + "&d=" + (new Date()).getTime(),
            type: "GET",
            dataType: "JSON"
        })

        dataPromise.done(function (linkJson) {
            console.groupCollapsed("Path match log");
            $("body").on("mouseenter", "a,form, .mt-map-area", function () {
                var point = $(this).find(".mt-point")
                if (point.length) {
                    point.hide()
                    showTip(this)
                }
            }).on("mouseleave", "a, form, .mt-map-area", function () {
                var point = $(this).find(".mt-point")
                if (point.length) {
                    point.show()
                    hideTip()
                }
            })

            $("body").on("mouseenter", ".mt-map-area", function () {
                $(this).css({
                    "background-color": "rgba(0,0,0,0.4)"
                })
            }).on("mouseleave", ".mt-map-area", function () {
                $(this).css({
                    "background-color": "rgba(0,0,0,0)"
                })
            }).on("click", ".mt-map-area", function () {
                window.open($(this).data("href"))
            })

            console.group('A tag match:');
            $("a").each(function (index, item) {
                var link = $(item)
                var orig_href = link.attr("href")
                var href = orig_href
                if (href && href.charAt(0) != "#") {

                    href = href.replace(/\s+\?/, "?").replace(/\.com(\?.+)?$/, ".com/$1").replace(/\?p=[0-9]+/, "")

                    var urlData = linkJson[href]

                    if (urlData) {
                        setMTBox(urlData, link)
                    } else {
                        console.log("fail:", orig_href)
                    }
                }

                // 对于漂浮的图片，a没有高度
                var includeImg = link.find("img")
                if (includeImg.css('float') && includeImg.css('float') !== 'none') {
                    link.css({
                        'display': 'block',
                        'width': includeImg.width(),
                        'height': includeImg.height(),
                        'float': includeImg.css('float')
                    })
                }

            })
            console.groupEnd();

            console.group("Img map match:");
            $("img").each(function (index, item) {
                var self = $(this);
                var mapname = self.attr("usemap");

                var lazyloadImg = self.attr("src2")
                if (lazyloadImg) {
                    self.attr({
                        src: lazyloadImg
                    }).removeAttr("src2")
                }

                if (mapname) {

                    var wrap = self.wrap("<div/>").parent().css({
                        "float": self.css("float"),
                        "width": self.width(),
                        "height": self.height(),
                        "position": "relative"
                    });

                    $("map[name=" + mapname.substr(1) + "]").find("area").each(function (index) {

                        var orig_href = $(this).attr("href");

                        if (orig_href && orig_href.charAt(0) != "#") {

                            var href = orig_href.replace(/\s+\?/, "?").replace(/\.com(\?.+)?$/, ".com/$1").replace(/\?p=[0-9]+/, "")

                            var urlData = linkJson[href];
                            var mark = drawMapMark($(this).attr("shape"), $(this).attr("coords"))
                            mark.data({
                                "href": $(this).attr("href")
                            })
                            wrap.append(mark)

                            if (urlData) {
                                setMTBox(urlData, mark)
                            } else {
                                console.log("fail:", orig_href)
                            }

                        }

                    })
                }
            })
            console.groupEnd();

            $("form").each(function (index, item) {
                var action = $(item).attr("action")
                var urlData = linkJson[action]
                if (urlData) {
                    setMTBox(urlData, $(item))
                }
            })
            console.groupEnd();
        });

    }

    function setMTBox(urlData, dom, style) {
        setTimeout(function () {
            var box = $(document.createElement("b")).addClass("mt-point").html(urlData.ratio)
            var position = dom.css("position")

            if (!position || (position != "relative" && position != "absolute")) {
                dom.css({
                    "position": "relative"
                })
            }
            if (style) {
                box.css(style)
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

    function drawMapMark(shape, coords) {

        var points = _.map(coords.split(","), function (number) {
            return parseInt(number, 10)
        })

        var width = 0
        var height = 0
        var mark = ""
        var top = 0
        var left = 0

        // 矩形
        if (shape == "rect") {
            width = Math.abs(points[0] - points[2])
            height = Math.abs(points[1] - points[3])
            top = points[1]
            left = points[0]
        }
        // 圆形
        if (shape == "circle") {
            width = height = points[2] * 2
            top = points[1]
            left = points[0]
        }

        // 不规则图形
        if (shape == "poly") {
            var rectPoints = polyToRect(points)
            width = Math.abs(rectPoints[0] - rectPoints[2])
            height = Math.abs(rectPoints[1] - rectPoints[3])
            top = rectPoints[1]
            left = rectPoints[0]
        }

        mark = '<div class="mt-map-area" style="cursor:pointer;position:absolute;width:' + width + 'px;height:' + height + 'px;left:' + left + 'px;top:' + top + 'px"/>'

        return $(mark);
    }

    function polyToRect(points) {
        var leftPoints = _.filter(points, function (item, index) {
            return (index + 1) % 2 > 0;
        })

        var topPoints = _.filter(points, function (item, index) {
            return (index + 1) % 2 === 0;
        })

        var leftMax = _.max(leftPoints)
        var leftMin = _.min(leftPoints)
        var topMax = _.max(topPoints)
        var topMin = _.min(topPoints)

        return [leftMin, topMin, leftMax, topMax]
    }

})