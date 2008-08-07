
function displayTiddler(name, relative, position, container, template, overflow) {

	// get the tiddler from the store
	var t = getTiddler(name, 'store');

	// get the templated html of the tiddler
	var templatedTiddler = getTemplatedTiddler(t, template);

	// switching a template
	if(position == 'replace') {
	var refTiddler = getTiddler(relative, container);
		refTiddler.after(templatedTiddler);
		refTiddler.remove();
	} 

	// if the tiddler is not in the story, then add it now.		
	if(!getTiddler(name, container)) {
		if(relative) {
			var refTiddler = getTiddler(relative, container);	
			if(position == 'before'){
				refTiddler.before(templatedTiddler);
			} else {
				refTiddler.after(templatedTiddler);
			}
		} else {
			$('#'+container).append(templatedTiddler);
		}
	}
	//ensure that it is visible.
	var s = getTiddler(name, container).show();	
	if(!overflow) {
		var y = s.offset().top; 
		$('html,body').animate({scrollTop: y}, 500);
	}		
}


// Map the tiddler values onto a given template structure.
function getTemplatedTiddler(tiddler,template) {
	
	// get a copy of the template html structure from template tiddler.
	var html = $(getTiddlerData(template,'store').text).clone();
	
	// //use the macros in the templates to populate them.
	html.find('*').each(function(i,n) {	
		var macro = $(n).attr('macro');
		if(macro !== undefined) {
			applyMacros($(n), macro, tiddler);
		}
		if(i==0){
			$(n).prepend("<a class='tiddlerName' name='tiddler:"+ getTiddlerData(tiddler,'store').tiddlerName +"'></a>");
		}
	});
	
	
	return html.html();
}


