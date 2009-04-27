/***
|Name|SectionPlugin|
|Description|Supports tiddlers which aggregate other tiddlers into sections|
|Source|http://tiddlywiki.mahemoff.com/SectionPlugin.html#SectionPlugin|
|Documentation|http://tiddlywiki.mahemoff.com/SectionPlugin.html#SectionPluginInfo|
|Version|0.1|
|Author|Michael Mahemoff|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.4|
***/

/*{{{*/
if(!version.extensions.SectionPlugin) {

  version.extensions.SectionPlugin = {installed:true};

  (function(plugin) {
    var macro = config.macros.anthology = {

      handler: function(place,macroName,params,wikifier,paramString,tiddler) {
        var titles = params[0].split(",");
        for (var i=0; i<titles.length; i++) {
          var title = titles[i];
            var section = createTiddlyElement(place, "div", null, "section");
            createTiddlyElement(section, "h1", null, "section", title);
            var text = createTiddlyElement(section, "div", null, "section");
            wikify(store.getTiddlerText(tiddler.title+"-"+title), text, null, tiddler);
        }
      }

    }

  })(version.extensions.SectionPlugin);
  console.log("aggreg");

} // end of 'install only once'
/*}}}*/
