/***
|''Name:''|ThemeBackstagePlugin|
|''Description:''|Adds theme switcher to the backstage bar|
|''Author:''|Martin Budden|
|''Source:''|http://www.martinswiki.com/#ThemeBackstagePlugin |
|''~CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/ThemeBackstagePlugin.js |
|''Version:''|0.0.2|
|''Date:''|Jan 25, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.3|

!!Description
// This plugin adds a theme switcher to the backstage bar

!!Usage
// Just include the plugin and mark it as systemConfig in the normal way.

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ThemeBackstagePlugin) {
version.extensions.ThemeBackstagePlugin = {installed:true};

if(config.backstageTasks.indexOf("themes")==-1)
	config.backstageTasks.push("themes");

merge(config.tasks,{
	themes: {text: "themes", tooltip: "Switch theme", content: '<<themes>>'}
});

function createTiddlyRadio(parent,checked,onChange,caption)
{
	var e = document.createElement("input");
	e.setAttribute("type","radio");
	e.onclick = onChange;
	parent.appendChild(e);
	e.checked = checked;
	e.className = "radOptionInput";
	if(caption)
		wikify(caption,parent);
	return e;
}

ListView.columnTypes.Radio = {
	createItem: function(place,listObject,field,columnTemplate,col,row) {
		var e = createTiddlyRadio(place,listObject[field],ListView.columnTypes.Radio.onItemChange);
		e.setAttribute("rowName",listObject[columnTemplate.rowName]);
	},
	onItemChange: function(ev) {
		//# ensure only one radio button is selected
		var view = findRelated(this,"TABLE");
		if(!view)
			return;
		var elements = view.getElementsByTagName("input");
		for(var i=0; i<elements.length; i++) {
			var e = elements[i];
			if(e.getAttribute("type") == "radio") {
				if(e.getAttribute("rowName")!=this.getAttribute("rowname"))
					e.checked = false;
			}
		}
	}
};

config.macros.themes = {};

merge(config.macros.themes,{
	wizardTitle: "Select theme",
	step1Title: "Available themes",
	step1Html: "<input type='hidden' name='markList'></input>",
	selectLabel: "select",
	selectPrompt: "Switch to the selected theme",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'option', rowName: 'theme', type: 'Radio'},
			{name: 'Theme', field: 'theme', title: "Theme", type: 'String'},
			{name: 'Author', field: 'author', title: "Author", type: 'String'},
			{name: 'Description', field: 'description', title: "Description", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'lowlight'}
			]}
	});

config.macros.themes.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var wizard = new Wizard();
	wizard.createWizard(place,this.wizardTitle);
	wizard.addStep(this.step1Title,this.step1Html);
	var markList = wizard.getElement("markList");
	var listView = document.createElement("div");
	markList.parentNode.insertBefore(listView,markList);
	wizard.setValue("listView",listView);
	wizard.setButtons([
		{caption:config.macros.themes.selectLabel, tooltip:config.macros.themes.selectPrompt, onClick:config.macros.themes.select},
	]);
	this.refreshOptions(listView);
};

config.macros.themes.refreshOptions = function(listView)
{
	var options = [];
	var tiddlers = store.getTaggedTiddlers('systemTheme');
	for(var i=0; i<tiddlers.length; i++) {
		var t = tiddlers[i].title;
		var name = store.getTiddlerSlice(t,'Name');
		options.push({option:config.options.txtTheme==name ? true : false,
			theme:name,
			author:store.getTiddlerSlice(t,'Author'),
			description:store.getTiddlerSlice(t,'Description')});
	}
	ListView.create(listView,options,this.listViewTemplate);
};

config.macros.themes.select = function(ev)
{
	var theme = null;
	var wizard = new Wizard(this);
	var listView = wizard.getValue("listView");
	var elements = listView.getElementsByTagName("input");
	for(var i=0; i<elements.length; i++) {
		var e = elements[i];
		if(e.getAttribute("type") == "radio" && e.checked) {
			theme = e.getAttribute("rowName");
			break;
		}
	}
	if(backstage.currTabElem)
		removeClass(backstage.currTabElem,"backstageSelTab");
	backstage.hidePanel();
	story.switchTheme(theme);
};

} //# end of 'install only once'
//}}}
