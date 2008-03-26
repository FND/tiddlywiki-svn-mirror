/***
|''Name:''|LiveColorPalettePlugin|
|''Description:''|Provide a view of the ColorPalette that allows the user to see the color that they are specifying|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/Plugins/LiveColorPalettePlugin.js |
|''Version:''|0.0.1|
|''Date:''|Mar 11, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|


''Usage examples:''

Create the UI to talk to the existing ColorPalette.
{{{
<<LiveColorPalette>>
}}}

Refresh the Live ColorPalette UI
{{{
	drawColorForm(plac);
}}}

Set a color value in the ColorPalette
{{{
	setColor(ColorName, hexString);
}}}

Get a color value from the ColorPalette
{{{
	getColor(ColorName);
}}}



***/

//{{{
if(!version.extensions.LiveColorPalettePlugin) {
version.extensions.LiveColorPalettePlugin = {installed:true};
		
config.macros.LiveColorPalette = {};
config.macros.LiveColorPalette.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	config.macros.LiveColorPalette.drawColorForm(place);
	//insert styles into StyleSheet for a simple plugin install.
	var s = "/* Live Palette Plugin styles */ \n";
	s += "table.LivePaletteDisplay { border-color:[[ColorPalette::Background]]; margin:none; }\n";
	s += "table.LivePaletteDisplay td { border-color:[[ColorPalette::Background]];}\n";
	s += "table.LivePaletteDisplay td.label {text-align:right; margin-right:1em; }\n";
	s += "table.LivePaletteDisplay td.swatch { width:2em; }\n";
	s += "table.LivePaletteDisplay input { padding: 2px 0.4em; border-width:1px; width:6em; }\n";
	
	var t = store.fetchTiddler('StyleSheet');
	if(!t) {
		t = new Tiddler('StyleSheet');
		t.text = "/*{{{*/\n" + s + "\n/*}}}*/";
		t.title = "StyleSheet";
	 	t.created = null;
		t.modifier = null;
		store.saveTiddler(t.title,t.title,t.text,t.modifier,null,null,null,true,t.created);
	  }
};


config.macros.LiveColorPalette.drawColorForm = function(place) {
	var tiddlerTitle = 'ColorPalette';
	var slices = store.calcAllSlices(tiddlerTitle);
	var name,value;
	var table = createTiddlyElement(place,"table",null,'LivePaletteDisplay');
	for(var s in slices) {
		var tr = createTiddlyElement(table,"tr");
		createTiddlyElement(tr,"td",null,"label",s);
		var td2 = createTiddlyElement(tr,"td");
		var hex = store.getTiddlerSlice(tiddlerTitle, s);
		var input = createTiddlyElement(td2,'input',null,null,null,{'type':'text','onClick':config.macros.LiveColorPalette.reflectColor});
		// var input = document.createElement("input");		
		// input.setAttribute('type','text');
		// input.setAttribute('onclick', config.macros.LiveColorPalette.reflectColor);	
		// input.value = hex;		
		// 
		// td2.appendChild(input);
		
		createTiddlyElement(tr,"td",null,"swatch",' ');
		input.parentNode.nextSibling.style.backgroundColor = hex;
	}
};


// Show the hex value in the text bax as a color in th UI.
config.macros.LiveColorPalette.reflectColor = function() {
	
	console.log("reflect");
	
	// var e = ev ? ev : window.event;
	// var hex = this.value;
	// 
	// console.log(hex);
	// 
	// this.parentNode.nextSibling.style.backgroundColor = hex;
};

config.macros.LiveColorPalette.getColor = function(n) {
	
};


config.macros.LiveColorPalette.setColor = function(n,v) {
	
};
	
} //# end of 'install only once'
//}}}