/***
|Name|TrailPlugin|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|

!TrailTemplate
<h3 class="tiddlerLink" tiddlerTitle="<%= trail.name %>"><%= trail.name %></h3>
<strong><%= trail.description %></strong>
<dl class="trail">
<% for (var i=0; i<trail.bookmarks.length; i++) { bookmark = trail.bookmarks[i]; %>
 <div class="bookmark">
   <dt><a href="<%= bookmark.url %>"><%= bookmark.name %></a></dt>
   <dd>
     <%= bookmark.note %>
     <span class="tiddlerLink" tiddlerTitle="<%= bookmark.title %>">#</span>
   </dd>
 </div>
<% } %>
</dl>

!StyleSheet
.bookmark { margin: 20px 0; }
.trail dt { margin: 25px 0; padding: 5px; font-weight: normal; background: #008; color: white; display: inline; }
.trail dt a { color: white; }
.trail dd { margin-left: 0; color: #008; padding: 5px 0; display: inline; }
.trail dd .tiddlerLink { padding: 8px 8px 8px 2px; opacity: 0.5; cursor: pointer; font-size: 0.7em; font-style: italic; }
!Javascript
{{{
***/

(function($) {

  var plugin = version.extensions.TrailPlugin = {installed:true};

  var macro = config.macros.trail = {

    init: function() {
      var stylesheet = store.getTiddlerText("TrailPlugin##StyleSheet");
      config.shadowTiddlers["StyleSheetTrailPlugin"] = stylesheet;
      store.addNotification("StyleSheetTrailPlugin", refreshStyles);
    },

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      tiddler = store.getTiddler(paramString);
      var trail = version.extensions.TrailPlugin.extractTrail(tiddler);
      $(place).append(tmpl("TrailPlugin##TrailTemplate", {trail:trail }));
      $(".tiddlerLink").click(function() {
        story.displayTiddler("top", this.getAttribute("tiddlerTitle"));
      });
    }

  };

  config.macros.trails = {
    handler: function(place) {
      // $.each(store.getTaggedTiddlers("trail"), function(i, trailTiddler) {
      $.each(plugin.findTrails(["todo"]), function(i, trailTiddler) {
        invokeMacro($("<div/>").appendTo(place).get(0), "trail", trailTiddler.title);
      });
    }
  };

  // If "tags" argument is a list (with at least one element), will only return trails matching at least
  // one of those tags. Implementation of filtering is slower than it could be.
  version.extensions.TrailPlugin.findTrails = function(userTags) {
    if (!userTags) userTags = [];
    if (typeof(userTags)=="string") userTags = [userTags];
    var tags = _.map(userTags, function(userTag) { return "user_"+userTag.replace(/^user_/, "") });
    var allTrails = store.getTaggedTiddlers("trail");
    if (!tags.length) return allTrails;
    return _.select(allTrails, function(trail) {
      return _.any(trail.tags, function(tag) { return tags.indexOf(tag)!=-1; });
    });
  }

  version.extensions.TrailPlugin.extractTrail = function(trailTiddler) {
    trailTiddler = store.getTiddler(trailTiddler.title) || trailTiddler;
    var trail = {
      description: store.getTiddlerText(trailTiddler.title+"##Description"),
      name: trailTiddler.title,
      bookmarks: []
    };
    var bookmarkSpec = /\[\[(.*?)\]\](.*)/g;
    var bookmarkMatch;
    while (bookmarkMatch = bookmarkSpec.exec(store.getTiddlerText(trailTiddler.title+"##Bookmarks"))) {
      var bookmarkTitle = bookmarkMatch[1];
      trail.bookmarks.push({
        title: bookmarkTitle,
        url: slice(bookmarkTitle, "url"),
        name: slice(bookmarkTitle, "name") || bookmarkTitle,
        note: $.trim(bookmarkMatch[2]),
        description: section(bookmarkTitle, "Description"),
      });
    };
    return trail;
  }

  var cache = {};
  function tmpl(str, data){

    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        // tmpl(document.getElementById(str).innerHTML) :
        tmpl(store.getTiddlerText(str)) :
      
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
        
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        
        // Convert the template into pure JavaScript
        store.getTiddlerText(str)
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
    
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
  version.extensions.microtemplate = tmpl;

  function log() { if (window.console) console.log.apply(console, arguments); }
  function slice(tiddler, key) { return store.getTiddlerText(tiddler+"::"+key); }
  function section(tiddler, key) { return store.getTiddlerText(tiddler+"##"+key); }

})(jQuery);

// underscore
(function(){var j=this,n=j._,i=function(a){this._wrapped=a},m=typeof StopIteration!=="undefined"?StopIteration:"__break__",b=j._=function(a){return new i(a)};if(typeof exports!=="undefined")exports._=b;var k=Array.prototype.slice,o=Array.prototype.unshift,p=Object.prototype.toString,q=Object.prototype.hasOwnProperty,r=Object.prototype.propertyIsEnumerable;b.VERSION="0.5.7";b.each=function(a,c,d){try{if(a.forEach)a.forEach(c,d);else if(b.isArray(a)||b.isArguments(a))for(var e=0,f=a.length;e<f;e++)c.call(d,
a[e],e,a);else{var g=b.keys(a);f=g.length;for(e=0;e<f;e++)c.call(d,a[g[e]],g[e],a)}}catch(h){if(h!=m)throw h;}return a};b.map=function(a,c,d){if(a&&b.isFunction(a.map))return a.map(c,d);var e=[];b.each(a,function(f,g,h){e.push(c.call(d,f,g,h))});return e};b.reduce=function(a,c,d,e){if(a&&b.isFunction(a.reduce))return a.reduce(b.bind(d,e),c);b.each(a,function(f,g,h){c=d.call(e,c,f,g,h)});return c};b.reduceRight=function(a,c,d,e){if(a&&b.isFunction(a.reduceRight))return a.reduceRight(b.bind(d,e),c);
var f=b.clone(b.toArray(a)).reverse();b.each(f,function(g,h){c=d.call(e,c,g,h,a)});return c};b.detect=function(a,c,d){var e;b.each(a,function(f,g,h){if(c.call(d,f,g,h)){e=f;b.breakLoop()}});return e};b.select=function(a,c,d){if(a&&b.isFunction(a.filter))return a.filter(c,d);var e=[];b.each(a,function(f,g,h){c.call(d,f,g,h)&&e.push(f)});return e};b.reject=function(a,c,d){var e=[];b.each(a,function(f,g,h){!c.call(d,f,g,h)&&e.push(f)});return e};b.all=function(a,c,d){c=c||b.identity;if(a&&b.isFunction(a.every))return a.every(c,
d);var e=true;b.each(a,function(f,g,h){(e=e&&c.call(d,f,g,h))||b.breakLoop()});return e};b.any=function(a,c,d){c=c||b.identity;if(a&&b.isFunction(a.some))return a.some(c,d);var e=false;b.each(a,function(f,g,h){if(e=c.call(d,f,g,h))b.breakLoop()});return e};b.include=function(a,c){if(b.isArray(a))return b.indexOf(a,c)!=-1;var d=false;b.each(a,function(e){if(d=e===c)b.breakLoop()});return d};b.invoke=function(a,c){var d=b.rest(arguments,2);return b.map(a,function(e){return(c?e[c]:e).apply(e,d)})};b.pluck=
function(a,c){return b.map(a,function(d){return d[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a))return Math.max.apply(Math,a);var e={computed:-Infinity};b.each(a,function(f,g,h){g=c?c.call(d,f,g,h):f;g>=e.computed&&(e={value:f,computed:g})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a))return Math.min.apply(Math,a);var e={computed:Infinity};b.each(a,function(f,g,h){g=c?c.call(d,f,g,h):f;g<e.computed&&(e={value:f,computed:g})});return e.value};b.sortBy=function(a,c,d){return b.pluck(b.map(a,
function(e,f,g){return{value:e,criteria:c.call(d,e,f,g)}}).sort(function(e,f){e=e.criteria;f=f.criteria;return e<f?-1:e>f?1:0}),"value")};b.sortedIndex=function(a,c,d){d=d||b.identity;for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?(e=g+1):(f=g)}return e};b.toArray=function(a){if(!a)return[];if(a.toArray)return a.toArray();if(b.isArray(a))return a;if(b.isArguments(a))return k.call(a);return b.values(a)};b.size=function(a){return b.toArray(a).length};b.first=function(a,c,d){return c&&!d?k.call(a,
0,c):a[0]};b.rest=function(a,c,d){return k.call(a,b.isUndefined(c)||d?1:c)};b.last=function(a){return a[a.length-1]};b.compact=function(a){return b.select(a,function(c){return!!c})};b.flatten=function(a){return b.reduce(a,[],function(c,d){if(b.isArray(d))return c.concat(b.flatten(d));c.push(d);return c})};b.without=function(a){var c=b.rest(arguments);return b.select(a,function(d){return!b.include(c,d)})};b.uniq=function(a,c){return b.reduce(a,[],function(d,e,f){if(0==f||(c===true?b.last(d)!=e:!b.include(d,
e)))d.push(e);return d})};b.intersect=function(a){var c=b.rest(arguments);return b.select(b.uniq(a),function(d){return b.all(c,function(e){return b.indexOf(e,d)>=0})})};b.zip=function(){for(var a=b.toArray(arguments),c=b.max(b.pluck(a,"length")),d=new Array(c),e=0;e<c;e++)d[e]=b.pluck(a,String(e));return d};b.indexOf=function(a,c){if(a.indexOf)return a.indexOf(c);for(var d=0,e=a.length;d<e;d++)if(a[d]===c)return d;return-1};b.lastIndexOf=function(a,c){if(a.lastIndexOf)return a.lastIndexOf(c);for(var d=
a.length;d--;)if(a[d]===c)return d;return-1};b.range=function(a,c,d){var e=b.toArray(arguments),f=e.length<=1;a=f?0:e[0];c=f?e[0]:e[1];d=e[2]||1;e=Math.ceil((c-a)/d);if(e<=0)return[];e=new Array(e);f=a;for(var g=0;;f+=d){if((d>0?f-c:c-f)>=0)return e;e[g++]=f}};b.bind=function(a,c){var d=b.rest(arguments,2);return function(){return a.apply(c||j,d.concat(b.toArray(arguments)))}};b.bindAll=function(a){var c=b.rest(arguments);if(c.length==0)c=b.functions(a);b.each(c,function(d){a[d]=b.bind(a[d],a)});
return a};b.delay=function(a,c){var d=b.rest(arguments,2);return setTimeout(function(){return a.apply(a,d)},c)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(b.rest(arguments)))};b.wrap=function(a,c){return function(){var d=[a].concat(b.toArray(arguments));return c.apply(c,d)}};b.compose=function(){var a=b.toArray(arguments);return function(){for(var c=b.toArray(arguments),d=a.length-1;d>=0;d--)c=[a[d].apply(this,c)];return c[0]}};b.keys=function(a){if(b.isArray(a))return b.range(0,a.length);
var c=[];for(var d in a)q.call(a,d)&&c.push(d);return c};b.values=function(a){return b.map(a,b.identity)};b.functions=function(a){return b.select(b.keys(a),function(c){return b.isFunction(a[c])}).sort()};b.extend=function(a,c){for(var d in c)a[d]=c[d];return a};b.clone=function(a){if(b.isArray(a))return a.slice(0);return b.extend({},a)};b.tap=function(a,c){c(a);return a};b.isEqual=function(a,c){if(a===c)return true;var d=typeof a;if(d!=typeof c)return false;if(a==c)return true;if(!a&&c||a&&!c)return false;
if(a.isEqual)return a.isEqual(c);if(b.isDate(a)&&b.isDate(c))return a.getTime()===c.getTime();if(b.isNaN(a)&&b.isNaN(c))return true;if(b.isRegExp(a)&&b.isRegExp(c))return a.source===c.source&&a.global===c.global&&a.ignoreCase===c.ignoreCase&&a.multiline===c.multiline;if(d!=="object")return false;if(a.length&&a.length!==c.length)return false;d=b.keys(a);var e=b.keys(c);if(d.length!=e.length)return false;for(var f in a)if(!b.isEqual(a[f],c[f]))return false;return true};b.isEmpty=function(a){return b.keys(a).length==
0};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=function(a){return!!(a&&a.concat&&a.unshift)};b.isArguments=function(a){return a&&b.isNumber(a.length)&&!a.concat&&!a.substr&&!a.apply&&!r.call(a,"length")};b.isFunction=function(a){return!!(a&&a.constructor&&a.call&&a.apply)};b.isString=function(a){return!!(a===""||a&&a.charCodeAt&&a.substr)};b.isNumber=function(a){return a===+a||p.call(a)==="[object Number]"};b.isDate=function(a){return!!(a&&a.getTimezoneOffset&&a.setUTCFullYear)};
b.isRegExp=function(a){return!!(a&&a.test&&a.exec&&(a.ignoreCase||a.ignoreCase===false))};b.isNaN=function(a){return b.isNumber(a)&&isNaN(a)};b.isNull=function(a){return a===null};b.isUndefined=function(a){return typeof a=="undefined"};b.noConflict=function(){j._=n;return this};b.identity=function(a){return a};b.breakLoop=function(){throw m;};var s=0;b.uniqueId=function(a){var c=s++;return a?a+c:c};b.templateSettings={start:"<%",end:"%>",interpolate:/<%=(.+?)%>/g};b.template=function(a,c){var d=b.templateSettings;
a=new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+a.replace(/[\r\t\n]/g," ").replace(new RegExp("'(?=[^"+d.end[0]+"]*"+d.end+")","g"),"\t").split("'").join("\\'").split("\t").join("'").replace(d.interpolate,"',$1,'").split(d.start).join("');").split(d.end).join("p.push('")+"');}return p.join('');");return c?a(c):a};b.forEach=b.each;b.foldl=b.inject=b.reduce;b.foldr=b.reduceRight;b.filter=b.select;b.every=b.all;b.some=b.any;b.head=b.first;b.tail=b.rest;
b.methods=b.functions;var l=function(a,c){return c?b(a).chain():a};b.each(b.functions(b),function(a){var c=b[a];i.prototype[a]=function(){var d=b.toArray(arguments);o.call(d,this._wrapped);return l(c.apply(b,d),this._chain)}});b.each(["pop","push","reverse","shift","sort","splice","unshift"],function(a){var c=Array.prototype[a];i.prototype[a]=function(){c.apply(this._wrapped,arguments);return l(this._wrapped,this._chain)}});b.each(["concat","join","slice"],function(a){var c=Array.prototype[a];i.prototype[a]=
function(){return l(c.apply(this._wrapped,arguments),this._chain)}});i.prototype.chain=function(){this._chain=true;return this};i.prototype.value=function(){return this._wrapped}})();

/*}}}*/
