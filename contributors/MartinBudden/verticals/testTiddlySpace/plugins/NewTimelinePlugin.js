/***
|''Name''|NewTimelinePlugin|
|''Description''|A more powerful generic version of TiddlyWiki's timeline macro|
|''Author''|Jon Robson|
|''Version''|0.4.1|
!Usage
Use {{{<<newtimeline>>}}} rather than timeline.
 {{{<<newtimeline filter:[tag[foo]]>>}}} only show those tiddlers tagged foo in the timeline.
{{{<<newtimeline template:Foo>>}}}  use a template tiddler Foo to render each item in the timeline. For example Foo might contain
{{{
<<view title link>>
}}}
***/
//{{{
(function($) {
var macro = config.macros.newtimeline = {
	handler: function(place,macroName,params, wikifier, paramString, tiddler) {
		var container = $("<div />").attr("params", paramString).
			attr("macroName", macroName).appendTo(place)[0];
		macro.refresh(container);
	},
	refresh: function(container) {
		$(container).attr("refresh", "macro").empty();
		var paramString = $(container).attr("params");
		var args = paramString.parseParams("anon", null, null)[0];
		var groupTemplate = args.groupTemplate ? store.getTiddlerText(args.groupTemplate[0]) :
			macro.groupTemplate;
		var itemTemplate = args.template ? store.getTiddlerText(args.template[0]) :
			macro.itemTemplate;
		var params = args.anon || [];
		var field = params[0] || "modified";
		var tiddlers = args.filter ? store.sortTiddlers(store.filterTiddlers(args.filter[0]), field) :
			store.reverseLookup("tags", "excludeLists", false, field);
		var lastGroup = "";
		var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
		var dateFormat = params[2] || this.dateFormat;
		for(var t=tiddlers.length-1; t>=last; t--) {
			var tiddler = tiddlers[t];
			var theGroup = wikifyPlainText(groupTemplate,0,tiddler);
			if(theGroup != lastGroup) {
				var ul = document.createElement("ul");
				addClass(ul,"timeline");
				container.appendChild(ul);
				createTiddlyElement(ul,"li",null,"listTitle",theGroup);
				lastGroup = theGroup;
			}
			var item = createTiddlyElement(ul,"li",null,"listLink");
			wikify(itemTemplate,item,null,tiddler);
		}
	},
	groupTemplate: "<<view modified date 'DD MMM YYYY'>>",
	itemTemplate: "<<view title link>>",
	dateFormat: "DD MMM YYYY"
};
})(jQuery);
//}}}