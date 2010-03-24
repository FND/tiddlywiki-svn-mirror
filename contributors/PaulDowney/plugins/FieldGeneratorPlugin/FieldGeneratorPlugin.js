/***
|''Name:''|FieldGeneratorPlugin|
|''Description:''| generate field edit using checkboxes, text, etc |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/FieldGeneratorPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/FieldGeneratorPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
depends upon CheckBoxPlugin
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config store */
(function ($) {
    version.extensions.FieldGeneratorPlugin = {installed: true};

	config.macros.FieldGenerator = {
		handler: function (place, macroName, params, wikifier, paramString, tiddler) {
			var names = params[0] || "fields";
			var target = params[1] || tiddler.title;
			var fields = store.getTiddler(names).text.split("\n");
			var t = "";
			for (var i = 1; i < fields.length; i++) {
				var f = fields[i].split("|");
				if (f[1]) {
					var name = f[2];
					name = f[1] + (name ? ".":"") + f[2];
					t = t + "[" + (tiddler.fields[name] ? "X" : "_") + "(" + name + "@" + target + ")" + "] " + f[4] + "\n";
				}
			}
			wikify(t, place, null, tiddler);
		}
	};

}(jQuery));
//}}}
