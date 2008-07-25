// <![CDATA[
describe('MD5Unwound: hexSha1Str()', {

	'MD5 hash of empty string should be correct': function() {
		var actual = Crypto.hexMD5Str("").toLowerCase();
		var expected = "d41d8cd98f00b204e9800998ecf8427e";
		value_of(actual).should_be(expected);
	},
	'MD5 hash of test vector 1 should be correct': function() {
		var actual = Crypto.hexMD5Str("The quick brown fox jumps over the lazy dog").toLowerCase();
		var expected = "9e107d9d372bb6826bd81d3542a419d6";
		value_of(actual).should_be(expected);
	},
	'MD5 hash of test vector 1 should be correct': function() {
		var actual = Crypto.hexMD5Str("The quick brown fox jumps over the lazy eog").toLowerCase();
		var expected = "ffd93f16876049265fbaef4da268dd0e";
		value_of(actual).should_be(expected);
	}
	

});
// ]]>

