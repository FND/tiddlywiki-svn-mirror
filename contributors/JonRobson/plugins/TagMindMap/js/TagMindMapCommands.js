config.commands.newChild ={text: "add child",tooltip: "Add child tiddler"};
config.commands.newChild.handler = function(event,src,title){
	
	clearMessage();
	var newTitle = prompt("Please name a child of this tiddler");
		if(!newTitle) return;
	var tags = [title];
	story.displayTiddler(null,newTitle,DEFAULT_EDIT_TEMPLATE,false,null,null);
		config.commands.editTiddler.handler(event,src,newTitle);
	for(var t=0;t<tags.length;t++)
		story.setTiddlerTag(newTitle,tags[t],+1);
	//story.focusTiddler(newTitle,config.options.txtEditorFocus||"text");
	
		config.commands.saveTiddler.handler(event,src,newTitle);
	return false;
};

config.commands.newParent ={text: "add parent",tooltip: "Name and thus associate a parent with this tiddler"};
	
config.commands.newParent.handler = function(event,src,title){
	clearMessage();

	var newTitle = prompt("Please name a parent of this tiddler");
	
	if(!newTitle) return;
	var tags = [newTitle];
	
	/*update existing tiddler */
	config.commands.editTiddler.handler(event,src,title);
	var tiddlerElem = story.getTiddler(title);
	for(var t=0;t<tags.length;t++){
		story.setTiddlerTag(title,tags[t],+1);
	}
	config.commands.saveTiddler.handler(event,src,title);
	
	/*allowing editing of this new tiddler */
	if(story.getTiddler(newTitle) == null);
		story.displayTiddler(null,newTitle,null,false,null,null);
		
	//config.commands.editTiddler.handler(event,src,newTitle);
	
	return false;

}