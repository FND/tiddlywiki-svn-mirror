/***
|''Name''|PaletteViewMacro|
|''Version''|0.2|
|''Author''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#PaletteViewMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|Displays color palettes.|
!Notes
There is also [[ViewPalettePlugin|http://simon.tiddlyspot.com/#ViewPalettePlugin]], which currently does not work with TiddlyWiki v2.2 though.
!Usage
{{{
<<paletteView [tiddler name]>>
}}}
!!Example
<<paletteView [[ColorPalette]]>>
!Revision History
!!v0.1 (2007-11-18)
* initial release
!!v0.2 (2007-11-20)
* limited processing to slices containing [[actual color values|http://www.w3.org/TR/CSS21/syndata.html#color-units]]
* changed fallback value to the tiddler the macro is called from (instead of using [[ColorPalette]])
!To Do
* selection list for all available palettes (tag-based)
* parameter for custom table class
* customizable column order
* documentation (e.g. using from within [[ViewTemplate]])
!Code
***/
//{{{
config.macros.paletteView = {};

config.macros.paletteView.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	var title = params[0] || tiddler.title;
	//var palettes = store.getTaggedTiddlers(params[0]); // DEBUG: yet to be implemented
	var colors = store.calcAllSlices(title);
	var labels = [];
	for(var c in colors) {
		if(this.isColor(colors[c])) {
			labels.push(c);
		}
	}
	if(labels.length > 0) {
		var output = "|!Sample|!Value|!Name|h\n";
		for(var i = 0; i < labels.length; i++) {
			output += "|padding:0 4em;background-color:" + colors[labels[i]] + ";&nbsp;|"
				+ "{{{" + colors[labels[i]] + "}}}|"
				+ "[[" + labels[i] + "|" + title + "]]|\n";
		}
		wikify(output, place);
	}
};

config.macros.paletteView.isColor = function(s) {
	var colors = ["Black", "Green", "Silver", "Lime", "Gray", "Olive", "White", "Yellow",
		"Maroon", "Navy", "Red", "Blue", "Purple", "Teal", "Fuchsia", "Aqua", "Orange"];
	var match = s.match(/^#[0-9A-F]{3}$|^#[0-9A-F]{6}$|^RGB\([\d,\s]{5,}\)$/i);
	if(match) return true;
	if(colors.contains(s)) return true;
	return false;
};
//}}}