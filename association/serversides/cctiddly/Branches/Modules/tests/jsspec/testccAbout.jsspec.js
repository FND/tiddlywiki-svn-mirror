// <![CDATA[

function __main() {
	store = new TiddlyWiki();
	loadShadowTiddlers();
	formatter = new Formatter(config.formatters);

	
}

describe('Macros: list macro', {
	before_each : function() {
		__main();
	},

	'list shadowed by default expands to the listTitle and a list of builtin shadowed tiddlers' : function() { 
	//	var c = new config.macros.ccAbout.sub();
		value_of(wikifyStatic('<<ccAbout>>')).should_be("a");
	},

});

// ]]>
