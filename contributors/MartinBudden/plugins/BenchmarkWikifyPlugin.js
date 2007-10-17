/***
|''Name:''|BenchmarkWikifyPlugin|
|''Description:''|Allows you to benchmark the wikifier|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/BenchmarkWikifyPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Aug 17, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.1.0|

***/

//{{{
// Ensure that the DisableWikiLinksPlugin is only installed once.
if(!version.extensions.BenchmarkWikifyPlugin) {
version.extensions.BenchmarkWikifyPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('BenchmarkWikifyPlugin requires TiddlyWiki 2.1 or newer.');}


function wikify(source,output,highlightRegExp,tiddler)
{
	if(source && source != "") {
		var wikifier = new Wikifier(source,getParser(tiddler),highlightRegExp,tiddler);
		var t1,t0 = new Date();
		wikifier.subWikifyUnterm(output);
		if(tiddler && config.options.chkDisplayInstrumentation) {
			t1 = new Date();
			var t = tiddler ? tiddler.title : source.substr(0,10);
			displayMessage('Wikify "'+t+'" in ' + (t1-t0) + ' ms');
		}
	}
}

} // end of 'install only once'
//}}}
