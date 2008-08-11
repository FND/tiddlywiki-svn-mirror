/***
|''Name''|PluginInfoPlugin|
|''Description''|imports plugins from TiddlyWiki Plugin Library|
|''Author''|FND|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#PluginLibraryConnectorPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
!Usage
{{{
<<pluginInfo [name]>>
}}}
!!Examples
<<pluginInfo>>
!Revision History
!!v0.1 (2008-07-25)
* initial release
!To Do
* rename
!Code
***/
//{{{
if(!version.extensions.PluginInfoPlugin) {
version.extensions.PluginInfoPlugin = { installed: true };

config.macros.pluginInfo = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var title = params[0] || tiddler.title;
		var slices = store.calcAllSlices(title);
		var info = "";
		var name = slices.Name || title;
		if(slices.Source) {
			info += "[[" + name + "|" + slices.Source + "]]";
		} else {
			info += String.encodeTiddlyLink(name);
		}
		info += (slices.Author ? " (" + slices.Author + ")\n" : "\n")
			+ (slices.Description || "");
		wikify(info, place);
	}
};

} //# end of "install only once"
//}}}
