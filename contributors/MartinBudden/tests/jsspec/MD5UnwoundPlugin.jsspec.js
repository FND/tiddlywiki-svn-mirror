// <![CDATA[
describe('MD5Unwound: little-endian functions', {

	'hex string value of little-endian array': function() {
		var actual = Crypto.le32sToHex([0xb1c2d3e4,0x1a2b3c4d]);
		var expected = "E4D3C2B14D3C2B1A";
		value_of(actual).should_be(expected);
	},
	'string value of little-endian array': function() {
		var actual = Crypto.le32sToStr([0x2a2b3c4d]);
		var expected = "M<+*";
		value_of(actual).should_be(expected);
	},
	'little-endian array value of string': function() {
		var actual = Crypto.strToLe32s("M<+*");
		var expected = [0x2a2b3c4d];
		value_of(actual).should_be(expected);
	},
	'little-endian array round trip': function() {
		var actual = Crypto.strToLe32s(Crypto.le32sToStr([0x2a2b3c4d]));
		var expected = [0x2a2b3c4d];
		value_of(actual).should_be(expected);
	}
});

describe('MD5Unwound: hexMd5Str()', {

	'MD5 hash of empty string should be correct': function() {
		var actual = Crypto.hexMd5Str("").toLowerCase();
		var expected = "d41d8cd98f00b204e9800998ecf8427e";
		value_of(actual).should_be(expected);
	},
	'MD5 hash of test vector 1 should be correct': function() {
		var actual = Crypto.hexMd5Str("a").toLowerCase();
		var expected = "0cc175b9c0f1b6a831c399e269772661";
		value_of(actual).should_be(expected);
	},
	'MD5 hash of test vector 2 should be correct': function() {
		var actual = Crypto.hexMd5Str("abc").toLowerCase();
		var expected = "900150983cd24fb0d6963f7d28e17f72";
		value_of(actual).should_be(expected);
	},
	'MD5 hash of test vector 3 should be correct': function() {
		var actual = Crypto.hexMd5Str("message digest").toLowerCase();
		var expected = "f96b697d7cb7938d525a2f31aaf161d0";
		value_of(actual).should_be(expected);
	},
	'MD5 hash of test vector 4 should be correct': function() {
		var actual = Crypto.hexMd5Str("abcdefghijklmnopqrstuvwxyz").toLowerCase();
		var expected = "c3fcd3d76192e4007dfb496cca67e13b";
		value_of(actual).should_be(expected);
	},
	'MD5 hash of test vector 5 should be correct': function() {
		var actual = Crypto.hexMd5Str("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789").toLowerCase();
		var expected = "d174ab98d277d9f5a5611c2c9f419d9f";
		value_of(actual).should_be(expected);
	},
	'MD5 hash of test vector 6 should be correct': function() {
		var actual = Crypto.hexMd5Str("12345678901234567890123456789012345678901234567890123456789012345678901234567890").toLowerCase();
		var expected = "57edf4a22be3c955ac49da2e2107b67a";
		value_of(actual).should_be(expected);
	},
	'MD5 hash of test vector 7 should be correct': function() {
		var actual = Crypto.hexMd5Str("The quick brown fox jumps over the lazy dog").toLowerCase();
		var expected = "9e107d9d372bb6826bd81d3542a419d6";
		value_of(actual).should_be(expected);
	},
	'MD5 hash of test vector 8 should be correct': function() {
		var actual = Crypto.hexMd5Str("The quick brown fox jumps over the lazy eog").toLowerCase();
		var expected = "ffd93f16876049265fbaef4da268dd0e";
		value_of(actual).should_be(expected);
	}

});
// ]]>

