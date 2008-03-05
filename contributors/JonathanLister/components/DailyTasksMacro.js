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
	titlePrefix = 'DailyTasks_',
	sliceName = 'task'
	tag = 'dailytask'
};

config.macros.dailyTasks.getDailyTasks = function() {
	var taskTiddlers = store.getTaggedTiddlers(this.tag);
	var tasks = [];
	for (var i=0; i<taskTiddlers.length; i++) {
		var taskTiddlerSlices = store.calcAllSlices(taskTiddlers[i]);
		tasks.push(taskTiddlerSlices[this.sliceName]);
	}
	return tasks;
};

config.macros.dailyTasks.createDailyTaskTiddler = function(date) {

};

config.macros.dailyTasks.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	
};