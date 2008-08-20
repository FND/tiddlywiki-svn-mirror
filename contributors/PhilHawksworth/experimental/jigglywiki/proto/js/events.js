jw.addEventHandlers = function() {
	
	//
	// use event delgation to handle the tiddler click events.
	//
	
	$('div.story').click(function(e){
		e.preventDefault();
		// tiddlerLink clicks.
		if( $(e.target).is('a.tiddlerLink') ) {
			jw.tiddlerLinkClick.call(e.target, e, 'story1');
		}
		// tiddler controls clicks
		if( $(e.target).is('a.control') ) {
			var fn = $(e.target).text();
			var tiddler = jw.containingTiddler(e.target);	
			if(jw.controls[fn] !== undefined) {
				jw.controls[fn].handler(tiddler);	
			} else {
				console.log("No handler for " + fn);
			}
		}
	 });

	//  control bar button click handlers.	
	$('#controls').click(function(e){
		e.preventDefault();
		// tiddlerLink clicks.
		if( $(e.target).is('a.tiddlerLink') ) {
			jw.tiddlerLinkClick.call(e.target, e, 'story1');
		}
		// tiddler controls clicks
		if( $(e.target).is('a.control') ) {
			var fn = $(e.target).text();
			var tiddler = jw.containingTiddler(e.target);
			if(jw.controls[fn] !== undefined) {
				jw.controls[fn].handler(tiddler);	
			} else {
				console.log("No handler for " + fn);
			}
		}
	 });
};


jw.tiddlerLinkClick = function(link, container) {
	var tiddlerName = $(this).attr("href");
	var ct = jw.containingTiddler($(this));
	displayTiddler(tiddlerName, ct, 'after', container, 'ViewTemplate');
};