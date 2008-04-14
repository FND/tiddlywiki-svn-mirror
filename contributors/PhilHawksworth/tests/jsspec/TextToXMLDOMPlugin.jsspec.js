// <![CDATA[
describe('Text to XML DOM transforms', {
	
	'Providing well formed xml string yields an object': function() {
		var string = "<thing><item>value</item></thing>";
		var xml = getXML(string);
		value_of(typeof xml).should_be('object');
	},
	'Providing no string returns null': function() {
		var x = getXML();
		value_of(x).should_be(null);
	}
	
});
// ]]>
