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
* refactor code to provide only a single macro, direction controlled via parameters
!Code
***/
//{{{
(function() {

config.macros.prevSlide = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		createTiddlyButton(place, "prev", "previous", function(ev) {
			changeSlide(-1);
		});

	}
};

config.macros.nextSlide = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		createTiddlyButton(place, "next", "next", function(ev) {
			changeSlide(1);
		});
	}
};

config.macros.firstSlide = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		createTiddlyButton(place, "start", "first", function(ev) {
			changeSlide(-999);
		});
	}
};

config.macros.lastSlide = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		createTiddlyButton(place, "end", "last", function(ev) {
			changeSlide(999);
		});
	}
};

var changeSlide = function(delta, ev) {
	var slides = version.extensions.InclusifierPlugin.getTiddlersForShow("Outline");
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
