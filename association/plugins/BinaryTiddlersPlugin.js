/***
|''Name''|BinaryTiddlersPlugin|
|''Description''|renders base64-encoded binary tiddlers as images or links|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@beta@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/plugins/BinaryTiddlersPlugin.js|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5|
|''Requires''|TiddlyWebConfig|
|''Keywords''|files binary|
!Revision History
!!v0.1 (2010-07-20)
* initial release
!Code
***/
//{{{
(function($) {

var ns = config.extensions.tiddlyweb;

if(!ns) { // XXX: not generic
	throw "Missing dependency: TiddlyWebConfig";
}

// hijack text viewer to add special handling for binary tiddlers
var _view = config.macros.view.views.wikified;
config.macros.view.views.wikified = function(value, place, params, wikifier,
		paramString, tiddler) {
	if(params[0] == "text" && ns.isBinary(tiddler)) {
		var type = tiddler.fields["server.content-type"];
		var uri = "data:%0;base64,%1".format([type, tiddler.text]); // TODO: fallback for legacy browsers
		if(type.indexOf("image/") == 0) {
			$("<img />").attr("alt", tiddler.title).attr("src", uri).appendTo(place);
		} else {
			$("<a />").attr("href", uri).text(tiddler.title).appendTo(place);
		}
	} else {
		_view.apply(this, arguments);
	}
};

})(jQuery);
//}}}

