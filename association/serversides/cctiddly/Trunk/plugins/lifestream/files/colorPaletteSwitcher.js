config.macros.switchColours = {};
config.macros.switchColours.doSwitch = function() 
{
	var tempColorPalette = store.getTiddlerText("alternative_ColorPalette");
	store.saveTiddler("alternative_ColorPalette", "alternative_ColorPalette", store.getTiddlerText("ColorPalette"));
	store.saveTiddler("ColorPalette", "ColorPalette", tempColorPalette);
}
config.macros.switchColours.handler = function(place,macroName,params)
{
	createTiddlyButton(place, "switch theme", null, config.macros.switchColours.doSwitch);
}