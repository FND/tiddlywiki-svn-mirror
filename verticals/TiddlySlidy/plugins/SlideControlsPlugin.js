/***
|''Name''|<...>|
|''Description''|<...>|
|''Author''|FND|
|''Version''|<#.#.#>|
|''Status''|<//unknown//; @@experimental@@; @@beta@@; //obsolete//; stable>|
|''Source''|http://devpad.tiddlyspot.com/#<...>|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|<...>|
|''Requires''|<...>|
|''Keywords''|<...>|
!Description
<...>
!Notes
<...>
!Usage
{{{
<<...>>
}}}
!!Parameters
<...>
!!Examples
<<...>>
!Configuration Options
<...>
!Revision History
!!v<#.#> (<yyyy-mm-dd>)
* <...>
!To Do
<...>
!Code
***/
//{{{
(function() {

config.macros.prevSlide = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var btn = createTiddlyButton(place, "prev", "previous", function(ev) {
			changeSlide(-1, place);
		});
		
	}
};

config.macros.nextSlide = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var btn = createTiddlyButton(place, "next", "next", function(ev) {
			changeSlide(1, place);
		});
	}
};

var changeSlide = function(delta, place) {
	
	console.log('foo');
	
	var slides = version.extensions.InclusifierPlugin.getTiddlersForShow("Outline");
	
	console.log('slides:', slides);
	
	// XXX: DEBUG'd
	//var currentSlide = story.findContainingTiddler(place);
	//var title = currentSlide ? currentSlide.getAttribute("tiddler") : slides[0];
	//var index = slides.indexOf(title) + delta;
	if(window.currentSlide === undefined) {
		currentSlide = -1; // TODO
	}
	currentSlide = currentSlide + delta;
	currentSlide = currentSlide.clamp(0, slides.length - 1);
	story.closeAllTiddlers();
	story.displayTiddler(null, slides[currentSlide]);
};

})();
//}}}
