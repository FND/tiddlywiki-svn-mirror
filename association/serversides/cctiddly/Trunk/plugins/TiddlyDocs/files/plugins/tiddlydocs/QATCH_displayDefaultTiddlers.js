// Allows users to change the default tiddlers for anonymous users by setting the AnonDefaultTiddlers tiddler.

// also requires overide of restart. 

Story.prototype.displayDefaultTiddlers = function(){
	story.displayTiddler(DEFAULT_EDIT_TEMPLATE, $("#ul0 :first-child")[0].id);
};