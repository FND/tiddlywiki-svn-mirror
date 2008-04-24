// <![CDATA[
describe('Character formatting', {
	'Bold formatting': function() {
		formatter = new Formatter(config.wikispacesFormatters);
		var actual = wikifyStatic("**bold**");
		var expected = "<b>bold</b>";		
		value_of(actual).should_be(expected);
	},
	'Italic formatting': function() {
		formatter = new Formatter(config.wikispacesFormatters);
		var actual = wikifyStatic("//italic//");
		var expected = "<i>italic</i>";		
		value_of(actual).should_be(expected);
	},
	'Underline formatting': function() {
		formatter = new Formatter(config.wikispacesFormatters);
		var actual = wikifyStatic("__underline__");
		var expected = '<span style="text-decoration: underline;">underline</span>';		
		value_of(actual).should_be(expected);
	}
})
// ]]>
