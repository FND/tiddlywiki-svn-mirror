// Define the macros.
// Additional macros (prefixed jw_macro_) can be added to jQuery.


(function($) {

	$.fn.extend({
		jw_macro_today: function(args) {
			var now = new Date();
			var text = args.format ? now.formatString(args.format) : now.toLocaleString();
			this.after('<span>'+text+'</span>');
		},

		jw_macro_version: function(args) {
			var v = jw.version;
			var text = v.major + "." + v.minor + "." + v.revision + (v.beta ? " (beta " + v.beta + ")" : "");
			this.after('<span>'+text+'</span>');
		}
	});

	$.fn.extend({
		// commands
		jw_macro_closeTiddler: function(args) {
		},
		jw_macro_closeOthers: function(args) {
		},
		jw_macro_editTiddler: function(args) {
		},
		jw_macro_saveTiddler: function(args) {
		},
		jw_macro_cancelTiddler: function(args) {
		}
	});
	$.fn.extend({
		jw_macro_view: function(args) {

			jw.log('view', args);
			var defaults = {
				place: this[0],
				tiddler: $(this).parents('div.hentry').attr('id').replace('tiddler:',''),
				element: 'div',
				css: null,
				property: null
			};
			var opts = $.extend({}, defaults, args);
			var tiddler = jw.store.fetch(opts.tiddler);
						
			var optsproperty = "";
			var output = 'VIEW MACRO: ' + opts.tiddler +"("+ optsproperty +") in a " + opts.element;
						
			this.after(output);

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
			var defaults = {
				css: 'tiddlerLink'
			};
			var opts = $.extend(defaults,args);
			var list = "<ul>";
			jw.store.fetch().each(function() {
				var title = $(this).find("h2.entry-title").text();
				var link = '<a class="'+ opts.css +'" title="'+ title +'" href="#tiddler:'+ title +'">'+title+'</a>';
				list += "<li>"+link+"</li>\n";
			});
			list += "</ul>";
			this.after(list);
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


	$.fn.extend({
		jw_macro_permaview: function(args) {
			var defaults = {
				css: 'button',
				title: jw.locale.permaview.title, // The tooltip
				text: jw.locale.permaview.text
			};
			var opts = $.extend(defaults,args);
			var link = '<a class="'+ opts.css +'" title="'+ opts.title +'" href="#">'+opts.text+'</a>';
			var onClick = function(e) {
				var links = [];
				jq('#story1').each(function() {
					var title = $(this).find("h2.entry-title").text();
					links.push(title);
				});

				var t = encodeURIComponent(links.join(" "));
				if(t == "")
					t = "#";
				if(window.location.hash != t)
					window.location.hash = t;
			};
			$(link).insertAfter(this).click(onClick);
		}
	});


	// Private functions.
	// function createNewTiddler(args) {
	// 	var defaults = {
	// 		place: null,
	// 		title: "NewTiddler",
	// 		text: "Add your tiddler text"
	// 	};
	// 	var opts = $.extend(defaults, args);
	// 
	// 	// clone the template in the store and replace the placeholder values
	// 	var newTiddler = jw.getTiddler('TIDDLER_TEMPLATE', 'store').clone();
	// 	var html = newTiddler.html();
	// 	html = html.replace(/TIDDLER_TEMPLATE/g, opts.title);
	// 	html = html.replace(/TIDDLER_TEXT/g, opts.text);
	// 	html = html.replace(/TIDDLER_MODIFIER/g, jw.config.options.UserName);
	// 	newTiddler.html(html);
	// 	$('#store').append(newTiddler);
	// 				
	// 	//display the new tiddler in the story.
	// 	jw.displayTiddler(opts.title, {
	// 		relative: jw.containingTiddler(opts.place),
	// 		template: 'EditTemplate'
	// 	});
	// }

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
					var unnamed = 1;
					var s = 0;
					var i = findNakedSpace(t,s);
					var param = i==-1 ? t.substr(s) : t.substring(s,i);
					while(true) {
						var ci = param.indexOf(':');
						if(ci==-1) {
							// parameter is unnamed
							opts[unnamed++] = param;
						} else {
							var name = param.substr(0,ci);
							var val = param.substr(ci+1);
							val = $.trim(val);
							if(val.charAt(0)=='"' && val.charAt(val.length-1)=='"') {
								val = val.substr(1,val.length-2);
							}
							opts[name] = val; 
						}
						if(i==-1)
							break;
						s = i+1;
						i = findNakedSpace(t,s);
						param = i==-1 ? t.substr(s) : t.substring(s,i);
					}
					$(this).jw_invokeMacro(opts);
				}
			});
		}
	});

	$.fn.extend({
		jw_invokeMacro: function(args) {
			// Call the handler of the macro, passing along any arguments
			jw.log('macro',args);

			var macro = args['macro'];
			var j = $(this)['jw_macro_'+macro];
			if(j) {
				$(this)['jw_macro_'+macro](args);
				$(this).hide();// hide the macro code block.
			} else {
				jw.log("No handler for ", macro);
			}
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
		var qe = text.indexOf('"',qs+1);
		if(qe==-1)
			return d;
		return findNakedSpace(text,qe+1);
	}

})(jQuery);
