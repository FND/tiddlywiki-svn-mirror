// <![CDATA[
	
describe('IFrame : constructor', {

	'it should append the iframe to document.body if the parentElem parameter is not provided': function() {

		var docChildNodes = document.body.childNodes.length;
		var ifr = new IFrame();
		var expected = "IFRAME";
		var actual = document.body.childNodes[docChildNodes].tagName;
		value_of(actual).should_be(expected);
	},
	
	'it should append the iframe to the element provided in the parentElem parameter if one is provided': function() {

		var testElem = document.createElement("div");
		document.body.appendChild(testElem);
		var elemChildNodes = testElem.childNodes.length;
		var ifr = new IFrame(testElem);
		var expected = "IFRAME";
		var actual = testElem.childNodes[elemChildNodes].tagName;
		value_of(actual).should_be(expected);
	},
	
	'it should not append the iframe to anything if the parentElem parameter is not a DOM element': function() {

		var notAnElem = document.createTextNode("test");
		document.body.appendChild(notAnElem);
		var actual = new IFrame(notAnElem);
		value_of(actual.f.parentNode).should_be_null();
	},
	
	'it should give the iframe a name attribute equal to the specified name parameter if one is provided': function() {

		var expected = "test_name";
		var ifr = new IFrame(null,"test_name");
		var actual = ifr.f.name;
		value_of(actual).should_be(expected);
	}
});

describe('IFrame : modify()', {

	'it should ': function() {
	
	}
});

// ]]>