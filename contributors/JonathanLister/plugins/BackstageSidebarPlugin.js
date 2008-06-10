/***
|''Name:''|BackstageSidebarPlugin|
|''Description:''|Moves the sidebar to the backstage, as suggested at http://www.tiddlywiki.org/wiki/Dev:Backstage#Customization|
|''Author''|JonathanLister|
|''CodeRepository:''|n/a |
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|

***/

//{{{
if(!version.extensions.BackstageSidebarPlugin) {
version.extensions.BackstageSidebarPlugin = {installed:true};

config.tasks.sidebar = {
	text: "sidebar",
	tooltip: "sidebar options",
	content: "<<tiddler SideBarOptions>>"
};
config.backstageTasks.push("sidebar");

config.macros.BackstageSidebarPlugin = {
	tiddler:tiddler
};

config.macros.BackstageSidebarPlugin.init = function() {
	var tiddler = this.tiddler;
	setStylesheet(store.getTiddlerText(tiddler.title+'##Stylesheet'),'BackstageSidebarPlugin');
};

} //# end of 'install only once'
//}}}

/***
!Stylesheet

#sidebar {
	display:none;
}

#displayArea {
	margin-right:0px;
}

!(end of Stylesheet)
***/