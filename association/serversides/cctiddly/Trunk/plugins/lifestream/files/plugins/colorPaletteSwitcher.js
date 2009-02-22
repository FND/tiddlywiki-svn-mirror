config.macros.switchColours = {};
config.macros.switchColours.doSwitch = function(place) 
{
	var tempColorPalette = store.getTiddlerText("alternative_ColorPalette");
	store.saveTiddler("alternative_ColorPalette", "alternative_ColorPalette", store.getTiddlerText("ColorPalette"));
	store.saveTiddler("ColorPalette", "ColorPalette", tempColorPalette);
	var container = story.findContainingTiddler(place);
}
config.macros.switchColours.handler = function(place,macroName,params){
	
	createTiddlyButton(place, "switch theme", null, function() { config.macros.switchColours.doSwitch(place); });
}