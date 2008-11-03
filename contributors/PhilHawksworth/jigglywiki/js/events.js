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

		jw.log('command clicked', tiddler, command);
	
	}
	
});


// doublicking
jq('div.story').dblclick(function(ev){
	
	var target = jq(ev.target);
	jw.log('dblclick');

	// if( target.is('div.entry-content') ) {
	// 	// doubleclick tiddler text
	// 	
	// 	jw.log('tiddler dblclick');
	// 
	// }
	
});