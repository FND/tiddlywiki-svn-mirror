// <![CDATA[

	
describe('LiveColorPalettePlugin', {
	
	before_each: function(){
		store = new TiddlyWiki();
		loadShadowTiddlers();
		store.loadFromDiv("storeArea","store",true);
		loadPlugins();
	},

	'given a valid color name, getColor returns a value from the palette': function() {
		var c = store.getTiddler('ColorPalette');
		console.log("CP: ",c);

		var c = config.macros.LiveColorPalette.getColor('ColorPalette', 'Background');
		value_of(c).should_be('#ffffff');
	},
	
	'given an invalid color name, getColor returns a undefined ' : function() {
		var c = config.macros.LiveColorPalette.getColor('ColorPalette', 'jibberish');
		value_of(c).should_be_undefined();
	},
	
	'given an invalid palette name, getColor returns undefined ' : function() {
		var c = config.macros.LiveColorPalette.getColor('Jibberish', 'Background');
		value_of(c).should_be_undefined();	
	},
	
	'given a valid palette, color name and value, setColor writes the color to the palette : ' : function() {
		var color = '#f00';
		config.macros.LiveColorPalette.setColor('ColorPalette', 'Background', color );
		var c = config.macros.LiveColorPalette.getColor('ColorPalette', 'Background');
		value_of(c).should_be(color);
	}
	
});





// ]]>