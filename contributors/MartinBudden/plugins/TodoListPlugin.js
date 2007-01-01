/***
|''Name:''|TodoListPlugin|
|''Description:''|Simple tabbed todo list|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Source:''|http://martinplugins.tiddlywiki.com/#TodoListPlugin|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins|
|''Version:''|0.0.2|
|''Date:''|July 31, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.0+|
***/

/*{{{*/
config.macros.listTodos = {
	todoTag:"Todo",
	todoCompletedTag:"TodoCompleted",
	todoAbandonedTag:"TodoAbandoned",
	todoOnHoldTag:"TodoOnHold"
};

config.macros.listTodos.handler = function(place,macroName,params,wikifier,paramString,aTiddler)
{
	var tag0 = params[0];
	var tag1 = params[1];
	var tag2 = params[2];
	var tag3 = params[3];
	var results = [];
	var fn = function(title,tiddler) {
		if(tiddler.isTagged(config.macros.listTodos.todoTag) &&
			(!tiddler.isTagged(config.macros.listTodos.todoCompletedTag)) &&
			(!tiddler.isTagged(config.macros.listTodos.todoAbandonedTag)) &&
			(!tiddler.isTagged(config.macros.listTodos.todoOnHoldTag)) &&
			(!tag0 || tiddler.isTagged(tag0)) &&
			(!tag1 || tiddler.isTagged(tag1)) &&
			(!tag2 || tiddler.isTagged(tag2)) &&
			(!tag3 || tiddler.isTagged(tag3)) ) {
				results.push(tiddler);
		}
	};

	store.forEachTiddler(fn);
	var ul = createTiddlyElement(place,"ul");
	for(var i=0;i<results.length;i++) {
		var li = createTiddlyElement(ul,"li");
		createTiddlyLink(li,results[i].title,true);
	}
};
/*}}}*/
/*{{{*/
config.macros.listCompletedTodos = {};

config.macros.listCompletedTodos.handler = function(place,macroName,params,wikifier,paramString,aTiddler)
{
	var tag1 = params[1];
	var tag2 = params[2];
	var tag3 = params[3];
	var results = [];
	var fn = function(title,tiddler) {
		if(tiddler.isTagged(config.macros.listTodos.todoTag) && tiddler.isTagged(config.macros.listTodos.todoCompletedTag) &&
			(!tag1 || tiddler.isTagged(tag1)) && (!tag2|| tiddler.isTagged(tag2)) && (!tag3 || tiddler.isTagged(tag3)) ) {
				results.push(tiddler);
		}
	};

	store.forEachTiddler(fn);
	var ul = createTiddlyElement(place,"ul");
	for(var i=0;i<results.length;i++) {
		var li = createTiddlyElement(ul,"li");
		createTiddlyLink(li,results[i].title,true);
	}
};
/*}}}*/
/*{{{*/
config.macros.listTags = {};
config.macros.listTags.handler = function(place,macroName,params)
{
	var tags = store.getTaggedTiddlers(params[0],params[1]); // Second parameter is field to sort by (eg, title, modified, modifier or text)
	var ul = createTiddlyElement(place,"ul");
	for(var i=0;i<tags.length;i++) {
		var li = createTiddlyElement(ul,"li");
		createTiddlyLink(li,tags[i].title,true);
	}
};
/*}}}*/
/*{{{*/
config.macros.newTodo = {
	label: "new todo",
	prompt: "new todo",
	title: "New Todo"
};

config.macros.newTodo.handler = function(place,macroName,params)
{
	if (readOnly) {return;}

	var title = params[0] ? params[0] : config.macros.newTodo.title;
	//#var title = config.macros.newTodo.title;
	//#var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick,null,null,this.accessKey);
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	btn.setAttribute("title",config.macros.newTodo.title);
	btn.setAttribute("params",params.join("|"));
};

config.macros.newTodo.onClick = function(e)
{
	//var title = this.getAttribute("title");
	var title = config.macros.newTodo.title;
	var params = this.getAttribute("params").split("|");
	story.displayTiddler(null,title,DEFAULT_EDIT_TEMPLATE);
	for(var i=1;i<params.length;i++) {
		story.setTiddlerTag(title,params[i],+1);
	}
	story.setTiddlerTag(title,config.macros.listTodos.todoTag,+1);
	story.focusTiddler(title,"text");
	return false;
};
/*}}}*/
