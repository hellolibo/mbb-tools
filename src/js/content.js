var mtContent = {
    init: function () {
        var self = this
        var url = self.url = location.hostname + (location.pathname == '/' ? '' : location.pathname)
        self.where = {
            "isHome": url == 'www.mbaobao.com',
            "isPromotion": /^mkt\.mbaobao\.com\/a\-/i.test(url),
            "isSearch": url == 'search.mbaobao.com/search/search',
            "isCategoryWomen": url == 'www.mbaobao.com/category/list/women',
            "isCategoryMen": url == 'www.mbaobao.com/category/list/men',
            "isCategoryChoice": url == 'www.mbaobao.com/choice/choice'
        }
    },
    getData: function (date) {
        var self = this;

        self.date = date;

        if (self.where.isHome) {
            return self.pageData({
                page: 'index',
                url_key: ''
            });
        } else if (self.where.isPromotion) {
            return self.getPromotionPageData()
        } else if (self.where.isCategoryWomen) {
            return self.getCategoryPageData('women')
        } else if (self.where.isCategoryMen) {
            return self.getCategoryPageData('men')
        } else if (self.where.isCategoryChoice) {
            return self.getCategoryPageData('choice')
        } else {
            return self.pageData()
        }
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
        var self = this;
        console.log(self.url)
        return $.ajax({
            url: "http://dashboard.mbaobao.com/data/indexPvServlet",
            data: _.extend({
                d: self.getTimeNumber(),
                url_key: self.url,
                date_str: self.date
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
        var matchs = url.match(/^mkt\.mbaobao\.com\/a-([^\/]+)/i);
        return matchs && matchs[1] || '';
    },
    getTimeNumber: function () {
        var now = new Date();
        return now.getTime();
    }
}


mtContent.init()


var analyzeView = {
    timeGroup: 1,
    init: function () {
        var self = this
        self.isCategory = mtContent.where.isCategoryWomen || mtContent.where.isCategoryMen || mtContent.where.isCategoryChoice

        sideBarView.init()
        sideBarView.onChangeDate(function (date) {
            self.clearNodeTip()
            self.update(date)
        })

        self.update()
    },
    update: function (date) {
        var self = this
        mtContent.getData(date).done(function (data) {
            self.render(data)
            sideBarView.render(data.total)
        }).fail(function () {
            console.log('load data fail -> ', arguments)
        })
    },
    render: function (linkJson) {
        var self = this
        $(".mt-point").remove()

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
            var orig_href = $.trim(link.attr("href"))
            var bi = link.attr('bi')
            var href = orig_href
            var urlData

            if (self.isCategory) {

                var id = link.data('id')
                if (!id || id === '') {
                    return;
                }
                urlData = linkJson[id]
                if (urlData) {
                    self.setNodeView(urlData, link, {
                        'left': "117px"
                    })
                } else {
                    console.log("fail:", link.attr('href'), id)
                }

            } else {

                if (href && href.charAt(0) != "#" && href !== '') {

                    href = href.replace(/\s+\?/, "?")
                        .replace(/\.com(\?.+)?$/, ".com/$1")
                        .replace(/\?p=[0-9]+/, "")

                    href = mtContent.checkBI(href, bi)

                    urlData = linkJson[href]

                    if (urlData) {
                        self.setNodeView(urlData, link)
                    } else {
                        console.log("fail:", orig_href)
                    }
                }

                // 对于漂浮的图片，a没有高度
                var includeImg = link.find("img")
                
                if (includeImg.css('float') && includeImg.css('float') !== 'none' && !link.css('overflow')) {
                    link.css({
                        'display': 'block',
                        'width': includeImg.width(),
                        'height': includeImg.height(),
                        'float': includeImg.css('float')
                    })
                }

            }

        })
        console.groupEnd();

        console.group("Img map match:");

        $("img").each(function (index, item) {
            var owner = $(this);
            var mapname = owner.attr("usemap");

            var lazyloadImg = owner.attr("src2") || owner.data('oxlazy')
            if (lazyloadImg) {
                owner.attr({
                    src: lazyloadImg
                })
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

                    var orig_href = $(this).attr("href")

                    if (orig_href && orig_href.charAt(0) != "#" && orig_href !== '') {

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
}

var sideBarView = {
    init: function () {
        this.timeBegin = new Date()
        this.timeEnd = new Date()
        this.callbacks = []
    },
    render: function (data) {
        var self = this;
        var side = self.side = $('<div class="mt-side"><div class="mt-side-btn"><i></i></div><div class="bd"><div class="total-info"><h3></h3><div></div></div><div class="datepicker"><h3>选择流量统计的时间</h3><div class="datepicker-box"></div></div></div></div>')
        side.find('.mt-side-btn').on('click', function () {
            side.toggleClass('mt-open')
        })

        side.find(".datepicker-box").datepicker({
            dateFormat: "yymmdd",
            onSelect: function (dateText, inst) {
                self.callbacks.forEach(function (element, index, array) {
                    element.call(this, dateText)
                })
            }
        });

        side.appendTo('body')
    },

    onChangeDate: function (callback) {
        this.callbacks.push(callback)
    }
};


$(function () {
    (chrome.runtime || chrome.extension).sendMessage({
        action: "getSetting"
    }, function (response) {
        var setting = response.setting;

        if (setting.analyzeOn) {
            analyzeView.init()
        }
    });
})