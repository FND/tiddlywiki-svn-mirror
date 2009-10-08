
if(isLoggedIn())
	config.options.txtTheme = "MyDocsTheme";
else
	config.options.txtTheme = "loginTheme";


config.backstageTasks.push("tiddlers");
merge(config.tasks,{about:{text: 'tiddlers',tooltip: 'view the tiddlers in the TiddlyWiki.',content: '<<tiddler SideBarTabs>>'}});
