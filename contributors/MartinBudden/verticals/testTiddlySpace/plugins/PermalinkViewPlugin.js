/***
|''Name''|PermalinkViewPlugin|
|''Version''|0.9.0|
|''Author''|Jon Robson|
|''Description''|Provides a permalink view type|
|''Requires''|ImageMacroPlugin|
!Notes
***/
//{{{
(function($) {
config.macros.view.views.permalink =  function(value, place, params, wikifier,
	paramString, tiddler) {
	var permalink = "#[[%0]]".format([value]);
	if(store.tiddlerExists("link.svg")) {
		config.macros.image.renderImage(place, "link.svg", {height: 24, width: 24, labelOptions: { include: false}, link: permalink});
	} else {
		$("<a />").attr("href", permalink).text(value).appendTo(place);
	}
};

})(jQuery);
//}}}