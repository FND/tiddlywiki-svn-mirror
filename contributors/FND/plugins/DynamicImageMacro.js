/***
|''Name''|DynamicImageMacro|
|''Description''|generates an image from a dynamic source|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#DisplayImageMacro|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Usage
{{{
<<dynamicImage <source> [defaultSource] [class]>>
}}}
''N.B.:'' {{{source}}} can reference a slice within the current tiddler (e.g. {{{::Foo}}})
!!Examples
<<dynamicImage "::Icon" "http://plugins.tiddlywiki.org/plugin.png" "icon">>
!Revision History
!!v0.1 (2008-10-02)
* initial release
!Code
***/
//{{{
if(!version.extensions.DynamicImageMacro) {
version.extensions.DynamicImageMacro = { installed: true };

config.macros.dynamicImage = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		if(params[0].indexOf("::") === 0) {
			var src = store.getTiddlerSlice(tiddler.title, params[0].substr(2)) || params[1];
		} else {
			src = params[0];
		}
		var img = createTiddlyElement(place, "img", null, params[2], null, {
			src: src,
			className: params[2] || ""
		});
	}
};

} //# end of "install only once"
//}}}
