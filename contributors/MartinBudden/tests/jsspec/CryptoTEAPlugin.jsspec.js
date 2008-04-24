// <![CDATA[
describe('Base 64 Encoding', {
	'Bold formatting': function() {
		var actual = Crypto.base64encode("abcdefghijklmnopqrstuvwxyz");
		var expected = "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=";
		value_of(actual).should_be(expected);
	}
})
// ]]>
