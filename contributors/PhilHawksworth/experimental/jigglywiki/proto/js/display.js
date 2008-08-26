
jw.displayTiddler = function(options) {

	var defaults = {
		name: null,
		relative: null,
		position: 'after',
		container: 'story1',
		template: 'ViewTemplate',
		overflow: false
	};
	var opts = $.extend(defaults, options);
	var t = jw.getTiddler(opts.name, 'store');
	
	if(!t) {
		alert("Nope. Couldn't find a tiddler called " + opts.name + ".\n\nAre you sure that's what it's called?");
		return;
	}
	
	// get a copy of the template html structure from template tiddler.
	var templ = $(jw.getTiddlerData(opts.template,'store').text).clone();
	templ.find(":first-child").prepend("<a class='tiddlerName' name='tiddler:"+ jw.getTiddlerData(t,'store').tiddlerName +"'></a>");
	templatedTiddler = templ.html();
	
	// switching a template
	if(opts.position == 'replace') {
		var refTiddler = jw.getTiddler(opts.relative, opts.container);
		refTiddler.after(templatedTiddler);
		refTiddler.remove();
	} 

	// if the tiddler is not in the story, then add it now.		
	if(!jw.getTiddler(opts.name, opts.container)) {
		if(opts.relative) {
			var refTiddler = jw.getTiddler(opts.relative, opts.container);	
			if(opts.position == 'before'){
				refTiddler.before(templatedTiddler);
			} else {
				refTiddler.after(templatedTiddler);
			}
		} else {
			$('#'+opts.container).append(templatedTiddler);
		}
	}
	
	var displayTiddler = jw.getTiddler(opts.name, opts.container);
	
	// apply the view macros.
	jw.findMacros(displayTiddler,t);

	// apply the macros contained in the tiddler.
	jw.findMacros(displayTiddler,t);
	
	// Refactor this stuff!
	
	displayTiddler.show();
	if(!opts.overflow) {
		jw.ensureTiddlerVisible(displayTiddler);
	}
};


//ensure that a tiddler is visible in the story.
jw.ensureTiddlerVisible = function(t) {
	var y = $(t).offset().top; 
	$('html,body').animate({scrollTop: y}, 500);	
};


// find and call macros in this tiddler.
jw.findMacros = function(displayTiddler, storedTiddler) {	
	displayTiddler.find('code.macro').each(function(n,e){		
		if( $(this).css('display') == 'block') {		
			// build an object for calling the macro handler.
			var opts = {
				tiddler:storedTiddler,
				place:$(this)
			};
			var t = $.trim($(e).text());
			var pairs = t.split(',');
			for (var p=0; p < pairs.length; p++) {
				nv = pairs[p].split(':');
				opts[$.trim(nv[0])] = $.trim(nv[1]);
			};	
			// pass the macro name directly and remove it fro the arguments passed to the macro caller.
			var m = opts.macro;
			delete opts.macro;
			jw.callMacro(m, opts);
		}
	});	
};


