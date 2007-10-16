//''Breaks the Timeline tab into "Tiddlers" and "Comments".''//
//Makes sense with the CommentPlugin.//

{{{
function in_array(item, arr){for(var i=0;i<arr.length;i++)if(item==arr[i])return true};
function get_parent(tiddler){while(tiddler && in_array(config.CommentPlugin.CPlingo.comments, tiddler.tags)) tiddler=store.fetchTiddler(tiddler.tags[0]);return tiddler};
config.options.txtTimelineTab = 'timelineTab'; // huh?
config.shadowTiddlers.TabTimelineTiddlers = config.shadowTiddlers.TabTimeline;
config.shadowTiddlers.TabTimeline = "<<tabs txtTimelineTab 文章 最近更新的文章 TabTimelineTiddlers "+ config.CommentPlugin.CPlingo.comments + " 最近的回應 TabTimelineComments>>";
config.shadowTiddlers.TabTimelineComments = "<<tiddlerComments>>";

config.macros.tiddlerComments = {
	dateFormat: 'YYYY0MM0DD',
	handler: function(place,macroName,params)
	{
		var field = params[0] ? params[0] : "modified";
		var comments = store.reverseLookup("tags",CPlingo.comments,true,field);
		var lastDay = "";
		for (var c=comments.length-1; c>=0; c--)
			{
			if(comments[c].tags.length == 0) continue;
			var tiddler = get_parent(comments[c]);
			if(!tiddler) continue;
			var theDay = comments[c][field].convertToLocalYYYYMMDDHHMM().substr(0,8);
			if(theDay != lastDay)
				{
				var theDateList = document.createElement("ul");
				place.appendChild(theDateList);
				createTiddlyElement(theDateList,"li",null,"listTitle",comments[c][field].formatString(this.dateFormat));
				lastDay = theDay;
				}
			var theDateListItem = createTiddlyElement(theDateList,"li",null,"listLink",null);
			var link = createTiddlyLink(place,comments[c].title);
			link.innerHTML = comments[c].modifier + ' on ' + tiddler.title;
			link.setAttribute("tiddlyLink",tiddler.title);
			theDateListItem.appendChild(link);
			}
	}
};
}}}