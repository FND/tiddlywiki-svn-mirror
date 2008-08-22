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
	$('div.controls').click(function(e){
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
	
	//  search click handlers.	
	$('div.search').click(function(e){
		e.preventDefault();
		// tiddlerLink clicks.
		if( $(e.target).is('a.tiddlerLink') ) {
			jw.tiddlerLinkClick.call(e.target, e, 'story1');
		}
		// search box click
		if( $(e.target).is('input') ) {
			jw.search.focus($(e.target));
		}
	 });
	//search box input.
	$('input.search').keyup(function(e){
		jw.search.keypress($(e.target));
	});
	
	
	// experimental inline menu
	$('a.action').click(function(e){
		e.preventDefault();
		jw.inlineMenu(e,'A test inline menu');
	});
	
};


jw.inlineMenu = function(e,menu) {
	if($('#popup_div').length == 0) {
		$('body').append('<div id=\'popup_div\'>'+ menu +'</div>');			
	}
	var pop = $('#popup_div');
	x = e.pageX - (parseInt(pop.width()/2)) + "px";
	y = e.pageY - (parseInt(pop.height()/2)) + "px";		
	pop.css({left:x, top:y}).swooshIn().click(function(e){
		$(this).swooshOut();
	});	
};


jw.tiddlerLinkClick = function(link, container) {
	var options = { 
		name: $(this).attr("href"),
		relative: jw.containingTiddler($(this)), 
		container: container
	};
	jw.displayTiddler(options);
};