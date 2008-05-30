// <![CDATA[

function __main() {
	store = new TiddlyWiki();
	loadShadowTiddlers();
	store.loadFromDiv("storeArea","store",true);
	loadPlugins();
}

describe('Date.convertToYYYYMMDDHHMMSSMMM', {
        before_each : function() {
		__main();
        },

	'function is defined' : function() {
		value_of(typeof Date.convertToYYYYMMDDHHMMSSMMM).should_be("function");
	}
});

// ]]>
