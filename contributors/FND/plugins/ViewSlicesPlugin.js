/***
|''Name''|ViewSlicesPlugin|
|''Description''|extends the built-in view macro to display slices|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#ViewSlicesPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Usage
{{{
<<view text slice <name> [defaultValue]>>
}}}
!!Examples
<<view text slice Description "N/A">>
!Revision History
!!v0.1 (2008-10-01)
* initial release
!Code
***/
//{{{
if(!version.extensions.ViewSlicesPlugin) {
version.extensions.ViewSlicesPlugin = { installed: true };

config.macros.view.views.slice = function(value, place, params, wikifier, paramString, tiddler) {
		var text = store.getTiddlerSlice(tiddler.title, params[2]) || params[3];
		wikify(text, place);
};

} //# end of "install only once"
//}}}
