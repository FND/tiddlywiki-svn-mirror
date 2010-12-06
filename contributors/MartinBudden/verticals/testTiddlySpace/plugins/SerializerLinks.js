/***
|''Name''|SerializerLinks|
|''Description''|TiddlySpace plugin creating links to the different serialization forms.|
|''Version''|0.8.0|
***/
//{{{
(function($) {
var tiddlyspace = config.extensions.tiddlyspace;
var tweb = config.extensions.tiddlyweb;

var macro = config.macros.serializerLinks = {
	available: ["atom", "html", "json", "txt", "wiki"],
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		if(!tiddler) {
			return;
		}
		var container = $("<span />").appendTo(place);
		var bag = tiddler.fields["server.bag"]
		var space = tiddlyspace.resolveSpaceName(bag);
		tweb.getStatus(function(status) {
			var host = status.server_host;
			var base = tiddlyspace.getHost(host, space);
			for(var i = 0; i < macro.available.length; i++) {
				var serializer = macro.available[i];
				$("<a />").addClass("sLink").text(serializer).attr("href", "%0/bags/%1/tiddlers/%2.%3".format([
					base, bag, tiddler.title, serializer
				])).appendTo(container);
			}
		});
	}
};

})(jQuery);
//}}}