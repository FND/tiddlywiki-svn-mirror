// <![CDATA[

version = {};
version.extensions = {};

function __main() {
        store = new TiddlyWiki();
        loadShadowTiddlers();
        formatter = new Formatter(config.formatters);
        store.loadFromDiv("storeArea","store",true);
        loadPlugins();
}

describe('GetFirstElementValuePlugin', {

        before_each : function() {
		__main();
		__text = '<?xml version="1.0"?>'
		+ '<doc version="2.0" xmlns:tw="http://www.tiddlywiki.com/">'
		+ '<item>item text</item>'
		+ '<tw:wikitext>stuff and nonsence in wikitext</tw:wikitext>' 
		+ '</doc>';
		__xml = getXML(__text);
        },
	'xml should be parsed' : function() {
		value_of(typeof __xml).should_be("object");
	},
	'item text' : function() {
		value_of(getFirstElementByTagNameValue(__xml,'item','default')).should_be("item text");
	},
	'tw:wikitext text' : function() {
		value_of(getFirstElementByTagNameValue(__xml,'wikitext','default')).should_be("stuff and nonsence in wikitext");
	}
});

// ]]>
