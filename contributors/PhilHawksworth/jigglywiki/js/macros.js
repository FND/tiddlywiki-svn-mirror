// Define the macros.
// Additional macros (prefixed jw_macro_) can be added to jQuery.

(function($) {

	$.fn.extend({
		jw_macro_test: function(args) {
			// simple macro for test purposes
			var text = 'this is some test text';
			this.append('<span>'+text+'</span>');
		}
	});

	$.fn.extend({
		jw_macro_today: function(args) {
			var now = new Date();
			var text = args.format ? now.formatString(args.format.trim()) : now.toLocaleString();
			this.append('<span>'+text+'</span>');
		}
	});

	$.fn.extend({
		jw_macro_version: function(args) {
			var v = jw.version;
			var text = v.major + "." + v.minor + "." + v.revision + (v.beta ? " (beta " + v.beta + ")" : "");
			this.append('<span>'+text+'</span>');
		}
	});

})(jQuery);


(function($) {

	$.fn.extend({
		jw_macro_view: function(args) {
			var defaults = {
				place: this[0],
				tiddler: null,
				element: 'div',
				css: null,
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
	});

})(jQuery);


(function($) {

	$.fn.extend({
		jw_macro_newTiddler: function(args) {
			var defaults = {
				place: this[0],
				label: "new tiddler",
				tooltip: "Create a new tiddler",
				css: 'button'
			};
			var opts = $.extend(defaults, args);
			$('<a class=\''+ opts.css +'\' title=\''+ opts.tooltip +'\' href=\'#\'>'+ opts.label +'</a>').insertAfter(opts.place).click(function(e) {
				e.preventDefault();
				createNewTiddler({place:this[0]});
			});
		}
	});

	// Private functions.
	function createNewTiddler(args) {
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

})(jQuery);


(function($) {

	$.fn.extend({
		jw_expandMacros: function(args) {
			// find any macros in this jQuery object and expand them
			console.log('hello');
			this.append('<b>some test text</b>');
			return;
	
			this.find('code.macro').each(function(n,e) {
				if( $(this).css('display') == 'block') {
					// build an object for calling the macro handler.
					var opts = {
						tiddler:args.tiddler
					};
					var t = $.trim($(e).text());
					var pairs = t.split(',');
					for (var p=0; p < pairs.length; p++) {
						nv = pairs[p].split(':');
						opts[$.trim(nv[0])] = $.trim(nv[1]);
					}
					// pass the macro name directly and remove it fro the arguments passed to the macro caller.
					var m = opts.macro;
					delete opts.macro;
					invokeMacro(m, e, opts);
				}
			});
		}
	});

	// Private functions.
	function invokeMacro(macro, place, args) {
		// Call the handler of the macro, passing along any arguments
		// and hide the macro code block.
		// console.log('Calling macro:', macro, args);
		var j = jq(place)['jw_macro_'+macro];
		if(j) {
			//jq(place)['jw_macros_'+macro]({macro:macro,params:params.readMacroParams,wikifier:wikifier,paramString:params,tiddler:tiddler});
			jq(place)['jw_macro_'+macro](args);
			place.hide();
		} else {
			console.log("No handler for ", macro);
		}
	}

})(jQuery);

