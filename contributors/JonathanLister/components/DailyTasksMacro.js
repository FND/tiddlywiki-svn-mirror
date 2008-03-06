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
	tag: 'dailytask'
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
	var day = date.formatString("DDD");
	var title = this.titlePrefix + day;
	if(!store.tiddlerExists(title)) {
		var t = new Tiddler(title);
		var tasks = this.getDailyTasks();
		var body = createTiddlyElement(null,"span");
		for (var i=0; i<tasks.length; i++) {
			var task = tasks[i];
			createTiddlyText(createTiddlyElement(body,"span"),task+": ");
			createTiddlyCheckbox(body,null,null,this.completeTask);
		}
		t.text = "<html>"+body.innerHTML+"</html>";
		console.log(t.text);
		store.saveTiddler(t.title,t.title,t.text,config.options.txtUserName);
	}
	return title;
};

config.macros.dailyTasks.completeTask = function(ev) {
	var e = ev ? ev : window.event;
	var target = resolveTarget(e);
	if(target.checked)
		target.checked = false;
	else
		target.checked = true;
	// this now refers to the clicked element
	var tiddlerElem = story.findContainingTiddler(this);
	var title = tiddlerElem.getAttribute("tiddler");
	var textSpan = this.previousSibling;
	var taskCompleted = textSpan.textContent;
	// change the tiddler text and refresh the tiddler
	var t = store.getTiddler(title);
	var regexString = taskCompleted;
	var taskRegex = new Regex(regexString,"m");
	t.text.replace(taskRegex,"---$1---");
	store.saveTiddler(t.title,t.title,t.text,config.options.txtUserName,new Date(),t.tags,t.fields,true,t.created);
	story.refreshTiddler(title);
};

config.macros.dailyTasks.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var today = new Date();
	var todayTiddler = this.createDailyTaskTiddler(today);
	// THIS LINE ISN'T WORKING
	story.displayTiddler(todayTiddler);
};