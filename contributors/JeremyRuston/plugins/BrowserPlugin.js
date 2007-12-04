/***
|''Name:''|BrowserPlugin|
|''Description:''|Displays text conditionally depending on browser characteristics|
|''Author:''|JeremyRuston|
|''Source:''|http://www.osmosoft.com/#BrowserPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JeremyRuston/plugins/BrowserPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Dec 3, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|


BrowserPlugin allows a chunk of text to be displayed depending on the current browser:

{{{
<<browser is Gecko>>
Some text that is only displayed if the current browser is Firefox
>>
<<browser not IE>>
Meanwhile this is only displayed if the browser is not Internet Explorer
>>
}}}

The complete list of browser identifiers is:

|!Identifier |!Description |
|IE |Internet Explorer |
|Gecko |Gecko-based browser like Firefox or Camino |
|Safari |Apple's webkit browser |
|Opera |Opera |
|Linux |Any browser running on Linux |
|Unix |Any browser running on Unix |
|Mac |Any browser running on the Mac |
|Windows |Any browser running on Windows |

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.BrowserPlugin) {
version.extensions.BrowserPlugin = {installed:true};

config.macros.browser = {
};

config.macros.browser.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var matchState = true;
	switch(params[0]) {
		case "is":
			matchState = true;
			break;
		case "not":
			matchState = false;
			break;
	}
	var browser = params[1];
	var browserField = "is" + browser;
	var isVisible = (browserField in config.browser) && (config.browser[browserField] == matchState);
	var wrapper = isVisible ? place : createTiddlyElement(document.body,"div");
	if(wikifier)
		wikifier.subWikify(wrapper,">>");
	if(!isVisible)
		removeNode(wrapper)
};

} //# end of 'install only once'
//}}}
