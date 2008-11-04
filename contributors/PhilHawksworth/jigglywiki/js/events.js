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
		var opts = {};
		opts.tiddler = target.parents('div.hentry');
		opts.macro = 'jw_controls_' + target.attr('class').replace('command ','');
		jq(this).jw_invokeMacro(opts);
		jw.log('command clicked', opts.macro, opts.tiddler);
	}
});


// double clicking
jq('div.story').dblclick(function(ev){

	var target = jq(ev.target);
	var tiddler = target.parents('div.hentry');
	if(tiddler.length !== 0) {
		jw.log('dblclick', tiddler.attr('id'));
		// go to edit mode on this tiddler.
		var opts = {macro:'jw_controls_edit',tiddler:tiddler};
		jq(this).jw_invokeMacro(opts);
	}

});


// Bind custom event handlers to the story
//

jq('div.story').bind('tiddlerAddedEvent', function(e,args) {
	jw.log('tiddlerAddedEvent',args);
});


