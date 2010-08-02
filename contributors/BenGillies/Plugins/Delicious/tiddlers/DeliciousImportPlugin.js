/***
|''Name''|DeliciousImportPlugin|
|''Description''|import your Delicious links into TiddlyWiki|
|''Authors''|BenGillies|
|''Version''|.1|
|''Status''|unstable|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/BenGillies/Plugins/Delicious/tiddlers/DeliciousImportPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/BenGillies/Plugins/Delicious/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
!Usage
{{{
<<deliciousImport username>>
}}}
Will import up to 100 (limit set by delicious) of your latest delicious feeds into your TiddlyWiki.
!To Do
*Convert into an adaptor
!Code
***/
//{{{
(function($) {
if (!version.extensions.DeliciousImportPlugin) {
version.extensions.DeliciousImportPlugin = { installed: true };

var importer
importer = config.macros.deliciousImport = {
	loadingMsg: "loading bookmarks...",
	noUserErr: "Error: No username specified.",
	uri: "http://feeds.delicious.com/v2/json/%0?count=100&callback=%1",
	bookmarkletTemplate: '!URL\n%0\n\n!Description\n%1',
	handler:  function(place, macroName, params, wikifier, paramString, tiddler) {
		var username = params[0] || "";

		var btn = $("<button />").text("Import Bookmarks")
			.click(function() {
				if (username) {
					$(".deliciousResult").text(importer.loadingMsg);
					$('<script type="text/javascript" />')
						.attr("src", importer.uri.format([username,
							"config.macros.deliciousImport.jsonpCallback"]))
						.appendTo(place);
				} else {
					$(".deliciousResult").text(importer.noUserErr);
				}
			}).appendTo(place);
		$('<div class="deliciousResult" />').appendTo(place);
	},
	jsonpCallback: function(bookmarks) {
		var list = $("<ul />");
		$(".deliciousResult").text("").append(list);
		for(var i = 0; i < bookmarks.length; i++) {
			var bookmark = bookmarks[i];
			var title = bookmark.d;
			var modifier = bookmark.a;
			var tags = bookmark.t;
			var text = importer.bookmarkletTemplate.format([
				bookmark.u, bookmark.n]);
			var fields = {};
			if (config.defaultCustomFields) {
				merge(fields, config.defaultCustomFields);
			}
			store.saveTiddler(title, title, text, modifier, null, tags,
				fields, false);

			var linkPlace = $("<li />").appendTo(list);
			createTiddlyLink(linkPlace[0], title, true);
		}
		autoSaveChanges(true);
	}
};

}
})(jQuery);
//}}}
