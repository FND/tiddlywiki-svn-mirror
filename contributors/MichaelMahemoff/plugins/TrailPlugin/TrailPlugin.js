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
<h3><%= trail.name %></h3>
<strong><%= trail.description %></strong>
<dl class="trail">
<% for (var i=0; i<trail.bookmarks.length; i++) { bookmark = trail.bookmarks[i]; %>
 <div class="bookmark">
   <dt><a href="<%= bookmark.url %>"><%= bookmark.name %></a></dt>
   <dd>
     <%= bookmark.description %>
     <span class="editBookmark" bookmarkTitle="<%= bookmark.title %>">#</span>
   </dd>
 </div>
<% } %>
</dl>

!StyleSheet
.bookmark { margin: 20px 0; }
.trail dt { margin: 25px 0; padding: 5px; font-weight: normal; background: #008; color: white; display: inline; }
.trail dt a { color: white; }
.trail dd { margin-left: 0; color: #008; padding: 5px 0; display: inline; }
.editBookmark { padding: 8px 8px 8px 2px; opacity: 0.5; cursor: pointer; font-size: 0.7em; font-style: italic; }
!Javascript
{{{
***/

(function($) {

  version.extensions.TrailPlugin = {installed:true};

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
      $(".editBookmark").click(function() {
        story.displayTiddler("top", this.getAttribute("bookmarkTitle"));
      });
    }

  };

  config.macros.trails = {
    handler: function(place) {
      $.each(store.getTaggedTiddlers("trail"), function(i, trailTiddler) {
        invokeMacro($("<div/>").appendTo(place).get(0), "trail", trailTiddler.title);
      });
    }
  }

  version.extensions.TrailPlugin.extractTrail = function(trailTiddler) {
    trailTiddler = store.getTiddler(trailTiddler.title) || trailTiddler;
    var trail = {
      description: store.getTiddlerText(trailTiddler.title+"##Description"),
      name: trailTiddler.title
    };
    var linkedBookmarks = $.trim(store.getTiddlerText(trailTiddler.title+"##Bookmarks")).split(/[ \t\n]+/);
    trail.bookmarks = _.map(linkedBookmarks, function(bookmark) {
      var bookmarkTitle = bookmark.replace("[[","").replace("]]","");
      return {
        title: bookmarkTitle,
        url: slice(bookmarkTitle, "url"),
        name: slice(bookmarkTitle, "name") || bookmarkTitle,
        description: section(bookmarkTitle, "Description"),
      }
    });
    return trail;
  }

  var cache = {};
  this.tmpl = function tmpl(str, data){

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

  function slice(tiddler, key) { return store.getTiddlerText(tiddler+"::"+key); }
  function section(tiddler, key) { return store.getTiddlerText(tiddler+"##"+key); }

})(jQuery);


var TOP="top";

/*}}}*/
