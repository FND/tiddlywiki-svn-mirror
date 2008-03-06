/***
!Daily tasks plugin

!Pseudo-code

get today's Date
if tiddler DailyTasks_<today> doesn't exist
	for each dailyTask tiddler
		in DailyTasks_<today>
			write: task <checkbox>

if <checkbox> is checked
	strikethrough task

Note for possible reporting extension:
Getting all tiddler slices will return only those tasks have not been marked up with strikethrough

***/

config.macros.dailyTasks = {
	titlePrefix: 'DailyTasks_',
	sliceName: 'task',
	tag: 'dailytask',
	checkboxOnclickMacro: '<<checkbox config.macros.dailyTasks.completeTask>>',
	checkboxOnclickMacroChecked: '<<checkbox config.macros.dailyTasks.completeTask true>>'
};

config.macros.dailyTasks.getDailyTasks = function() {
	var taskTiddlers = store.getTaggedTiddlers(this.tag);
	var tasks = [];
	for (var i=0; i<taskTiddlers.length; i++) {
		var taskTiddlerSlices = store.calcAllSlices(taskTiddlers[i].title);
		tasks.push(taskTiddlerSlices[this.sliceName]);
	}
	return tasks;
};

config.macros.dailyTasks.createDailyTaskTiddler = function(date) {
	var day = date.formatString("DDD MMM YYYY");
	var title = this.titlePrefix + day;
	if(!store.tiddlerExists(title)) {
		var t = new Tiddler(title);
		var tasks = this.getDailyTasks();
		var body = createTiddlyElement(null,"span");
		for (var i=0; i<tasks.length; i++) {
			var task = tasks[i];
			createTiddlyText(body,task+": ");
			createTiddlyText(body,this.checkboxOnclickMacro);
		}
		t.text = body.textContent;
		console.log(t.text);
		store.saveTiddler(t.title,t.title,t.text,config.options.txtUserName);
		return title;
	} else
		return false;
};

config.macros.dailyTasks.completeTask = function(ev) {
	var e = ev ? ev : window.event;
	console.log(e);
	var target = resolveTarget(e);
	console.log(target);
	console.log(this);
	// this now refers to the clicked element
	var tiddlerElem = story.findContainingTiddler(this);
	var title = tiddlerElem.getAttribute("tiddler");
	var textSpan = this.previousSibling;
	var taskCompleted = textSpan.textContent;
	// change the tiddler text and refresh the tiddler
	var t = store.getTiddler(title);
	console.log(t);
	var regexString = "("+taskCompleted+")";
	console.log(regexString);
	var taskRegex = new RegExp(regexString,"m");
	t.text = t.text.replace(taskRegex,"--$1--");
	//DEBUG: this line doesn't work
	taskRegex = new RegExp(this.checkboxOnclickMacro,"m");
	t.text = t.text.replace(taskRegex,this.checkboxOnclickMacroChecked);
	store.saveTiddler(t.title,t.title,t.text,config.options.txtUserName,new Date(),t.tags,t.fields,true,t.created);
	story.refreshTiddler(title,null,true);
};

config.macros.dailyTasks.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var today = new Date();
	var todayTiddler = this.createDailyTaskTiddler(today);
	console.log(todayTiddler);
	story.displayTiddler(place,todayTiddler);
};

// macro to add checkboxes inline with onlick behaviour
config.macros.checkbox = {};

config.macros.checkbox.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var names = params[0] ? params[0].split(".") : null;
	var checked = params[1] ? params[1] : false;
	// function to break a string function reference down into an object reference
	// stolen from config.macros.message (suggest core change if can find a way to escape need for closure)
	var lookupMessage = function(root,nameIndex) {
			if(names[nameIndex] in root) {
				if(nameIndex < names.length-1)
					return (lookupMessage(root[names[nameIndex]],nameIndex+1));
				else
					return root[names[nameIndex]];
			} else
				return null;
	};
	var onclick = lookupMessage(window,0);
	var checkbox = createTiddlyCheckbox(place,null,checked,onclick);
};