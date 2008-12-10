/***
<<dummy "this is a dummy macro">>
***/
//{{{
config.macros.dummy = {};
config.macros.dummy.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	wikify(params[0], place);
	displayMessage(params[0]); // DEBUG: doesn't always work!?
}
//}}}