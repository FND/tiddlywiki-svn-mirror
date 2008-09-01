// Define the macros.
// Additional macros can be added into the jw.macros namespace.
jw.macros = {
	'view': {
		handler: function(args) { 
			this.viewTiddlerProperty(args); 
		},
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
			if(opts.element == 'input') {
				$('<input type=\'text\' value=\''+ val.html() +'\'>').addClass(opts.css).insertAfter(opts.place);		
			} else {
				$('<'+opts.element+'>'+ val.html() +'</'+opts.element+'>').addClass(opts.css).insertAfter(opts.place);				
			}
		}
	},
	'newTiddler' : {
		handler: function(args) {
			var defaults = {
				place: null,
				label: "new tiddler",
				tooltip: "Create a new tiddler",
				css: 'button'
			};
			var opts = $.extend(defaults, args);
			$('<a class=\''+ opts.css +'\' title=\''+ opts.tooltip +'\' href=\'#\'>'+ opts.label +'</a>').insertAfter(opts.place).click(function(e){
				e.preventDefault();
				var op = {
					place: opts.place
				};
				jw.macros.newTiddler.createNewTiddler(op);
			});
		},
		createNewTiddler: function(args) {
			var defaults = {
				place: null,
				title: "NewTiddler",
				text: "Add your tiddler text"
			};
			var opts = $.extend(defaults, args);

			// clone the template in the store and replace the placeholder values
			var newTiddler = jw.getTiddler('TIDDLER_TEMPLATE', 'store').clone();
			var html = newTiddler.html();
			html = html.replace(/TIDDLER_TEMPLATE/g, opts.title);
			html = html.replace(/TIDDLER_TEXT/g, opts.text);
			html = html.replace(/TIDDLER_MODIFIER/g, jw.config.options.UserName);
			newTiddler.html(html);
			$('#store').append(newTiddler);
						
			//display the new tiddler in the story.			
			jw.displayTiddler(opts.title, {
				relative: jw.containingTiddler(opts.place),
				template: 'EditTemplate'
			});
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

