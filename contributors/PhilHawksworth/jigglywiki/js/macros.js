// Define the macros.
// Additional macros (prefixed jw_macro_) can be added to jQuery.

(function($) {

	$.fn.extend({
		jw_macro_test: function(args) {
			// simple macro for test purposes
			var text = 'this is some test text';
			this.after('<span>'+text+'</span>');
		}
	});

	$.fn.extend({
		jw_macro_today: function(args) {
			var now = new Date();
			var text = args.format ? now.formatString(args.format) : now.toLocaleString();
			this.after('<span>'+text+'</span>');
		}
	});

	$.fn.extend({
		jw_macro_version: function(args) {
			var v = jw.version;
			var text = v.major + "." + v.minor + "." + v.revision + (v.beta ? " (beta " + v.beta + ")" : "");
			this.after('<span>'+text+'</span>');
		}
	});

	$.fn.extend({
		jw_macro_view: function(args) {
			var defaults = {
				place: this[0],
				tiddler: null,
				element: 'div',
				css: null,
				property: null
			};
			var tiddler = this.parents('div.hentry');
			var html = tiddler.find('div.entry-content').html();
			//console.log('tiddler',tiddler,html);
			var opts = $.extend(defaults, args);
			/*var data = jw.getTiddlerData(opts.tiddler, 'store');
			var val = $(data[opts.property]);
			if(opts.element == 'input') {
				$('<input type=\'text\' value=\''+ val.html() +'\'>').addClass(opts.css).insertAfter(opts.place);
			} else {
				$('<'+opts.element+'>'+ val.html() +'</'+opts.element+'>').addClass(opts.css).insertAfter(opts.place);
			}*/
		}
	});

	$.fn.extend({
		jw_macro_list: function(args) {
			var defaults = {};
			var opts = $.extend(defaults,args);
			var text = "<ul>";
			jw.store.fetch().each(function(){
				text += "<li>"+$(this).find("h2.entry-title").text()+"</li>\n";
			});
			text + "</ul>";
			this.after(text);
		}
	});

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
			this.find('code.macro').each(function(n,e) {
				if( $(this).css('display') == 'block') {
					// build an object for calling the macro handler.
					var opts = {};
					var t = $.trim($(e).text());
					var c = 1;
					var s = 0;
					var i = findNakedSpace(t,s);
					var p = i==-1 ? t.substr(s) : t.substr(s,i);
					while(true) {
						var ci = p.indexOf(':');
						if(ci==-1) {
							// parameter is unnamed
							opts[c++] = p;
						} else {
							var name = p.substr(0,ci);
							var val = p.substr(ci+1);
							val = $.trim(val);
							if(val.charAt(0)=='"' && val.charAt(val.length-1)=='"') {
								val = val.substr(1,val.length-2);
							}
							opts[name] = val; 
						}
						s = i+1;
						i = findNakedSpace(t,s);
						if(i==-1)
							break;
						p = i==-1 ? t.substr(s) : t.substr(s,i);
					}
					invokeMacro(e, opts);
				}
			});
		}
	});

	// Private functions.
	function findNakedSpace(text,start) {
		// find the next space not surrounded by quotes
		var d = text.indexOf(' ',start);
		if(d==-1)
			return -1;
		var qs = text.indexOf('"',start);
		if(qs==-1 || qs > d)
			return d;
		var qe = text.indexOf('"',qs);
		if(qe==-1)
			return d;
		return findNakedSpace(text,qe+1);
	}

	function invokeMacro(place, args) {
		// Call the handler of the macro, passing along any arguments
		// and hide the macro code block.
		var macro = args['macro'];
		var j = jq(place)['jw_macro_'+macro];
		if(j) {
			jq(place)['jw_macro_'+macro](args);
			$(place).hide();
		} else {
			jw.log("No handler for ", macro);
		}
	}

})(jQuery);
