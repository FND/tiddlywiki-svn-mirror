//{{{

// Check if we're on an iPhone
config.browser.isiPhone = config.userAgent.indexOf("iphone") != -1;

// Hack to scroll the address bar off the screen after startup
window._origRestart = window.restart;
window.restart = function() {
	window._origRestart();
	window.setTimeout(window.scrollTo,200,0,1);
	//showIndexPane();
}

// Display the list screen
function showIndexPane() {
	var e = document.getElementById("displayPane");
	if(e)
		e.style.display = "none";
	var e = document.getElementById("indexPane");
	if(e)
		e.style.display = "block";
}

window._origDisplayTiddler = Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(srcElement,title,template,animate,slowly)
{
	var e = document.getElementById("displayPane");
	if(e)
		e.style.display = "block";
	e = document.getElementById("indexPane");
	if(e)
		e.style.display = "none";
	story.closeAllTiddlers();
	window._origDisplayTiddler.apply(this,arguments);

}

config.commands.home = { text: "home", tooltip: "go back to the home page"};
config.commands.back = { text: "back", tooltip: "go back to the previous page"};
config.commands.showindex = { text: "index", tooltip: "view the index of this TiddlyWiki"};

config.commands.home.handler = function(event,src,title)
{
	story.displayTiddler(null,'Home');
	return false;
};

config.commands.back.handler = function(event,src,title)
{
	story.displayTiddler(null,'Back');
	return false;
};

config.commands.showindex.handler = function(event,src,title)
{
	//showIndexPane();
	story.displayTiddler(null,'IndexPane');
	return false;
};


// Tell TiddlyWiki to display startup timings
config.options.chkDisplayStartupTime = true;

//}}}