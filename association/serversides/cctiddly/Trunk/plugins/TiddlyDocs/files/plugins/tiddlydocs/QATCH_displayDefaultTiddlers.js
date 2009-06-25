// Allows users to change the default tiddlers for anonymous users by setting the AnonDefaultTiddlers tiddler.

// also requires overide of restart. 

Story.prototype.displayDefaultTiddlers = function(){
	if($("#ul0 :first-child").length !=0){
		story.displayTiddler(DEFAULT_EDIT_TEMPLATE, $("#ul0 :first-child")[0].id);
	}else{
	 	var tiddlers="";
		if(isLoggedIn()){        
			var url = window.location;        
			url = url.toString();        
			var bits = url.split('#');        
			if(bits.length == 1){            
				tiddlers = store.filterTiddlers(store.getTiddlerText("DefaultTiddlers"));            
				story.displayTiddlers(null, tiddlers);
			}
		
		}else{         
			tiddlers=store.filterTiddlers(store.getTiddlerText("AnonDefaultTiddlers"));        
			story.displayTiddlers(null, tiddlers);   
		}   
	} 
};