// <![CDATA[
describe('filterTiddlers', {
	'String right': function() {
		var actual = "abcdef".right(3);
		var expected = "def";		
		value_of(actual).should_be(expected);
	}
});
// ]]>