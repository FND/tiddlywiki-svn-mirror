/***
|''Name:''|CreateTiddlyButton|
|''Description:''|Create a TiddlyButton to point to a new tiddler|
|''Author:''|BenJam|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/BenJam/plugins/CreateTiddlyButton.js |
|''Version:''|0.1|
|''Date:''|April 12, 2010|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.3|

Usage:
{{{
<<CreateTiddlyButton title tiddler>>

***/
//{{{

(function($) {
    
    var log = console.log;

    config.macros.CreateTiddlyButton = {

        handler: function(place, macroName, params, wikifier, paramString, tiddler){

            var macroParams = paramString.parseParams();
			var title = getParam(macroParams,"title");
			var tiddlerTitle = getParam(macroParams,"tiddler");
			if(tiddler==null || title == null){
				log("Incorrect params please speciy a button title and a tiddler");
				return
			}
			createButton(title,tiddlerTitle, place);
		}        
	};
	
	function createButton(title, tiddlerTitle, place){
		var t = store.getTiddler(tiddlerTitle);
		if(t=null){
			log("Couldn't find Tiddler");
			return			
		}
		createTiddlyButton(place, title, null, function(){
			story.displayTiddler(place,tiddlerTitle);
		});
	}
})(jQuery);

//}}}
