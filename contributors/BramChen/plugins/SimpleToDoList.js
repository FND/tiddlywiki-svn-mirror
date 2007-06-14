/***
!Metadata:
|''Name:''|SimpleToDoList|
|''Description:''||
|''Version:''|1.0.0|
|''Date:''|Apr 16, 2007|
|''Source:''|http://sourceforge.net/project/showfiles.php?group_id=150646|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License]]|
|''~CoreVersion:''|2.2.0|
|''Browser:''|Firefox 1.5+,IE6,Opera9|
!Usage:
Create a definition tiddler for categories , for example, named ToDoDef and text containing:
{{{
''categories:''xAA,xBB,xCC,xDD,xEE,xZZ,completed
|!'Categorie|!Title,Tips|
|''xAA:''|01.TodoA,ToDoA|
|''xBB:''|02.TodoB,ToDoB|
|''...:''|...,...|
|''xZZ:''|99.Others,Others|
|''completed:''|V.Completed,Completed|
}}}
then start to use the macro simpleToDo:
{{{
<<simpleToDo chkTodo ToDoDef>>
}}}
!Revision History:
|''Version''|''Date''|''Note''|
|1.0.0|Apr 16, 2007|Initial release|
!Code section:
***/

//{{{
version.extensions.stlManager = {major: 1, minor: 0, revision: 0, date: new Date("Apr 16, 2007")};

config.macros.stlManager = {
	wizardTitle: "",
	step1Title: "",
	step1Html: "<input type='hidden' name='markList'></input>", // DO NOT TRANSLATE
	listViewTemplate: {
		columns: [
			{name: 'Completed', field: 'completed', title: "Completed?", tag: 'completed', type: 'TagCheckbox'},
			{name: 'Title', field: 'title', tiddlerLink: 'title', title: "Item", type: 'TiddlerLink'},
			{name: 'Text', field: 'text', title: 'Description', type: 'WikiText'}
			],
		rowClasses: [
			]}
}

config.macros.stlManager.handler = function(place,macroName,params,wikifier,paramString,tiddler){
	var wizard = new Wizard();
	wizard.createWizard(place,this.wizardTitle);
	wizard.addStep(this.step1Title,this.step1Html);
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	listWrapper.setAttribute("refresh","macro");
	listWrapper.setAttribute("macroName","stlManager");
	listWrapper.setAttribute("params",params);
	this.refresh(listWrapper,params);
}

config.macros.stlManager.refresh = function(listWrapper,params){
	var wizard = new Wizard(listWrapper);
	if (config.browser.isIE) removeChildren(listWrapper);
	var catTag=params[0], stlTag=params[1], theLists=[];
	var stlLists = store.getTaggedTiddlers(catTag);
	for(t=0; t<stlLists.length; t++) {
		theTiddler = stlLists[t];
		if (theTiddler.isTagged(stlTag)){
			theTiddler.completed = theTiddler.isTagged('completed');
			theLists.push(theTiddler);
		}
	}
	if(theLists.length != 0) {
		var listView = ListView.create(listWrapper,theLists,this.listViewTemplate,this.onSelectCommand);
		wizard.setValue("listView",listView);
	}
}

config.macros.simpleToDo = {
	dateFormat: config.views.wikified.dateFormat
};

config.macros.simpleToDo.handler = function(place,macroName,params,wikifier,paramString,tiddler){
	var stlTag=params[0], stlDefs=params[1], categories={};
	var catNames = store.getTiddlerSlice(stlDefs,'categories');
	catNames = catNames?catNames.split(','):[];
	for (var i=0; i<catNames.length ; i++){
		var catName = catNames[i];
		if (catNames[i] != 'categories'){
			var cat = store.getTiddlerSlice(stlDefs,catNames[i]);
			if (cat) categories[catNames[i]] = cat;
		}
	}
	var t = '<<tabs txt'+stlTag;
	for(var i in categories){
		var theCat = categories[i].split(",");
		theCat[1]=theCat[1]?theCat[1]:theCat[0];
		config.shadowTiddlers[theCat[0]] = (i == 'completed')?'':config.shadowTiddlers[theCat[0]] = "<<newJournal "+ this.dateFormat + " label:'新增"+theCat[1]+"' focus:title tag:"+stlTag+" " +i+">>\n";
		config.shadowTiddlers[theCat[0]] += "<<stlManager '" + i + "' '" + stlTag + "'>>";
		t += " " + theCat[0] + " " + theCat[1] + " " + theCat[0];
	}
	t += '>>';
	wikify(t,place);
};
//}}}