/***

|''Name:''|RssSavingPlugin |
|''Description:''|Test code to save rss feed using TiddlyTemplating mechanism |
|''Author:''|JonathanLister |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/verticals/TiddlyTemplating/js/RssSavingPlugin.js |
|''Version:''|0.1 |
|''Date:''|26/3/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3 |

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.RssSavingPlugin) {
version.extensions.RssSavingPlugin = {installed:true};

var generateRssOld = generateRss;

// This doesn't sort or collect the correct tiddlers; this will work after patch 454_3 is applied (for FilterTiddlers) and RssTemplate is updated
generateRss = function()
{
	return expandTemplate("RssTemplate") || generateRssOld();
};

} //# end of 'install only once'
//}}}