/*{{{*/

config.commands.home = { text: "home", tooltip: "go back to the home page"};
config.commands.back = { text: "back", tooltip: "go back to the previous page"};

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

/*}}}*/