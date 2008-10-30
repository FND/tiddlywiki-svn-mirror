// Define the macros.
// Additional macros can be added into the jw.macros namespace.

(function($) {

	$.fn.extend({
		jw_macros_view: function(args) {
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
		jw_macros_newTiddler: function(args) {
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



// Call the handler of the macro, passing along any arguments
// and hide the macro code block.
jw.callMacro = function(macro, args) {
	// console.log('Calling macro:', macro, args);
	var j = jq(place)['jw_macros_'+macro];
	if(j) {
		jq(place)['jw_macros_'+macro]({macro:macro,params:params.readMacroParams,wikifier:wikifier,paramString:params,tiddler:tiddler});
		args.place.hide();
	} else {
		console.log("No handler for ", macro);
	}
};

