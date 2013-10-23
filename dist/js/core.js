var MbbToolsModel=function(){"use strict";var a={homeAnalyzeOn:!0,activityAnalyzeOn:!1,qualityToolsOn:!1,orderWarningOn:!1};this.keyName="mt";var b=this.get();b||this.set(a)};MbbToolsModel.prototype.get=function(){var a=JSON.parse(localStorage.getItem(this.keyName));return 0===arguments.length?a:_.isString(arguments[0])?a[arguments[0]]:void 0},MbbToolsModel.prototype.set=function(){if(0!==arguments.length){var a=arguments[0];if(_.isObject(a))localStorage.setItem(this.keyName,JSON.stringify(a));else if(_.isString(a)&&!_.isUndefined(arguments[1])){var b=this.get();b[a]=arguments[1],localStorage.setItem(this.keyName,JSON.stringify(b))}}};var HomeAnalyze=function(){};HomeAnalyze.prototype.install=function(a){chrome.tabs.executeScript(a,{file:"js/libs/jquery-2.0.3.min.js",runAt:"document_end"},function(){chrome.tabs.executeScript(a,{file:"js/libs/underscore-min.js",runAt:"document_end"},function(){chrome.tabs.executeScript(a,{file:"js/contentScript-homeAnalyze.js",runAt:"document_end"})})}),chrome.tabs.insertCSS(a,{file:"css/analyze.css"}),chrome.contextMenus.create({type:"normal",id:"showURLAnalyzeHistory",title:"\u663e\u793a\u5386\u53f2\u7edf\u8ba1",contexts:["link"]},function(){console.log("home contexts menu created.")})};var ActivityAnalyze=function(){};ActivityAnalyze.prototype.install=function(a){chrome.tabs.executeScript(a,{file:"js/libs/jquery-2.0.3.min.js",runAt:"document_end"},function(){chrome.tabs.executeScript(a,{file:"js/libs/underscore-min.js",runAt:"document_end"},function(){chrome.tabs.executeScript(a,{file:"js/contentScript-activityAnalyze.js",runAt:"document_end"})})}),chrome.tabs.insertCSS(a,{file:"css/analyze.css"})};var OrderNotify=function(){function a(){f=setInterval(function(){$.ajax({url:m,type:"GET",dataType:"json",success:function(a){var d={count:0,time:a.time};new Date(a.time).getTime();var f=isNaN(parseInt(a.order_total,10))?0:a.order_total,g=f-l;if(d.count=g>0?g:0,l=f,d.count=0,0===d.count){k+=1;var h=b();k>=h&&c(h)}else k=0;e=new Date(d.time).getTime()}})},d())}function b(){var a=new Date,b=a.getHours();return b>9&&11>b?3:5}function c(a){chrome.notifications.create("orderNotify",{type:"basic",title:h,message:i.replace("{time}",a),iconUrl:j},function(){})}function d(){return 6e4}var e,f,g={},h="\u5b98\u7f51\u8ba2\u5355\u76d1\u6d4b\u8b66\u62a5",i="\u5df2\u7ecf{time}\u5206\u79cd\u6ca1\u6709\u8ba2\u5355\u9e1f\u3002",j="img/80-alert-icon.png",k=0,l=0,m="http://dashboard.mbaobao.com/data/OrderAlert?mode=1";return g.start=function(){k=0,l=0,a()},g.stop=function(){clearInterval(f)},g}(),helper={where:function(a){return{isHome:/^http:\/\/www\.mbaobao\.com\/(?:\?[^?]+)?(?:#[-a-z0-9_]+)?$/i.test(a),isActivity:/^http:\/\/mkt\.mbaobao\.com\/a\-/i.test(a),isSearch:/^http:\/\/search\.mbaobao\.com\/search\/search/i.test(a)}}},mtModel=new MbbToolsModel,homeAnalyze=new HomeAnalyze,activityAnalyze=new ActivityAnalyze;