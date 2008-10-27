/***
|Name|PowerTitlePlugin|
|Description|Make the title clickable|
|Source|http://tiddlyguv.org/PowerTitle.html#PowerTitlePlugin|
|Documentation|http://tiddlyguv.org/PowerTitlePlugin.html#PowerTitlePluginInfo|
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|
***/

var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
config.shadowTiddlers["PowerTitleStylesheet"] = stylesheet;
store.addNotification("PowerTitleStylesheet", refreshStyles);

var origRestart = restart;
window.restart = function() {
  origRestart();

  // Rewrite site title. This (a) adds onclick event; (b) suppresses tiddler
  var pageTemplate = store.createTiddler("PageTemplate");
  pageTemplate.text =
    store.getTiddlerText("PageTemplate").replace(
      /<span class='siteTitle' refresh='content' tiddler='SiteTitle'><\/span>/g,
      "<span onclick='PowerTitlePlugin.onTitleClick();' class='siteTitle' tiddler='SiteTitle'>" + store.getTiddlerText("SiteTitle") + "</span>"
    );
  store.saveTiddler("PageTemplate");

} 

PowerTitlePlugin = {
  onTitleClick: function() { story.closeAllTiddlers(); origRestart(); }
}

/***
!StyleSheet

.siteTitle { cursor: pointer; }
.siteTitle:hover { background: [[ColorPalette::Background]]; color: [[ColorPalette::PrimaryDark]]; }

!(end of StyleSheet)

***/
