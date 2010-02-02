/***
|''Name''|WebLinkerMacro|
|''Description''|links tiddler title to web wisdom|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://hoster.peermore.com/recipes/movies/tiddlers.wiki#WebLinkerMacro|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
!Usage
{{{
<<webLinker [tag]>>
}}}
//tag// parameter controls activation
!!Examples
<<webLinker systemConfig>>
!Code
***/
//{{{
(function() {

config.macros.webLinker = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		if(params.length && !tiddler.tags.contains(params[0])) {
			for(var key in this.sources) {
				var url = this.sources[key].format([tiddler.title]);
				wikify("[[%0|%1]]\n".format([key, url]), place);
			}
		}
	},
	sources: {
		IMDb: "http://www.imdb.com/find?s=all&q=%0",
		Wikipedia: "http://en.wikipedia.org/wiki/Special:Search?search=%0"
	}
};

})();
//}}}
