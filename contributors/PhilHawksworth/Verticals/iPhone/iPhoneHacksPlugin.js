//{{{

	// Check if we're on an iPhone
	config.browser.isiPhone = config.userAgent.indexOf("iphone") != -1;

	config.options.chkAnimate = false;

	// Hack to scroll the address bar off the screen after startup
	window._origRestart = window.restart;
	window.restart = function() {
		window._origRestart();
		window.setTimeout(window.scrollTo,200,0,1);
	};
	
	//Provide sensible history functionality
	Story.prototype.history = {
		buffer : new Array(),
		bufferSize : 20,
		p : 0,
		add : function(t){
			this.buffer.push(t);
			if(this.buffer.length > this.bufferSize){
				this.buffer.slice(this.buffer.length);
			}
			p = this.buffer.length -1;
		},
		go : function(){
			p--;
			if (p < 0) p = 0;
			story.displayTiddler(null,this.buffer[p],null,null,null,true);
		}
	};

	window._origDisplayTiddler = Story.prototype.displayTiddler;
	Story.prototype.displayTiddler = function(srcElement,title,template,animate,slowly,skiphistory)	{
		story.closeAllTiddlers(title);
		if(!skiphistory) story.history.add(title);
		window._origDisplayTiddler.apply(this,arguments);
	};

	config.commands.home = { text: "home", tooltip: "go back to the home page"};
	config.commands.back = { text: "back", tooltip: "go back to the previous page"};
	config.commands.showindex = { text: "index", tooltip: "view the index of this TiddlyWiki"};

	config.commands.home.handler = function(event,src,title) {
		story.displayTiddler(null,'Home');
		return false;
	};

	config.commands.back.handler = function(event,src,title) {
		story.history.go();
		return false;
	};

	config.commands.showindex.handler = function(event,src,title) {
		story.displayTiddler(null,'IndexPane');
		return false;
	};

	// Tell TiddlyWiki to display startup timings
	config.options.chkDisplayStartupTime = true;

//}}}