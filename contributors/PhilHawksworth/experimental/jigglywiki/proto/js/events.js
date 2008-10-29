jw.addEventHandlers = function() {
	
	//
	// use event delgation to handle the tiddler click events.
	//
	
	$('div.story').click(function(e){
	
		// tiddlerLink clicks.
		if( $(e.target).is('a.tiddlerLink') ) {
			e.preventDefault();
			jw.tiddlerLinkClick.apply(e.target, [e.target, 'story1']);
		}
		// tiddler controls clicks
		if( $(e.target).is('a.control') ) {
			e.preventDefault();
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
			jw.tiddlerLinkClick.apply(e.target, [e.target, 'story1',{position: 'before'}]);
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
			jw.tiddlerLinkClick.apply(e.target, [e.target, 'story1', {position: 'before'}]);
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


jw.inlineMenu = function(e,menu,options) {
	var defaults = {
		offsetX: 0,
		offsetY: 0
	};
	var opts = $.extend({},defaults,options);
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


jw.tiddlerLinkClick = function(link, container, options) {
	var name = $(this).attr("href");
	var defaults = {
		relative: jw.containingTiddler($(this)), 
		container: container,
		animSrc: $(this)
	};
	var opts = $.extend(defaults, options);
	var t = jw.getTiddler(name ,container);
	if(t) {
		t.tiddlerDisplayAnim({
			animSrc:$(this)
		});		
		jw.ensureTiddlerVisible(t);
	} else {
		jw.displayTiddler(name, opts);		
	}
};