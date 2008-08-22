

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
		
	// get the tiddler from the store
	var t = jw.getTiddler(opts.name, 'store');
	
	// get the templated html of the tiddler
	var templatedTiddler = jw.getTemplatedTiddlerNEW(t, opts.template);
	
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

	//ensure that it is visible.
	var s = jw.getTiddler(opts.name, opts.container).show();	
	if(!opts.overflow) {
		var y = s.offset().top; 
		$('html,body').animate({scrollTop: y}, 500);
	}
};


// Map the tiddler values onto a given template structure.
jw.getTemplatedTiddlerNEW = function(tiddler,template) {
	
	// get a copy of the template html structure from template tiddler.
	var html = $(jw.getTiddlerData(template,'store').text).clone();
	html.find(":first-child").prepend("<a class='tiddlerName' name='tiddler:"+ jw.getTiddlerData(tiddler,'store').tiddlerName +"'></a>");
	
	// // // find macros in this tiddler.
	html.find('code.macro').each(function(n,e){
	
		// build an object for calling the macro handler.
		var t = $.trim($(e).text());
		var pairs = t.split(',');
		var opts = {
			tiddler:tiddler,
			place:$(this)
		};
		for (var p=0; p < pairs.length; p++) {
			nv = pairs[p].split(':');
			opts[$.trim(nv[0])] = $.trim(nv[1]);
		};	
	
		// pass the macro name directly and remove it fro the arguments passed to the macro caller.
		var m = opts.macro;
		delete opts.macro;
		jw.callMacro(m, opts);
	
	});
	
	return html.html();
};



// Map the tiddler values onto a given template structure.
// jw.getTemplatedTiddler = function(tiddler,template) {
// 	
// 	// get a copy of the template html structure from template tiddler.
// 	var html = $(jw.getTiddlerData(template,'store').text).clone();
// 	
// 
// 	// //use the macros in the templates to populate them.
// 	html.find('*').each(function(i,n) {	
// 		var macro = $(n).attr('macro');
// 		if(macro !== undefined) {
// 			jw.applyMacros($(n), macro, tiddler);
// 		}
// 		if(i==0){
// 			$(n).prepend("<a class='tiddlerName' name='tiddler:"+ jw.getTiddlerData(tiddler,'store').tiddlerName +"'></a>");
// 		}
// 	});
// 	
// 	return html.html();
// };


