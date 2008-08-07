jigglywiki.macros = {
	'view': {
		handler: function(place, tiddler, params) { viewTiddlerProperty(place, tiddler, params); }
	},
	'edit': {
		handler: function(place, tiddler, params) { viewTiddlerProperty(place, tiddler, params); }
	}
};


function applyMacros(element, args, tiddler) {

	// build a params object from the parameters passed
	var params = {};
	var args = args.split(" ");
	var macro = args[0];
	for(var a=1; a<args.length; a++) {
		nvp = args[a].split(":");
		params[nvp[0]] = nvp[1];
	};

	// call the macro if a handler for it exists
	if(jigglywiki.macros[macro]) {
		jigglywiki.macros[macro].handler(element, tiddler, params);
	} else {
		console.log("No handler for ", macro);
	}
}


function viewTiddlerProperty(place, tiddler, params) {
	var d = getTiddlerData(tiddler, 'store');
	var h = '';
	var prop = d[params['property']];
	if(typeof prop == 'string') {
		h += prop;
	} else {
		$(prop).each(function(i,e){
			h += $(e).html();
		});
	}
	place.html(h);
}
