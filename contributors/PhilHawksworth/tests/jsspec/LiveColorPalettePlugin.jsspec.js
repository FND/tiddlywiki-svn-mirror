// <![CDATA[

describe('Live Color Palette', {
	'getColor returns a value from the palette': function() {
		var c = config.macros.LiveColorPalette.getColor('ColorPalette', 'Background');
		value_of(c).should_not_be(null);
	},
	'getColor returns null if the color requested does not exist in the palette': function() {
		var c = config.macros.LiveColorPalette.getColor('Jibberish');
		value_of(c).should_be(null);
	}
});

// ]]>
