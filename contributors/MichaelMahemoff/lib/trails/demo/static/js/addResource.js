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

//################################################################################
// http://plugins.jquery.com/files/jquery.cookie.js.txt
//################################################################################
jQuery.cookie=function(name,value,options){if(typeof value!='undefined'){options=options||{};if(value===null){value='';options.expires=-1;}
var expires='';if(options.expires&&(typeof options.expires=='number'||options.expires.toUTCString)){var date;if(typeof options.expires=='number'){date=new Date();date.setTime(date.getTime()+(options.expires*24*60*60*1000));}else{date=options.expires;}
expires='; expires='+date.toUTCString();}
var path=options.path?'; path='+(options.path):'';var domain=options.domain?'; domain='+(options.domain):'';var secure=options.secure?'; secure':'';document.cookie=[name,'=',encodeURIComponent(value),expires,path,domain,secure].join('');}else{var cookieValue=null;if(document.cookie&&document.cookie!=''){var cookies=document.cookie.split(';');for(var i=0;i<cookies.length;i++){var cookie=jQuery.trim(cookies[i]);if(cookie.substring(0,name.length+1)==(name+'=')){cookieValue=decodeURIComponent(cookie.substring(name.length+1));break;}}}
return cookieValue;}};

/******************************************************************************
 * ADD TRAIL BOOKMARKLET
 ******************************************************************************/

var params;

$(function() {

  $("body").append("<h1>Add To Trail</h1>");

  params = parseGetVars();

  var serverRoot=document.location.href.replace(/^(.*\/)static.*$/, "$1");
  var trailTitle = params.trailTitle;
  var trailOwner = params.trailOwner;

  var loggedIn = buildLoginArea(serverRoot, trailOwner);
  if (!loggedIn||!trailTitle) return;

  jQuery.fn.attach = function(html) { return $(html).appendTo(this); }
  var form = $("<div id='trailResource'></div>")
    .append($("<table></table>")
      .append($("<tr></tr/>")
        .append("<td class='label'>Trail:</td>")
        .append("<td class='value'>"+trailTitle+"</td>")
      )
      .append($("<tr/>")
        .append("<td class='label'>URL:</td>")
        .append($("<td class='value' />")
          .append($("<input id='resourceURL'/>").val(params.url))
        )
      )
      .append($("<tr/>")
        .append("<td class='label'>Name:</td>")
        .append($("<td class='value' />")
          .append($("<input id='resourceName'/>").val(params.name))
        )
      )
      .append($("<tr/>")
        .append("<td class='label'>Note:</td>")
        .append($("<td class='value' />")
          .append("<textarea cols='40' rows='4' id='resourceNote'/>")
        )
      )
      .append($("<tr/>")
        .append("<td>&nbsp;</td>")
        .append($("<td/>")
          .append($("<button>Add To Trail</button>")
            .click(function() {
               addToTrail(serverRoot, trailOwner, trailTitle);
               $(this).parent().append("<status style='margin:5px;'>Added! Reloading ...</status>");
            })
          )
        )
      )
  );
  $("body").append(form);

});

function buildLoginArea(serverRoot, trailOwner) {
  var cookie = $.cookie("tiddlyweb_user");
  // alert("cookie " + cookie);
  var loginArea = $("<div/>")
    .css("marginBottom", "10px") 
    .appendTo($("body"));
  if (cookie) {
    $("<span/>")
      .html("logged in as " + (cookie.split(":"))[0].substr(1))
      .appendTo(loginArea);
    $("<button/>")
      .html("logout")
      .css("marginLeft", "5px")
      .click(function() {
         var cookiePath=window.location.pathname.replace(/(.*\/)static\/.*/, "$1");
         $.cookie("tiddlyweb_user", null, { path: cookiePath });
         document.location.reload();
      })
      .appendTo(loginArea);
    if (!trailOwner) { // FIX FOR TIDDLYWEB CHALLENGER CGI BUG
      $("<div/>")
        .html("Please use bookmarklet again to manage trail.")
        .appendTo(loginArea);
    }
    return true;
  } else {
    $("<p style='color: red;' />")
      .html("you're not logged in")
      .appendTo(loginArea);
    $("<a/>")
      // .attr("href", serverRoot+"challenge/cookie_form?tiddlyweb_redirect="+encodeURI(document.location.pathname+document.location.search))
      // .attr("href", serverRoot+"challenge/cookie_form?tiddlyweb_redirect="+document.location.pathname+document.location.search)
      .attr("href", serverRoot+"challenge/cookie_form?tiddlyweb_redirect")
      .attr("target", "scrumptiousLogin") // IE6 doesn't like opening inside the form (good anti-phishing anyway)
      .html("please login to manage your trail")
      .appendTo(loginArea);
    return false;
  }
}

function addToTrail(serverRoot, trailOwner, trailTitle) {

  getTiddler(serverRoot, "trails-"+trailOwner, trailTitle, function(trailTiddler) {
    var resources = $.parseJSON(trailTiddler.text).resources;
    var resource = {
      url: $("#resourceURL").val(),
      name: $("#resourceName").val(),
      note: $("#resourceNote").val()
    }
    resources.push(resource);
    trailTiddler.text = $.toJSON({resources:resources});
    putTiddler(serverRoot, trailTiddler);

    if (top.postMessage)
      top.postMessage("scrumptiousClose", "*");
    else
      top.location = params.url; // reload if can't be closed

  });
}

// functon addToTrail() {
  // getTiddler("trails", id, function(trailTiddler) {
  // });
// }

function getTiddler(serverRoot, bag, title, onTiddlerReceived) {
  $.ajax({
     type: "GET",
     url: serverRoot + "bags/"+bag+"/tiddlers/" + encodeURIComponent(title) + ".json",
     success: function(json) {
      onTiddlerReceived($.parseJSON(json, true));
     }
  });
}


function putTiddler(serverRoot, tiddler) {
  $.ajax({type:"POST",
  url: serverRoot+"bags/"+tiddler.bag+"/tiddlers/"+encodeURIComponent(tiddler.title)
       + "?http_method=PUT",
  data: $.toJSON(tiddler),
  contentType: "application/json; charset=UTF-8"
  });
}

// http://www.codingforums.com/showthread.php?s=&threadid=2217
function parseGetVars() {
  var getVars = location.search.substring(1).split("&");
  var returnVars = new Array();
  
  for(i=0; i < getVars.length; i++) {
    var newVar = getVars[i].split("=");
    returnVars[unescape(newVar[0])] = unescape(newVar[1]);
  }
  
  return returnVars;
}    
