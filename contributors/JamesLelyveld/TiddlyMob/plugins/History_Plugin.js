//{{{
Story.prototype.tiddlerHistory = [];
Story.prototype.historyCurrentPos = -1;
Story.prototype.currentTiddler = null;
Story.prototype.maxPos = 11;

Story.prototype.old_history_displayTiddler = Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(srcElement,title,template,animate,slowly)
{

	// change text of menu button 
	if (title != '[object Object]'){
		document.getElementById('uNoteMenu').innerHTML = title;
	}
	
	// enforce single page mode - Code section amended from SinglePagePlugin by Eric Shulman
	story.forEachTiddler(function(tid,elem) {
			// skip current tiddler.
			if (tid == title) {
				return;
			}
			// if a tiddler is being edited, ask before closing
			if (elem.getAttribute("dirty")=="true") {
				// ask for permission
				var msg="'"+tid+"' is currently being edited. Do you want to save the changes\n\n";
				msg+="Press Ok to save and close this tiddler\nor press Cancel to abandon changes";
				if (confirm(msg)){
					story.saveTiddler(tid);
					// as title of new tiddler may have changed need to ensure it's closed on save
					story.forEachTiddler(function(tid2,elem2) {
						if(tid2 != title){
							story.closeTiddler(tid2);
						}
						});
				}
			}
			story.closeTiddler(tid);
	});
	
	/*
	if (template == 2) {	
		//switch to Edit mode : don't manage
		if (title == 'New Tiddler') {
			// JL - New Tiddler so close existing tiddler
			if (this.currentTiddler) this.closeTiddler(this.currentTiddler);
		}
		// JL - otherwise existing code - need to look at this with relation to duplicate records in history.
		story.old_history_displayTiddler(null,title,template,animate,slowly);
		return; 
	}
	if (this.currentTiddler) this.closeTiddler(this.currentTiddler);
	*/
	if (this.historyCurrentPos == this.tiddlerHistory.length -1) {
		// bottom of stack
    	this.tiddlerHistory.push(((typeof title === "string") ? title : title.title));
	   	if (this.tiddlerHistory.length > 11) {
                 this.tiddlerHistory.shift();
       	} else {
	    this.historyCurrentPos += 1;
            }
    
	} else {
	    this.historyCurrentPos += 1;
		if (this.tiddlerHistory[this.historyCurrentPos] != title) {
			// cut history
			this.tiddlerHistory[this.historyCurrentPos] = title;
			var a = [];
			for(var i = 0; i <= this.historyCurrentPos;i++) {
				a[i] = this.tiddlerHistory[i];
			}
			this.tiddlerHistory = a;
		}
	}
	this.currentTiddler = ((typeof title === "string") ? title : title.title);
	story.old_history_displayTiddler(null,title,template,animate,true);
        scrollTo(0, 1);
}

Story.prototype.old_history_closeTiddler = Story.prototype.closeTiddler;
Story.prototype.closeTiddler = function(title,animate,slowly)
{
	this.currentTiddler = null;
    story.old_history_closeTiddler.apply(this,arguments);
}

config.macros.history = {};
config.macros.history.action = function(event) {
var popup = Popup.create(this);
	if(popup)
		{
        if (!story.tiddlerHistory.length)
            createTiddlyText(popup,"No history");
        else
           {
           var c = story.tiddlerHistory.length;
		   for (i=0; i<c;i++ )
               {
				var elmt = createTiddlyElement(popup,"li");
			   	var btn = createTiddlyButton(elmt,story.tiddlerHistory[i],story.tiddlerHistory[i],config.macros.history.onClick);
				btn.setAttribute("historyPos",i);
		       }
           }
        }
	Popup.show(popup,false);
	event.cancelBubble = true;
	if (event.stopPropagation) event.stopPropagation();
	return false;
}
config.macros.history.handler = function(place,macroName,params)
{
	createTiddlyButton(place, 'history', 'history', config.macros.history.action, 'button hist');
}

config.macros.history.onClick = function(ev)
{
	var e = ev ? ev : window.event;
	var historyPos = this.getAttribute("historyPos");
	story.historyCurrentPos = historyPos -1;
	story.displayTiddler(null,story.tiddlerHistory[historyPos]);
	return false;
};

config.macros.back = {};
config.macros.back.action = function() {
       if (story.historyCurrentPos > 0) {
			if (story.currentTiddler) story.closeTiddler(story.currentTiddler);
			story.historyCurrentPos = story.historyCurrentPos -2;
			story.displayTiddler(null,story.tiddlerHistory[story.historyCurrentPos+1]);
		} else {
			if (story.currentTiddler) story.old_history_displayTiddler(null,story.currentTiddler);
			};
	return false;
}
config.macros.back.handler = function(place,macroName,params)
{
	createTiddlyButton(place, '<', 'back', config.macros.back.action,"backButton");
}

config.macros.forward = {};
config.macros.forward.action = function() {
       if (story.historyCurrentPos < story.tiddlerHistory.length -1) {
			if (story.currentTiddler) story.closeTiddler(story.currentTiddler);
			//story.historyCurrentPos = story.historyCurrentPos;
			story.displayTiddler(null,story.tiddlerHistory[story.historyCurrentPos+1]);
		} else {
			if (story.currentTiddler) story.old_history_displayTiddler(null,story.currentTiddler);
		}
	return false;
}
config.macros.forward.handler = function(place,macroName,params)
{
	createTiddlyButton(place, '>', 'forward', config.macros.forward.action, "ibutton");
}
//}}}
