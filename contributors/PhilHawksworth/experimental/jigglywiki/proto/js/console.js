jw.macros.console = {};
jw.macros.console.name = 'jw.console';
jw.macros.console.description = 'A debug logging console';
jw.macros.console.version = '0.0.1';
jw.macros.console.author = 'PhilHawksworth';

jw.macros.console.handler = function(options) {
	var defaults = {
		place:$('body')
	};
	var opts = $.extend(defaults, options);
	$('<div id=\'console\'><div class=\'display\'></div><a href=\'#\' class=\'consoleControl\'>close</a><a href=\'#\' class=\'consoleControl\'>clear</a></div>').insertAfter(opts.place);};

jw.macros.console.log = function() {
	if(window.console && widow.console.log) {
		console.log.apply(arguments);
	}
	$('#console div.display').append(arguments);
};
