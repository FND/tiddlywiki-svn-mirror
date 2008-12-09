/***
|''Name:''|SegmentedFilterPlugin|
|''Description:''|Treat a fliter as a series of filters, one per line|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SegmentedFilterPlugin |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
|''Overrides''|TiddlyWiki.prototype.filterTiddlers() |
!!Documentation
!!Code
***/
//{{{
if(!version.extensions.SegmentedFilterPlugin) {
version.extensions.SegmentedFilterPlugin = {installed:true};

Story.prototype._segmentedFilter_filterTiddlers = Story.prototype.filterTiddlers;
Story.prototype.filterTiddlers = function(filter)
{
	var lines = filter.split("\n");
	var tiddlers = [];
        for(var t=0; t<lines.length; t++){
                tiddlers.push(this._segmentedFilter_filterTiddlers.apply(this,arguments));
	}
	return tiddlers;
};
}
//}}}
