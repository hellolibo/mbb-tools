$(function(){"use strict";function a(a,b){setTimeout(function(){var c=$(document.createElement("b")).addClass("mt-point").html(a.ratio),d=b.css("position");(!d||"relative"!=d&&"absolute"!=d)&&b.css({position:"relative"}),b.append(c).data(a)},100*e),e+=1,e>4&&(e=1)}function b(a){var b=d(),c=$(a).offset(),e=$(a).data(),f=c.top-44;0>=f&&(f=c.top+20),b.css({top:f,left:c.left}).html("<div>"+e.ratio+"</div><div>"+e.pv+"</div>").show()}function c(){d().hide()}function d(){var a=$("body").find(".mt-tip");return a.length||(a=$(document.createElement("div")).addClass("mt-tip").appendTo("body")),a}$("a");var e=1,f=$.ajax({url:"http://dashboard.mbaobao.com/data/indexPvServlet?"+(new Date).getTime(),type:"GET",dataType:"JSON"});f.done(function(d){$("body").on("mouseenter","a,form",function(){var a=$(this).find(".mt-point");a.length&&(a.hide(),b(this))}).on("mouseleave","a, form",function(){var a=$(this).find(".mt-point");a.length&&(a.show(),c())}),$("a").each(function(b,c){var e=$(c),f=e.attr("href"),g=f;if(g&&"#"!=g.charAt(0)){g=g.replace(/\s+\?/,"?").replace(/\.com(\?.+)?$/,".com/$1").replace(/\?p=[0-9]+/,"");var h=d[g];h?a(h,e):console.log("fail:",f)}}),$("form").each(function(b,c){var e=$(c).attr("action"),f=d[e];console.log(e),f&&a(f,$(c))})})});