/***
|''Name''|ListNavMacro|
|''Description''|dynamic list filtering|
|''Author''|FND|
|''Version''|0.3.3|
|''Status''|@@experimental@@|
|''Source''|<...>|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5|
|''Requires''|[[jquery.listnav|http://www.ihwy.com/Labs/jquery-listnav-plugin.aspx]]|
!Notes
Heavily relies on [[jquery.listnav|http://www.ihwy.com/Labs/jquery-listnav-plugin.aspx]].
!Usage
{{{
<<listnav [items] [source:title] [filter:expression] [links:true] [wikified:true]>>
}}}
!!Parameters
<...>
!!Examples
<<listnav foo bar baz lorem ipsum dolor sit amet source:ColorPalette filter:[tag[systemConfig]]>>
!Configuration Options
* styling can be customized via [[StyleSheetListNav]]
!Revision History
!!v0.1 (2009-03-11)
* initial release
!!v0.2 (2009-03-12)
* refactored to be more generic (apply to any preceding list)
!!v0.3 (2009-03-12)
* refactored to operate on items/references passed into the macro call
!To Do
* documentation (esp. parameters)
* support multiple source and filter parameters
* support transclusion and macros within source tiddler
* support linkification and wikification
* support listing tags
!Code
***/
//{{{
(function($) { //# set up alias

config.macros.listnav = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var prms = paramString.parseParams("anon", null, true);
		// use positional parameters as items
		var items = $.map(prms, function(itm, i) { // XXX: excessively complicated?
			if(itm.name == "anon") {
				return itm.value;
			}
		});
		// extend items with lines extracted from given tiddler
		var source = getParam(prms, "source");
		if(source) {
			items = items.concat(this.getItemsFromTiddler(source));
		}
		// extend items with filter matches
		var filter = getParam(prms, "filter");
		if(filter) {
			items = items.concat(this.getFilteredItems(filter));
		}
		// generate list from items
		this.generateList(items, place, {
			links: getParam(prms, "links") == "true" ? true : false,
			wikified: getParam(prms, "wikified") == "true" ? true : false
		});
	},

	generateList: function(items, container, options) {
		// create pseudo-unique ID
		var id = new Date().formatString("YYYY0MM0DD0hh0mm0ss"); // XXX: should include milliseconds
		// generate nav bar
		$("<div />").attr("id", id + "-nav").addClass("listnav").appendTo(container);
		// generate list
		var list = $("<ul />").attr("id", id).appendTo(container);
		$.each(items, function(i, itm) {
			$("<li />").text(itm).appendTo(list); // TODO: optional linkification or wikification
		});
		// apply listnav
		list.attr("id", id).listnav();
	},

	getItemsFromTiddler: function(title) {
		var text = store.getTiddlerText(title);
		if(text) {
			return text.replace(/^[*#]\s*/gm, "").split("\n"); // N.B.: strips list markup
		} else {
			return [];
		}
	},

	getFilteredItems: function(filter) {
		var tiddlers = store.filterTiddlers(filter);
		return $.map(tiddlers, function(t, i) { return t.title; }); // XXX: excessively complicated?
	}
};

// add default styles (adapted from http://www.ihwy.com/labs/downloads/jquery-listnav/2.0/listnav.css)
config.shadowTiddlers.StyleSheetListNav = "/*{{{*/\n" +
	".listnav { margin: 20px 0 10px; }\n" +
	".ln-letters { overflow: hidden; }\n" +
	".ln-letters a { font-size: 0.9em; display: block; float: left; padding: 2px 6px; border: 1px solid #eee; border-right: none; text-decoration: none; }\n"+
	".ln-letters a.ln-last { border-right: 1px solid #eee; }\n" +
	".ln-letters a:hover, .ln-letters a.ln-selected { background-color: #eaeaea; }\n" +
	".ln-letters a.ln-disabled { color: #ccc; }\n" +
	".ln-letter-count { text-align: center; font-size: 0.8em; line-height: 1; margin-bottom: 3px; color: #336699; }\n" +
	"/*}}}*/";
store.addNotification("StyleSheetListNav", refreshStyles);

})(jQuery);
//}}}
