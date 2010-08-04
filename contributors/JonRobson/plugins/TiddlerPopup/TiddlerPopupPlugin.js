/***
|''Name''|TiddlerPopupPlugin|
|''Description''|Allows you to create links to tiddlers causing them to open in a popup|
|''Author''|Jon Robson|
|''Version''|0.5.0|
|''Status''|@@beta@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/plugins/TiddlerPopup/TiddlerPopupPlugin.js|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
!Code
***/
//{{{
(function($){
config.macros.TiddlerPopUp = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler){
		var title =	params[0];
		var label = params[1];
		$("<a class='popupLink' />").text(label).
			click(function(ev) {
				var popup = Popup.create(ev.target);
				var text = store.getTiddlerText(title) || config.shadowTiddlers[title];
				wikify(text, popup);
				Popup.show();
				$(popup).click(function(ev) { // make it so only clicking on the document outside the popup removes the popup
					ev.stopPropagation();
					ev.preventDefault();
					return false;
				});
				ev.stopPropagation();
				return false;
			}).appendTo(place);
	}
};
})(jQuery);
//}}}