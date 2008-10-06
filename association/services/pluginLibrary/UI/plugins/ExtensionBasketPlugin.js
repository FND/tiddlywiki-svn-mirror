/***
|''Name''|ExtensionBasketPlugin|
|''Description''|displays tiddlers that have been marked for storage|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#ShoppingBasketPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Usage
{{{
<<extensionBasket>>
}}}
!!Examples
<<extensionBasket>>
!Revision History
!!v0.1 (2008-10-02)
* initial release
!Code
***/
//{{{
if(!version.extensions.ExtensionBasketPlugin) {
version.extensions.ExtensionBasketPlugin = { installed: true };

config.macros.extensionBasket = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		output = "";
		store.forEachTiddler(function(title, tiddler) {
			if(!tiddler.fields.doNotSave &&
				!tiddler.tags.contains("pluginLibrary") &&
				tiddler.tags.containsAny(["systemConfig",  "systemConfigDisable"])) {
				output += "* [[" + title + "|" +
					(store.getTiddlerSlice(title, "Source") || "") + "]]\n";
			}
		});
		wikify(output, place);
	}
};

} //# end of "install only once"
//}}}
