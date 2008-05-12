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

var docTypes = {
	html401strict: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">',
	html401transitional: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
	html401frameset: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd">',
	xhtml10strict: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
	xhtml10transitional: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
	xhtml10frameset: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
	html32: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">',
	html20: '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML//EN">',
	xmlArticle: '<!DOCTYPE article PUBLIC "-//OASIS//DTD DocBook XML V4.1.2//EN" "http://www.oasis-open.org/docbook/xml/4.1.2/docbookx.dtd">'
};

function isDoctypeSet(ifr) {
	// in IE, no doctype sets quirksmode
	// test to see what doctype we're dealing with here
	return ifr.doc.body.clientWidth == ifr.doc.body.offsetWidth;
}

describe('IFrame : modify()', {

	before_each: function() {
		store = new TiddlyWiki();
		loadShadowTiddlers();
		store.loadFromDiv("storeArea","store",true);
		html = store.getTiddlerText("HomePageTemplate");
		//html = "<html><head><title>test html</title></head><body><p>hello</p></body></html>";
		htmlHead = "<title>test html</title>";
		htmlBody = "<p>hello</p>";
		ifr = new IFrame();
	},
	
	'it should change the doctype of the iframe to whatever is set in the input <!DOCTYPE> element, if it is set': function() {
		var actual = [];
		var expected = [];
		for(var i in docTypes) {
			content = docTypes[i]+html;
			ifr.modify(content);
			actual.push(ifr.doc.body.clientWidth);
			expected.push(ifr.doc.body.offsetWidth);
			//actual.push(isDoctypeSet(ifr));
			//expected.push(true);
		}
		value_of(actual).should_be(expected);
	},
	
	'it should set the doctype of the <document> element of the iframe to whatever is specified in the input <!DOCTYPE> element; for html doctypes on IE, the property should be null': function() {
		var expected = [];
		var actual = [];
		var content = "";
		var docType = null;
		for(var i in docTypes) {
			content = docTypes[i]+html;
			ifr.modify(content);
			docType = ifr.doc.doctype;
			//alert("for doctype "+docTypes[i]+" ifr height is "+ifr.style.height);
			if(config.browser.isIE) {
				actual.push(docType);
				expected.push(null);
			} else {
				if(docType) {
					var name = docType.name ? " "+docType.name : "";
					var publicId = docType.publicId ? " \""+docType.publicId+"\"" : "";
					var systemId = docType.systemId ? " \""+docType.systemId+"\"" : "";
					actual.push("<!DOCTYPE"+name+" PUBLIC"+publicId+systemId+">");
				} else {
					actual.push(null);
				}
				expected.push(docTypes[i]);
			}
		}
		value_of(actual).should_be(expected);
	},
	
	'if the input <!DOCTYPE> element is not set, the doctype of the iframe\'s <document> element should be null': function() {
		ifr.modify(html);
		var actual = ifr.doc.doctype;
		value_of(actual).should_be_null();
	},

	'it should set the html of the <head> element of the iframe as the innerHTML of the <head> of the input': function() {
		var expected = htmlHead;
		ifr.modify(html);
		var actual = ifr.doc.documentElement.firstChild.innerHTML;
		value_of(actual).should_be(expected);
	},
	
	'it should set the html of the <body> element of the iframe as the innerHTML of the <body> of the input': function() {
		var expected = [];
		var actual = [];
		for (var i in docTypes) {
			expected.push(htmlBody);
			ifr.modify(docTypes[i]+html);
			actual.push(ifr.doc.documentElement.childNodes[1].innerHTML);
		}
		value_of(actual).should_be(expected);
	},
	
	after_each: function() {
		delete docType;
		delete html;
		delete htmlHead;
		delete htmlBody;
		delete ifr;
	}
});

// ]]>