//{{{

//config.options.chkAutoSave = true;
config.options.chkAnimate = true;
config.options.chkSaveBackups = false;
config.options.chkInsertTabs = true;
//config.options.chkBackstage = false;

config.commands.editHtml={
	text: "edit",
	tooltip: "Edit this section"
}

config.views.wikified.defaultText= "Enter section text here.";

// set the document from the hash
if(store.getTaggedTiddlers('document')[0])
	window.activeDocument = store.getTaggedTiddlers('document')[0].title;	
	
//config.macros.ccLogin.defaults.username = 'username';	
//config.macros.ccLogin.defaults.password = 'password';

config.backstageTasks.push("tiddlers");
merge(config.tasks,{tiddlers:{text: 'tiddlers',tooltip: 'view the tiddlers in the TiddlyWiki.',content: '<<tiddler SideBarTabs>>'}});


config.backstageTasks.push("new tiddler");
merge(config.tasks,{'new tiddler':{text: 'new tiddler',tooltip: 'create a new tiddler',content: '<<newTiddler template:"MyDocsTheme##tiddlerEditTemplate">>'}});

config.commands.saveTiddler.text = "save";


//}}}