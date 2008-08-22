// Define the macros.
// Additional macros can be added into the jw.macros namespace.
jw.macros = {
	'view': {
		handler: function(args) { this.viewTiddlerProperty(args); },
		viewTiddlerProperty: function(args) {
			var defaults = {
				tiddler: null,
				element: 'div',
				css: null,
				place: null,
				property: null
			};
			var opts = $.extend(defaults, args);	
			var data = jw.getTiddlerData(opts.tiddler, 'store');
			var val = $(data[opts.property]);
			$('<'+opts.element+'>'+ val.html() +'</'+opts.element+'>').addClass(opts.css).insertAfter(opts.place);				
		}
	}
};


// Call the handler of the macro, passing along any arguments
// and hide the macro code block.
jw.callMacro = function(macro, args) {

	// console.log('Calling macro:', macro, args);

	if(jw.macros[macro]) {
		jw.macros[macro].handler(args);
		args.place.hide();
	} else {
		console.log("No handler for ", macro);
	}
};

