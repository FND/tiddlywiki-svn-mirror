/***
|''Name''|SearchTagPlugin|
|''Description''|adds web-search links to internal wiki links|
|''Author''|FND|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#SearchTagPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
!Notes
Also see http://www.aboutus.org/TiddlyWikiGoogleTagCombinations.
!Revision History
!!v0.1 (2008-07-16)
* initial release
!Code
***/
//{{{
if(!version.extensions.SearchTagPlugin) {
version.extensions.SearchTagPlugin = {
	installed: true,
	URL: "http://google.com/search?q=",
	label: "[G]"
};
 
// hijack createTiddlyLink() to prepend search link
createTiddlyLink_SearchTag = window.createTiddlyLink;
window.createTiddlyLink = function(place, title, includeText, className, isStatic, linkedFromTiddler, noToggle) {
	var cfg = version.extensions.SearchTagPlugin;
	createTiddlyText(createExternalLink(place, cfg.URL + title), cfg.label);
	createTiddlyText(place, " ");
	return createTiddlyLink_SearchTag.apply(this, arguments);
};

} //# end of "install only once"
//}}}