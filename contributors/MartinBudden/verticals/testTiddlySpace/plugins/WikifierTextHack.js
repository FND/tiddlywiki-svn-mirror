(function($){
var _view = config.macros.view.views.wikified;
config.macros.view._tiddlerlog = [];
config.macros.view.views.wikified = function(value, place, params, wikifier,
		paramString, tiddler) {
		if(config.macros.view._tiddlerlog.contains(tiddler.title)) {
				config.macros.view._tiddlerlog = [];
				$("<span />").text(value).appendTo(place);
				return;
		}
		if(params[0] == "text" && params[1] == "wikified") {
				config.macros.view._tiddlerlog.push(tiddler.title);
		}
		_view(value, place, params, wikifier, paramString, tiddler);
		config.macros.view._tiddlerlog = [];
};
})(jQuery);