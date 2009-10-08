
if(isLoggedIn())
	config.options.txtTheme = "MyDocsTheme";
else
	config.options.txtTheme = "loginTheme";


config.backstageTasks.push("tiddlers");
merge(config.tasks,{tiddlers:{text: 'tiddlers',tooltip: 'view the tiddlers in the TiddlyWiki.',content: '<<tiddler SideBarTabs>>'}});


config.backstageTasks.push("new tiddler");
merge(config.tasks,{'new tiddler':{text: 'new tiddler',tooltip: 'create a new tiddler',content: '<<newTiddler template:"MyDocsTheme##tiddlerEditTemplate">>'}});

config.commands.saveTiddler.text = "Save";