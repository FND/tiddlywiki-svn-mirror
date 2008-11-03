// Event handlers.


// handle a click on any element within a story
jq('div.story').click(function(ev){

	var target = jq(ev.target);

	if( target.is('a.tiddlerLink') ) {
		// tiddlerlink button clicks
		
		ev.preventDefault();
		jw.log('tiddlerLink clicked', target.text());
	
	} else if( target.is('a.command') ) {
		// Command link clicks
		
		ev.preventDefault();
		var tiddler = target.parents('div.hentry');
		var command = target.attr('class').replace('command ','');
		
		//var opts = {macro:command,tiddler:tiddler};
		//$(this).jw_invokeMacro(opts);


		jw.log('command clicked', tiddler, command);
	
	}
	
});


// double clicking
jq('div.story').dblclick(function(ev){
	
	var target = jq(ev.target);
	var tiddler = target.parents('div.hentry');
	if(tiddler.length !== 0) {
		jw.log('dblclick', tiddler.attr('id'));	
		// go to edit mode on this tiddler.
	}
	
});