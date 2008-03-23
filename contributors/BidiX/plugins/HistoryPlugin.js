/***
|''Name:''|HistoryPlugin|
|''Description:''|Limits to only one tiddler open. Manages an history stack and provides macro to navigate in this history (<<history>><<back>><<forward>>).|
|''Version:''|1.0.0|
|''Date:''|2008-03-23|
|''Source:''|http://tiddlywiki.bidix.info/#HistoryPlugin|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.3.0|
***/
//{{{
	Story.prototype.tiddlerHistory = [];
	Story.prototype.historyCurrentPos = -1;
	Story.prototype.currentTiddler = null;
	Story.prototype.maxPos = 11;

	Story.prototype.old_history_displayTiddler = Story.prototype.displayTiddler;
	Story.prototype.displayTiddler = function(srcElement,title,template,animate,slowly)
	{
		title = ((typeof title === "string") ? title : title.title);
		//SinglePageMode
		if (this.currentTiddler) this.closeTiddler(this.currentTiddler);
		if (template == 2) {
			//switch to Edit mode : don't manage
			story.old_history_displayTiddler(null,title,template,animate,slowly);
			return; 
		}
		// if same tiddler no change
		if (this.tiddlerHistory[this.historyCurrentPos] == title) {
			this.currentTiddler = title;
			story.old_history_displayTiddler(null,title,template,animate,slowly);
			return;
		}
		if (this.historyCurrentPos == this.tiddlerHistory.length -1) {
			// bottom of stack
	    	this.tiddlerHistory.push(title);
		   	if (this.tiddlerHistory.length > 11) {
	                 this.tiddlerHistory.shift();
	       	} else {
		    this.historyCurrentPos += 1;
	            }

		} else {
			// middle of stack
		    this.historyCurrentPos += 1;
			if (this.tiddlerHistory[this.historyCurrentPos] != title) {
				// path change => cut history
				this.tiddlerHistory[this.historyCurrentPos] = title;
				var a = [];
				for(var i = 0; i <= this.historyCurrentPos;i++) {
					a[i] = this.tiddlerHistory[i];
				}
				this.tiddlerHistory = a;
			}
		}
		this.currentTiddler = title;
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
		createTiddlyButton(place, 'history', 'history', config.macros.history.action);
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
				//if (story.currentTiddler) story.old_history_displayTiddler(null,story.currentTiddler);
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
				//if (story.currentTiddler) story.old_history_displayTiddler(null,story.currentTiddler);
			}
		return false;
	}
	config.macros.forward.handler = function(place,macroName,params)
	{
		createTiddlyButton(place, '>', 'forward', config.macros.forward.action, "ibutton");
	}
//}}}