/***
!Metadata:
|''Name:''|ListNoTaggedPlugin|
|''Description:''|To list tiddlers with no tagged.|
|''Version:''|1.0.1|
|''Date:''|Jul 20, 2006|
|''Source:''|http://www.sourceforge.net/projects/ptw/|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License]]|
|''~CoreVersion:''|2.1.0|
|''Browser:''|Firefox 1.5+; InternetExplorer 6.0|
!Revision History:
|''Version''|''Date''|''Note''|
|1.0.1|Jul 20, 2006|Initial release|
!Code section:
***/
//{{{
config.macros.list.notagged = {
	prompt: "Tiddlers that are not tagged:"
};
config.macros.list.notagged.handler = function(params)
{
	return store.getNoTagged();

}
TiddlyWiki.prototype.getNoTagged = function()
{
	var results = [];
	this.forEachTiddler(function (title,tiddler) {
		if(tiddler.tags.length==0)
			results.push(title);
		});
	results.sort();
	return results;
}
//}}}