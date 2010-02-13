/***
|''Name''|jQueryDocsImportMacro|
|''Description''|imports the jQuery API documentation|
|''Author''|FND|
|''Version''|0.2.0|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/jQueryDocsImportMacro.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5|
!Usage
{{{
<<jQueryDocsImport>>
}}}
<<jQueryDocsImport>>
!Revision History
!!v0.1 (2010-02-13)
* initial release
!!v0.2 (2010-02-13)
* improved arguments rendering
!Code
***/
//{{{
(function($) {

config.macros.jQueryDocsImport = {
	btnLabel: "import jQuery API documentation",
	btnTooltip: "imports the raw XML feed provided by api.jquery.com",
	uri: "http://api.jquery.com/api/",

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var uri = this.uri;
		createTiddlyButton(place, this.btnLabel, this.btnTooltip, function() {
			displayMessage("importing jQuery API documentation");
			ajaxReq({
				type: "GET",
				url: uri,
				dataType: "xml",
				success: function(data, status, xhr) {
					parseDoc(data);
					displayMessage("import complete");
				},
				error: function(xhr, error, exc) {
					displayMessage("import failed");
				}
			});
		});
	}
};

var parseDoc = function(xml) {
	store.suspendNotifications();
	$("api > entries > entry", xml).
		each(parseEntry);
	store.resumeNotifications();
	refreshAll();
};

var parseEntry = function(i, node) { // XXX: also does a save, which seems inappropriate
	node = $(node);

	var title = node.attr("name");

	var tags = [
		"jQuery API",
		"new in v" + node.find("> signature > added").text()
	];
	$("> category", node).each(function(i, node) {
		tags.push($(node).attr("name"));
	});

	var args = $("> signature > argument", node).map(function(i, node) {
		node = $(node);
		var name = node.attr("name");
		var type = node.attr("type");
		var optional = node.attr("optional") ? "yes" : "no";
		var desc = node.find("desc").text();
		return [[name, type, optional, desc]]; // nested array prevents flattening
	});
	if(args.length) {
		args.splice(0, 0, ["Name", "Type", "Optional", "Description"]);
		args = args.map(function(i, item) {
			var template = i == 0 ? "|!%0|!%1|!%2|!%3|h" : "|%0|%1|%2|%3|";
			return template.format(item);
		});
		args.push("|Arguments|c");
	}

	var examples = $("> example", node).map(function(i, node) {
		node = $(node);
		var desc = node.find("desc").text();
		var code = node.find("code").text();
		return "* {{multiLine{%0\n{{{\n%1\n}}}\n}}}".format([desc, code]);
	});

	var summary = node.find("> desc").text();
	var desc = serialize(node.find("> longdesc")[0]).
		replace(/<(\/?)longdesc>/g, "<$1html>").
		replace(/<longdesc\s?\/>/, "N/A"); // XXX: hacky?

	var join = Array.prototype.join;
	var text = "%0\n%1\n!Description\n%2\n!Examples\n%3".format([
		summary, join.apply(args, ["\n"]), desc, join.apply(examples, ["\n"])
	]);

	store.saveTiddler(title, title, text, "jQuery", new Date(), tags,
		config.defaultCustomFields, false, new Date());
};

var serialize = function(xml) {
	return window.ActiveXObject ? xml.xml : (new XMLSerializer()).serializeToString(xml);
};

})(jQuery);
//}}}
