// Placeholder for common "tiddly-stuff"
(function($) {

  plugin = $.tiddly = function(options) {}

  plugin.renderDate = function(dateString) { // 20090612225339
    return dateString.substr(0,4) + "-" + dateString.substr(4,2) + "-" + dateString.substr(6,2) + " "
           + dateString.substr(8,2) + ":" + dateString.substr(10,2);
  }

  plugin.composeDateString = function(timeStamp) {
    //  0   1  2    3     4
    // Sat Jun 13 2009 12:05:29 GMT+0100 (BST) -> 20090613120529
    var months = { Jan:"01", Feb:"02", Mar:"03", Apr:"04", May:"05", Jun:"06", Jul:"07", Aug:"08", Sep:"09", Oct:"10", Nov:"11", Dec:"12" };
    var parts = (""+new Date()).split(" ");
    var timeParts = parts[4].split(":");
    x= [parts[3],months[parts[1]],parts[2],timeParts[0],timeParts[1],timeParts[2]].join("");
    return x;
  }

  // from core
/*
  plugin.convertFromYYYYMMDDHHMM = function(d) {
    var _date=new Date();
    var hh = d.substr(8,2) || "00";
    var mm = d.substr(10,2) || "00";
    console.log("ddddd", d);
    _date.setUTCFullYear(parseInt(d.substr(0,4),10), parseInt(d.substr(4,2),10), parseInt(d.substr(6,2),10));
    _date.setUTCHours(hh);
    _date.setUTCMinutes(mm);
    console.log("d", d);
    return _date;
  }
*/

  plugin.renderTiddler = function(tiddler) {
    console.log("mod", tiddler.modified);
    return $("<div class='tiddler'></div>")
           .append($("<div class='title'></div>")
                      .html(tiddler.title)
                  )
           .append($("<div class='subtitle'></div>")
                      .append($("<span class='modifier'></span>").html(tiddler.modifier))
                      .append($("<span class='modified'></span>").html($.tiddly.renderDate(tiddler.modified)))
                  )
           .append($("<div class='viewer'></div>")
                      .html(tiddler.text)
                  )
            ;
    // return "<div class='tiddler'>" + this.modifier + ": " + this.text + " [" + $.tiddly.renderDate(this.modified) + "]</p>");
  }

  plugin.convertFromYYYYMMDDHHMM = function(d)
  {
    var hh = d.substr(8,2) || "00";
    var mm = d.substr(10,2) || "00";
    return new Date(Date.UTC(parseInt(d.substr(0,4),10),
        parseInt(d.substr(4,2),10)-1,
        parseInt(d.substr(6,2),10),
        parseInt(hh,10),
        parseInt(mm,10),0,0));
  };


})(jQuery);

//################################################################################
// http://jollytoad.googlepages.com/json.js
//################################################################################

(function($){var m={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},s={'array':function(x){var a=['['],b,f,i,l=x.length,v;for(i=0;i<l;i+=1){v=x[i];f=s[typeof v];if(f){v=f(v);if(typeof v=='string'){if(b){a[a.length]=',';}
a[a.length]=v;b=true;}}}
a[a.length]=']';return a.join('');},'boolean':function(x){return String(x);},'null':function(x){return"null";},'number':function(x){return isFinite(x)?String(x):'null';},'object':function(x){if(x){if(x instanceof Array){return s.array(x);}
var a=['{'],b,f,i,v;for(i in x){v=x[i];f=s[typeof v];if(f){v=f(v);if(typeof v=='string'){if(b){a[a.length]=',';}
a.push(s.string(i),':',v);b=true;}}}
a[a.length]='}';return a.join('');}
return'null';},'string':function(x){if(/["\\\x00-\x1f]/.test(x)){x=x.replace(/([\x00-\x1f\\"])/g,function(a,b){var c=m[b];if(c){return c;}
c=b.charCodeAt();return'\\u00'+
Math.floor(c/16).toString(16)+
(c%16).toString(16);});}
return'"'+x+'"';}};$.toJSON=function(v){var f=isNaN(v)?s[typeof v]:s['number'];if(f)return f(v);};$.parseJSON=function(v,safe){if(safe===undefined)safe=$.parseJSON.safe;if(safe&&!/^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/.test(v))
return undefined;return eval('('+v+')');};$.parseJSON.safe=false;})(jQuery);

// jquery color plugin
/*
(function(jQuery){jQuery.each(['backgroundColor','borderBottomColor','borderLeftColor','borderRightColor','borderTopColor','color','outlineColor'],function(i,attr){jQuery.fx.step[attr]=function(fx){if(fx.state==0){fx.start=getColor(fx.elem,attr);fx.end=getRGB(fx.end)}fx.elem.style[attr]="rgb("+[Math.max(Math.min(parseInt((fx.pos*(fx.end[0]-fx.start[0]))+fx.start[0]),255),0),Math.max(Math.min(parseInt((fx.pos*(fx.end[1]-fx.start[1]))+fx.start[1]),255),0),Math.max(Math.min(parseInt((fx.pos*(fx.end[2]-fx.start[2]))+fx.start[2]),255),0)].join(",")+")"}});function getRGB(color){var result;if(color&&color.constructor==Array&&color.length==3)return color;if(result=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))return[parseInt(result[1]),parseInt(result[2]),parseInt(result[3])];if(result=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))return[parseFloat(result[1])*2.55,parseFloat(result[2])*2.55,parseFloat(result[3])*2.55];if(result=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))return[parseInt(result[1],16),parseInt(result[2],16),parseInt(result[3],16)];if(result=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))return[parseInt(result[1]+result[1],16),parseInt(result[2]+result[2],16),parseInt(result[3]+result[3],16)];return colors[jQuery.trim(color).toLowerCase()]}function getColor(elem,attr){var color;do{color=jQuery.curCSS(elem,attr);if(color!=''&&color!='transparent'||jQuery.nodeName(elem,"body"))break;attr="backgroundColor"}while(elem=elem.parentNode);return getRGB(color)};var colors={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0]}})(jQuery);
*/

// jquery color plugin
function relative_time(time_value) {
  var values = time_value.split(" ");
  time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
  var parsed_date = Date.parse(time_value);
  var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
  var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
  delta = delta + (relative_to.getTimezoneOffset() * 60);
  
  var r = '';
  if (delta < 60) {
    r = 'a minute ago';
  } else if(delta < 120) {
    r = 'couple of minutes ago';
  } else if(delta < (45*60)) {
    r = (parseInt(delta / 60)).toString() + ' minutes ago';
  } else if(delta < (90*60)) {
    r = 'an hour ago';
  } else if(delta < (24*60*60)) {
    r = '' + (parseInt(delta / 3600)).toString() + ' hours ago';
  } else if(delta < (48*60*60)) {
    r = 'yesterday';
  } else {
    r = (parseInt(delta / 86400)).toString() + ' days ago';
  }
  
  return r;
}

function rel(d) {
// var d = Date.parse("Fri, 4 Dec 2008 15:13:00 +0000");
var dateFunc = new Date();
var timeSince = dateFunc.getTime() - d;
var inSeconds = timeSince / 1000;
var inMinutes = timeSince / 1000 / 60;
var inHours = timeSince / 1000 / 60 / 60;
var inDays = timeSince / 1000 / 60 / 60 / 24;
var inYears = timeSince / 1000 / 60 / 60 / 24 / 365;

if (timeSince<0) return "recent"; // timezone bug or something

// in hours
else if(Math.round(inHours) == 1){
return ("1 hour ago");
}
else if(inDays < 1.01){
return (Math.round(inHours) + " hours ago");
}

// in days
else if(Math.round(inDays) == 1){
return ("1 day ago");
}
else if(inYears < 1.01){
return (Math.round(inDays) + " days ago");
}

// in years
else if(Math.round(inYears) == 1){
return ("1 year ago");
}
else
{
return (Math.round(inYears) + " years ago");
}
}

// http://plugins.jquery.com/files/jquery.cookie.js.txt
jQuery.cookie=function(name,value,options){if(typeof value!='undefined'){options=options||{};if(value===null){value='';options.expires=-1;}
var expires='';if(options.expires&&(typeof options.expires=='number'||options.expires.toUTCString)){var date;if(typeof options.expires=='number'){date=new Date();date.setTime(date.getTime()+(options.expires*24*60*60*1000));}else{date=options.expires;}
expires='; expires='+date.toUTCString();}
var path=options.path?'; path='+(options.path):'';var domain=options.domain?'; domain='+(options.domain):'';var secure=options.secure?'; secure':'';document.cookie=[name,'=',encodeURIComponent(value),expires,path,domain,secure].join('');}else{var cookieValue=null;if(document.cookie&&document.cookie!=''){var cookies=document.cookie.split(';');for(var i=0;i<cookies.length;i++){var cookie=jQuery.trim(cookies[i]);if(cookie.substring(0,name.length+1)==(name+'=')){cookieValue=decodeURIComponent(cookie.substring(name.length+1));break;}}}
return cookieValue;}};

/*
function createCookie(name,value,days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
  }
  else var expires = "";
  console.log(document.cookie);
  document.cookie = name+"="+value+expires+"; path=/";
  console.log(document.cookie);
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function eraseCookie(name) {
  createCookie(name,"",-1);
}
*/

/*
 * jquery-plugin Readonly
 *
 * Version 0.6.2
 * 
 * http://dev.powelltechs.com/jquery.readonly
 * http://plugins.jquery.com/project/readonly
 * 
 * Known good compatibility with jQuery 1.3.2
 *
 * Tested working with Firefox 3.0.8 (ubuntu) [ver0.6.2]
 * Tested working with Opera 9.64 (win32) [ver0.6.1]
 * Tested working with Safari 4 Beta (win32) [ver0.6.1]
 * Tested working with Google Chrome 2.0 (win32) [ver0.6.1]
 * Tested working with IE 7.0 (win32) [ver0.6.2]
 * Tested working with IE 6.0 (win32) [ver0.6.2]
 * 
 *
 * Copyright (c) 2009 Charlie Powell
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */

/* END OF FILE jquery.readonly */

