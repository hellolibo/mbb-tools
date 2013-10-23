
$(function () {

    'use strict';

    var areaMask = $(document.createElement("div")).css({
        "width": 1366,
        "height": 768,
        "background-color": "#000",
        "opacity": 80,
        "position": "abosulte",
        "z-index": "10000",
        "top":0,
        "left":0
    })

    areaMask.appendTo("body")

})