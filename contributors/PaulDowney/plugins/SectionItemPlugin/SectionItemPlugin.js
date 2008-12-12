/***
|''Name:''|SectionItemPlugin|
|''Description:''|Command to create a new tiddler based on a section tiddler |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''Source:''|http://whatfettle.com/2008/07/SectionItemPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SectionItemPlugin |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin provides a "newSectionItem" command which creates a new tiddler based on the value of the tiddler field ''section''.

!!Code
***/
//{{{
if(!version.extensions.SectionItemPlugin) {
version.extensions.SectionItemPlugin = {installed:true};

config.commands.newSectionItem = {};
config.commands.newSectionItem.handler = function(event,src,title)
{
	var tiddler = store.getTiddler(title);
	var section = tiddler.fields['section'];
	src.setAttribute("newTitle","new "+section+" item");
	src.setAttribute("params",section);
        src.setAttribute("newTemplate",section+"EditTemplate");
	src.setAttribute("newText","");
        return config.macros.newTiddler.onClickNewTiddler.call(src);
};

merge(config.commands.newSectionItem,{
        text: "add item",
        tooltip: "Add an item to this section"});

} //# end of 'install only once'
//}}}
