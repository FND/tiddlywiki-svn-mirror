//Macro: allTagsExcept
//Author: Clint Checketts
//Version: 1.0 Sept 8, 2005

version.extensions.allTagsExcept = {major: 0, minor: 1, revision: 0, date: new Date(2005,8,15)};
config.macros.allTagsExcept = {tooltip: "Show tiddlers tagged with '%0'",noTags: "There are no tags to display"};

//usage: < < allTagsExcept systemConfig systemTiddlers > > This will show all tags but those listed (e.g. systemConfig and systemTiddlers

config.macros.allTagsExcept.handler = function(place,macroName,params)
{
 var tags = store.getTags();
 var theTagList = createTiddlyElement(place,"ul",null,null,null);
 if(tags.length == 0)
 createTiddlyElement(theTagList,"li",null,"listTitle",this.noTags);
 for (var t=0; t<tags.length; t++) {
 var includeTag = true;
 for (var p=0;p<params.length; p++) if (tags[t][0] == params[p]) includeTag = false;
 if (includeTag){
 var theListItem =createTiddlyElement(theTagList,"li",null,null,null);
 var theTag = createTiddlyButton(theListItem,tags[t][0] + " (" + tags[t][1] + ")",this.tooltip.format([tags[t][0]]),onClickTag);
 theTag.setAttribute("tag",tags[t][0]);
 }
 }
}