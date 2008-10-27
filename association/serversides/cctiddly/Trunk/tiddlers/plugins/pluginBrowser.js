config.macros.pluginBrowser = {};

merge(config.macros.pluginBrowser,{
       listTemplate: {
       columns: [
       {name: 'Selected', field: 'url', rowName: 'url', type: 'Selector'},
	   {name: 'wiki text', field: 'title', title: "Plugin", type: 'WikiText'},
	   {name: 'wiki text', field: 'description', title: "Description", type: 'WikiText'}
	   ],
       rowClasses: [
       {className: 'lowlight', field: 'lowlight'}
       ]}
});
merge(config.macros.pluginBrowser,{
	wizardTitleText:"Add Plugins",
	wizardStepText:" <input name='markList' style='display:none' />",
	wizardButtonInstallText:"Install",
	wizardButtonInstallTooltip:"Click to install plugins",
	wizardButtonRemoveText:"Remove",
	wizardButtonRemoveTooltip:"Click to remove plugins",
	ccPlugins: [
		{title: 'Twitter Adaptor', url: 'http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/TwitterAdaptorPlugin.js', description: 'Automatically turns the siteTitle into a link.'},
		{title: 'Power Title', url: 'http://svn.tiddlywiki.org/Trunk/contributors/MichaelMahemoff/plugins/ClickableSiteTitlePlugin/PowerTitlePlugin.js', description: 'Automatically turns the siteTitle into a link.'},
		{title: 'Comments Plugin', url: 'http://svn.tiddlywiki.org/Trunk/contributors/MichaelMahemoff/plugins/CommentsPlugin/CommentsPlugin.js', description: '{{{<<comments>>}}}'},
		{title: 'Theme Switcher Plugin', url: 'http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/ThemeSwitcherPlugin.js', description: '{{{<<selectTheme>>}}}'},
		{title: 'ToDo List Plugin', url: 'http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/TodoListPlugin.js', description: '{{{<<listTodos>>}}}'}
	]
	});

config.macros.pluginBrowser.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
	var me = config.macros.pluginBrowser;
	var w = new Wizard();
	w.createWizard(place,me.wizardTitleText);
	w.setButtons([
		{caption: me.wizardButtonInstallText, tooltip: me.wizardButtonInstallTooltip, onClick: function() {me.install(w);}},
		{caption: me.wizardButtonInstallText+"2", tooltip: me.wizardButtonInstallTooltip, onClick: function() {me.installView(w);}},  	
	{caption: me.wizardButtonRemoveText, tooltip: me.wizardButtonRemoveTooltip, onClick: function() {me.removeView(w); }}
	]);
	};

config.macros.pluginBrowser.refresh=function(w){
	var me = config.macros.pluginBrowser;
	w.setButtons([
		{caption: me.wizardButtonInstallText, tooltip: me.wizardButtonInstallTooltip, onClick: function() {me.install(w);}},
		{caption: me.wizardButtonInstallText+"2", tooltip: me.wizardButtonInstallTooltip, onClick: function() {me.installView(w);}},  	
	{caption: me.wizardButtonRemoveText, tooltip: me.wizardButtonRemoveTooltip, onClick: function() {me.removeView(w); }}
	]);

};
	


config.macros.pluginBrowser.installView = function(w){
 alert("1");
	var me = config.macros.pluginBrowser;
	w.addStep(null, " <input name='markList3' style='display:none' />");
	var markList = w.getElement("markList3");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	var ps1 = me.ccPlugins;
	for(m=0; m < ps1.length;  m++)  {
		p = ps1[m];
		displayMessage(p);

		if(p.url){
			var tiddler2 = store.getTiddler(me.getFileName(p.url));
			if(tiddler2){
			//		ps1.remove(p);
				}
			}
	}
	var listView = ListView.create(listWrapper,ps1,me.listTemplate);
	//w.setValue("listView",listView);
	w.setButtons([
		{caption: me.wizardButtonInstallText, tooltip: me.wizardButtonInstallTooltip, onClick: function() {me.install(w);}},
		{caption: me.wizardButtonInstallText+"2", tooltip: me.wizardButtonInstallTooltip, onClick: function() {me.installView(w);}},  	
	{caption: me.wizardButtonRemoveText, tooltip: me.wizardButtonRemoveTooltip, onClick: function() {me.removeView(w); }}
	]);

};
	
config.macros.pluginBrowser.removeView = function(w){
	alert("2");
	var me = config.macros.pluginBrowser;
	
	w.addStep(null, " <input name='markList2' style='display:none' />");
	var markList = w.getElement("markList2");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	var ps2 = me.ccPlugins;
	console.log(me.ccPlugins);
	for(d=0;d < ps2.length;  d++)  {
		p = ps2[d];
		if(p.url){
			var tiddler2 = store.getTiddler(me.getFileName(p.url));
			if(!tiddler2){
					ps2.remove(p);
				}
			}
	}
	var listView = ListView.create(listWrapper,ps2,me.listTemplate);
//	w.setValue("listView",listView);
w.setButtons([
	{caption: me.wizardButtonInstallText, tooltip: me.wizardButtonInstallTooltip, onClick: function() {me.install(w);}},
	{caption: me.wizardButtonInstallText+"2", tooltip: me.wizardButtonInstallTooltip, onClick: function() {me.installView(w);}},  	
{caption: me.wizardButtonRemoveText, tooltip: me.wizardButtonRemoveTooltip, onClick: function() {me.removeView(w); }}
]);
};	
	
config.macros.pluginBrowser.install = function(w){
	var listView = w.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	for(var e=0; e < rowNames.length; e++){
		var postUri = url+"handle/proxy.php?feed="+rowNames[e];
		doHttp('POST', postUri, null, null, null, null, config.macros.pluginBrowser.installCallback);
	}
};

config.macros.pluginBrowser.installCallback = function(status,params,responseText,uri,xhr){
	var title = config.macros.pluginBrowser.getFileName(uri);
	var now = new Date();
	if(!store.getTiddler(title)){
		store.saveTiddler(title,title,responseText,'ccTiddly',now,'systemConfig');
    }
	store.resumeNotifications();
	refreshDisplay();
};

config.macros.pluginBrowser.getFileName = function(str){
		str = str.substring(str.lastIndexOf('/'));
		return str.substring(1, str.indexOf('.js'));
};