/***
|''Name:''|DailyTasksMacro|
|''Description:''|For habit forming. Tick off tasks on a daily basis and don't break the chain.|
|''Author''|Saq Imtiaz (modifications by Jon Lister)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/components |
|''Version:''|0.2|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|
***/

function getOffsetDate (offset) {
	var date = new Date();
	dt=date.getDate();
	date.setDate(dt-offset);
	return date;
};

config.macros.deletedailytask = {
	
	label : ' X ',
	
	tooltip : 'delete this daily task',
	
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		var b = createTiddlyButton(place,this.label,this.tooltip,this.onclick,'deletedailytask dailytaskbutton button');
		b.setAttribute('tiddler',params[0]);
	},
	
	onclick : function(e) {
		if (!e) var e = window.event;
		var tiddler = this.getAttribute('tiddler');
		var doIt = confirm('are you sure you wish to delete the task: ' + tiddler);
		if (doIt) {
			story.closeTiddler(tiddler);
			store.removeTiddler(tiddler);
			store.notify(tiddler,true);
			story.refreshTiddler(story.findContainingTiddler(this).getAttribute('tiddler'),null,true);
		}
		return false;
	}
	

};

config.macros.newdailytask = {
	
	label : ' + ',
	
	tooltip : 'add a new daily task',
	
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		var b = createTiddlyButton(place,this.label,this.tooltip,this.onclick,'button dailytaskbutton');
		b.place = place;
	},
	
	onclick : function(e) {
		if (!e) var e = window.event;
		var t = resolveTarget(e);
		if(! t.div) {
			var d = createTiddlyElement(null,'div',null,'newdailytaskform');
			t.parentNode.insertBefore(d,t.nextSibling);
			var input = createTiddlyElement(d,'input',null,'dailytaskinput');
			t.div = d;
			input.value = 'enter new task';
			input.select();
			input.focus();
			createTiddlyElement(d,'br');
			createTiddlyButton(d,'cancel','cancel',function(){removeNode(d); t.div = null;return false;});
			createTiddlyButton(d,'save','save this new daily task',function(e){if(!e) var e = window.event; removeNode(d); t.div = null; config.macros.newdailytask.save(input.value); story.refreshTiddler(story.findContainingTiddler(t).getAttribute('tiddler'),null,true); return false;});
		}
		return false;
	},
	
	removeNode : function (m) {
		removeChildren(m);
		m.parentNode.removeChild(m);
	},
	
	save : function (task) {
		if (store.getTiddler(task)) {
			alert('a tiddler with this name already exists');
		}
		var tiddler = new Tiddler(task);
		tiddler.text = '<<dailytask>>';
		tiddler.tags.push('dailytask');
		tiddler.modifier = config.options.txtUserName;
		store.addTiddler(tiddler);
		store.notify(tiddler.title,true);
	}
	
	
};

config.macros.dailytasks = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		store.addNotification("dailyTaskStyles",refreshStyles);
		store.notify("dailyTaskStyles");
		var dailytasks = store.getTaggedTiddlers('dailytask');
		var out = [];
		out.push("|dailytasksholder|k");
		out.push("|Daily Tasks|c");
		for (var i=0; i<dailytasks.length;i++) {
			out.push("|<<deletedailytask " + dailytasks[i].title + ">>|[[" + dailytasks[i].title + "]] |<<dailytask [[" + dailytasks[i].title + "]]>>|");
		}
		out.push("|<br><<newdailytask>>|>|>|");
		wikify(out.join('\n'),place);
	}
	
};

config.macros.dailytask = {

	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		var tiddler = params[0] ? store.getTiddler(params[0]) : tiddler;
		var theTable = createTiddlyElement(place,"table",null,"dailytasks");
		var theBody = createTiddlyElement(theTable,"tbody");
		var theRow = createTiddlyElement(theBody,"tr");
	
		var db = store.getValue(tiddler,'dailytasks');
		var days = db? db.split(',') : [];
		for (var i=9; i>-1; i--) {
			var date = getOffsetDate(i);
			var datestr = date.formatString('0DD.0MM.YY');
			var done = days.contains(datestr);
			var na = !done  && (tiddler.created > date);
			var className = done? 'taskcomplete' : (na || i==0 ? (i==0?'tasktoday' : 'tasknewer') : 'taskmissed');
	
			var box = createTiddlyElement(theRow,"td",null,"navlinkcell "+className," ");
			box.setAttribute('date',datestr);
			box.setAttribute('task',tiddler.title);
			box.title = datestr + ' (' + date.formatString('ddd') + ')';
			box.onclick = this.toggleStatus;
		}
	},
	
	toggleStatus : function(e) {
		if(!e) var e = window.event;
		var t = resolveTarget(e);
		var val = t.getAttribute('date');
		var tiddler = t.getAttribute('task');
		var db = store.getValue(tiddler,'dailytasks');
		var days = db? db.split(',') : [];
		if (days.contains(val))
			days.remove(val);
		else
			days.push(val);
		store.setValue(tiddler,'dailytasks',days.join(','));
		story.refreshTiddler(story.findContainingTiddler(t).getAttribute('tiddler'),null,true);
		return false;
	}
};

//add style as a shadow tiddler
merge(config.shadowTiddlers,{
	dailyTaskStyles: "table.dailytasksholder table.dailytasksheader td {border:1px solid #000; padding:2px;} \n\
td.taskmissed {background:red;} \n\
td.taskcomplete {background:yellow;} \n\
/* td.tasknewer {visibility:hidden;} */ \n\
table.dailytasksholder table.dailytasks td.tasknewer, table.dailytasks td.tasknewer ,td.tasknewer {border:1px solid #ccc; background:#eee;} \n\
table.dailytasks, table.dailytasksheader {border-collapse:separate; border:none;} \n\
table.dailytasksholder table.dailytasks td, table.dailytasks td {border:1px solid #000; padding:10px;} \n\
table.dailytasksholder table.dailytasks {margin:0 10px;} \n\
table.dailytasksholder caption {font-size:200%; font-weight:bold;} \n\
table.dailytasksholder {border:none;} \n\
table.dailytasksholder td, table.dailytasksholder tr {border:none; padding: 0;} \n\
.newdailytaskform { padding : 10px; margin : 10px; background: #eee; } \n\
.newdailytaskform input {padding:5px; margin:5px;} \n\
.dailytaskbutton.button {color:#999; border:1px solid #999; padding:2px 5px; margin:5px;} \n\
.deletedailytask.button {padding:2px 5px; margin:5px; color:#aaa; border:1px solid #999;} \n\
table.dailytasksholder table.dailytasks td.tasktoday, table.dailytasks td.tasktoday {border:2px solid #000;}"});