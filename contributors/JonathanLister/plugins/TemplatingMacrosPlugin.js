/***
|''Name:''|TemplatingMacrosPlugin |
|''Description:''|Some macros used in TiddlyTemplating templates |
|''Author:''|JonathanLister |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/TemplatingMacrosPlugin.js |
|''Version:''|0.0.1 |
|''Date:''|25/3/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

!permalink macro

Creates a link to a view of the TiddlyWiki with only the enclosing tiddler opened

Usage:
{{{
<<permalink>>
}}}

!view macro - slice view

Allows access to a slice contained within a tiddler

Usage:
{{{
<<view text slice MySlice>>

will extract this slice:

|mySlice | slice content |
}}}

!view macro - section view

Provides access to a section contained within a tiddler

Usage:
{{{
<<view text section mySection>>

will extract this section:

!mySection
blah blah
!end of mySection

}}}

***/

//{{{
if(!version.extensions.templatingMacrosPlugin) {
version.extensions.templatingMacrosPlugin = {installed:true};

config.macros.permalink = {};
config.macros.permalink.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var t = encodeURIComponent(String.encodeTiddlyLink(tiddler.title));
	createTiddlyText(place,window.location+"#"+t);
};

config.macros.view.views.slice = function(value,place,params,wikifier,paramString,tiddler) {
	var slice = "";
	if(params && params[2]) {
		slice = store.getTiddlerSlice(tiddler.title,params[2]);
		if(slice) {
			createTiddlyText(place,slice);
		}
	}
};

config.macros.view.views.section = function(value,place,params,wikifier,paramString,tiddler) {
	var section = "";
	if(params && params[2]) {
		section = store.getTiddlerText(tiddler.title+"##"+params[2]);
		if(section) {
			createTiddlyText(place,section);
		}
	}
};

} //# end of 'install only once'
//}}}