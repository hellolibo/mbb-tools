
var mtContent = {
    init: function () {
        var self = this
        var url = self.url = location.href
        self.where = {
            "isHome": /^http:\/\/www\.mbaobao\.com\/(?:\?[^?]+)?(?:#[-a-z0-9_]+)?$/i.test(url),
            "isPromotion": /^http:\/\/mkt\.mbaobao\.com\/a\-/i.test(url),
            "isSearch": /^http:\/\/search\.mbaobao\.com\/search\/search/i.test(url),
            "isCategoryWomen": /^http:\/\/www\.mbaobao\.com\/category\/list\/women/i.test(url),
            "isCategoryMen": /^http:\/\/www\.mbaobao\.com\/category\/list\/men/i.test(url),
            "isCategoryChoice": /^http:\/\/www\.mbaobao\.com\/choice\/choice/i.test(url)
        }
    },
    getHomeData: function () {
        return this.pageData()
    },
    getPromotionPageData: function () {
        var self = this;
        return self.pageData({
            page: 'a-',
            url_key: self.getPromotionPageName()
        })
    },
    getCategoryPageData: function (type) {
        var self = this;
        return self.pageData({
            page: 'cate_' + type
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
    getPromotionPageName: function () {
        var url = this.url;
        var matchs = url.match(/^http:\/\/mkt\.mbaobao\.com\/a-([^\/]+)/i);
        return matchs && matchs[1] || '';
    }
}


mtContent.init()


var analyzeView = {
    timeGroup: 1,
    setNodeView: function (urlData, dom, boxStyle) {
        var self = this
        boxStyle = boxStyle || {}
        setTimeout(function () {
            var box = $(document.createElement("b")).addClass("mt-point").html(urlData.ratio).css(boxStyle)
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
        var tip = this.getNodeTip()
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
    },
    clearNodeTip: function () {
        $('.mt-tip').remove()
    }
}

var sideBarView = {
    init: function () {
        this.timeBegin = new Date()
        this.timeEnd = new Date()
    },
    render: function (data) {
        var side = this.side = $('<div class="mt-side"><div class="mt-side-btn"><i></i></div><div class="db"><span style="color:#fff;padding:50px;line-height:170%;display:block">哎，这里放点什么攻城师还没想好!</span></div></div>')
        side.find('.mt-side-btn').on('click', function () {
            side.toggleClass('mt-open')
        })
        side.appendTo('body')
    },

    onChangeDate: function (callback) {

    }
};


var homeAnalyzeView = _.extend({}, analyzeView, {
    init: function () {
        var self = this
        sideBarView.init()
        sideBarView.onChangeDate(function (begin, end) {
            self.clearNodeTip()
            self.update(begin, end)
        })
        self.update()
    },
    update: function (b, e) {
        var self = this
        mtContent.getHomeData().done(function (data) {
            self.render(data)
            sideBarView.render(data.total)
        }).fail(function () {
            console.log('load data fail -> ', arguments)
        })
    },
    render: function (linkJson) {
        var self = this
        console.group('A tag match')
        $("a").each(function (index, item) {
            var link = $(item)
            var org_href = link.attr("href")
            var bi = link.attr('bi')
            var href = org_href

            if (href && href.charAt(0) != "#" && href !== '') {

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

var promotionPageAnalyzeView = _.extend({}, analyzeView, {
    init: function () {
        var self = this;
        sideBarView.init()
        sideBarView.onChangeDate(function (begin, end) {
            self.clearNodeTip()
            self.update(begin, end)
        })
        self.update()
    },
    update: function (b, e) {
        var self = this
        mtContent.getPromotionPageData(b, e).done(function (data) {
            self.render(data)
            sideBarView.render(data.total)
        }).fail(function () {
            console.log('load data fail -> ', arguments)
        })
    },
    render: function (linkJson) {
        var self = this
        $("body").on("mouseenter", "a,form, .mt-map-area", function () {
            var point = $(this).find(".mt-point")
            if (point.length) {
                point.hide()
                self.showNodeTip(this)
            }
        }).on("mouseleave", "a, form, .mt-map-area", function () {
            var point = $(this).find(".mt-point")
            if (point.length) {
                point.show()
                self.hideNodeTip()
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
                    self.setNodeView(urlData, link)
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
            var owner = $(this);
            var mapname = owner.attr("usemap");

            var lazyloadImg = owner.attr("src2")
            if (lazyloadImg) {
                owner.attr({
                    src: lazyloadImg
                }).removeAttr("src2")
            }

            if (mapname) {

                var wrap = owner.wrap("<div/>").parent().css({
                    "float": owner.css("float"),
                    "width": owner.width(),
                    "height": owner.height(),
                    "position": "relative",
                    "margin": "0 auto"
                });

                $("map[name=" + mapname.substr(1) + "]").find("area").each(function (index) {

                    var orig_href = $(this).attr("href");

                    if (orig_href && orig_href.charAt(0) != "#") {

                        var href = orig_href.replace(/\s+\?/, "?").replace(/\.com(\?.+)?$/, ".com/$1").replace(/\?p=[0-9]+/, "")

                        var urlData = linkJson[href];
                        var mark = self.drawMapMark($(this).attr("shape"), $(this).attr("coords"))
                        mark.data({
                            "href": $(this).attr("href")
                        })
                        wrap.append(mark)

                        if (urlData) {
                            self.setNodeView(urlData, mark)
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
                self.setNodeView(urlData, $(item))
            }
        })
        console.groupEnd();
    },
    drawMapMark: function (shape, coords) {
        var self = this;
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
            var rectPoints = self.polyToRect(points)
            width = Math.abs(rectPoints[0] - rectPoints[2])
            height = Math.abs(rectPoints[1] - rectPoints[3])
            top = rectPoints[1]
            left = rectPoints[0]
        }

        mark = '<div class="mt-map-area" style="cursor:pointer;position:absolute;width:' + width + 'px;height:' + height + 'px;left:' + left + 'px;top:' + top + 'px"/>'

        return $(mark);
    },

    polyToRect: function (points) {
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

var categoryPageAnalyzeView = _.extend({}, analyzeView, {
    init: function (categoryType) {
        var self = this;
        self.cateType = categoryType;
        sideBarView.init()
        sideBarView.onChangeDate(function (begin, end) {
            self.clearNodeTip()
            self.update(begin, end)
        })
        self.update()
    },
    update: function () {
        var self = this
        mtContent.getCategoryPageData(self.cateType).done(function (data) {
            self.render(data)
            sideBarView.render(data.total)
        }).fail(function () {
            console.log('load data fail -> ', arguments)
        })
    },
    render: function (linkJson) {
        var self = this
        console.group('A tag match')

        $("a").each(function (index, item) {
            var link = $(item)
            var id = link.data('id')

            if (!id || id === '') {
                return;
            }

            var urlData = linkJson[id]

            if (urlData) {
                self.setNodeView(urlData, link, {
                    'left': "117px"
                })
            } else {
                console.log("fail:", link.attr('href'), id)
            }

        })

        console.groupEnd()

        $("body").on("mouseenter", "a", function () {
            var point = $(this).find(".mt-point")
            if (point.length) {
                point.hide()
                self.showNodeTip(this)
            }
        }).on("mouseleave", "a", function () {
            var point = $(this).find(".mt-point")
            if (point.length) {
                point.show()
                self.hideNodeTip()
            }
        })

        $(".l-sider").css({
            overflow: "visible"
        })
    }
})

$(function () {
    chrome.runtime.sendMessage({
        action: "getSetting"
    }, function (response) {
        var setting = response.setting;
        if (setting.homeAnalyzeOn && mtContent.where.isHome) {
            homeAnalyzeView.init()
        } else if (setting.promotionPageAnalyzeOn && mtContent.where.isPromotion) {
            promotionPageAnalyzeView.init()
        } else if (setting.categoryPageAnalyzeOn) {
            if (mtContent.where.isCategoryWomen) {
                categoryPageAnalyzeView.init("women")
            } else if (mtContent.where.isCategoryMen) {
                categoryPageAnalyzeView.init("men")
            } else if (mtContent.where.isCategoryChoice) {
                categoryPageAnalyzeView.init("choice")
            }


        }
    });
})