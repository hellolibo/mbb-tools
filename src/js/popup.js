/*global mtModel:true*/
$(function () {

    'use strict';

    $("[data-toggle='switch']").each(function () {
        $(this).wrap('<div class="switch" id="' + $(this).attr("name") + '"/>').parent().bootstrapSwitch();
    })

    var model = mtModel.get();

    _.each(model, function (value, key) {
        $("#" + key).bootstrapSwitch('setState', value)
        $("#" + key).on('switch-change', function (e, data) {
            var el = $(e.target);
            var value = data.value;
            var key = el.attr("id");
            mtModel.set(key, value);
        });

    });


})