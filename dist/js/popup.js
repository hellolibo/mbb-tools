$(function(){"use strict";$("[data-toggle='switch']").each(function(){$(this).wrap('<div class="switch" id="'+$(this).attr("name")+'"/>').parent().bootstrapSwitch()});var a=mtModel.get();_.each(a,function(a,b){$("#"+b).bootstrapSwitch("setState",a),$("#"+b).on("switch-change",function(a,b){var c=$(a.target),d=b.value,e=c.attr("id");mtModel.set(e,d)})})});