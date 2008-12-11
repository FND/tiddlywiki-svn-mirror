/***
|''Name:''|SegmentedFilterPlugin|
|''Description:''|Treat a fliter as a series of filters, one per line|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''Source:''|http://whatfettle.com/2008/07/SegmentedFilterPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SegmentedFilterPlugin |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
|''Overrides''|TiddlyWiki.prototype.filterTiddlers() |
!!Documentation
Useful for separating a filter, such as the MainMenu and DefaultTiddlers, into a series of filters which may include sort and limit clauses.
!!Code
***/
//{{{
if(!version.extensions.SegmentedFilterPlugin) {
version.extensions.SegmentedFilterPlugin = {installed:true};

TiddlyWiki.prototype._segmentedFilter_filterTiddlers = TiddlyWiki.prototype.filterTiddlers;
TiddlyWiki.prototype.filterTiddlers = function(filter)
{
	var lines = filter.split("\n");
	var tiddlers = [];
        for(var t=0; t<lines.length; t++){
                tiddlers = tiddlers.concat(this._segmentedFilter_filterTiddlers(lines[t]));
	}
	return tiddlers;
};
}
//}}}
