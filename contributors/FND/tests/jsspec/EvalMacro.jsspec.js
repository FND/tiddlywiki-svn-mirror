// <![CDATA[
describe('EvalMacro', {
	before_each : function() {
		store = new TiddlyWiki();
		loadShadowTiddlers();
		formatter = new Formatter(config.formatters);
	},

	'when given a single parameter, should expand to the respective string' : function() { 
		var actual = wikifyStatic("<<version>>");
		var expected = "1";
		value_of(actual).should_be("<span>" + expected + "</span>");
	}
});
// ]]>
