//{{{

config.macros.pipePlugin = {};

config.macros.pipePlugin.context = {};

config.macros.pipePlugin.handler = function(place, name, params)
{
	this.context.place = place;
	this.context.name = name;
	this.context.params = params;

	var newScript = document.createElement('script');
	newScript.id = 'temp_script';
	newScript.type = 'text/javascript';
	newScript.onload = config.macros.pipePlugin.removeScript;
	newScript.src = params[0];
	place.appendChild(newScript);
};

config.macros.pipePlugin.removeScript = function() {
	var k = document.getElementById("temp_script");
	removeNode(k);
};

config.macros.pipePlugin.JSONparse = function(response) {

    JSON = {};
    JSON.response = eval(response);
    
    JSON.blogtitle = JSON.response.value.title;
    JSON.blogitems = JSON.response.value.items;
    
    // Iterate through the blog items
	var limit = this.context.params[1];
	limit = ((limit && limit > JSON.blogitems.length) ? JSON.blogitems.length : limit);
    for (var i=0; i<limit; i++) {
    	var item = JSON.blogitems[i];
        var item_title = item.title;
		var item_link = item.link;
        // pick the right author node
        var item_author = (function() {
            return (item["dc:creator"] || (item.author && item.author.name));
        })();
        var heading = item_title;
		headingelement = document.createElement("h3");
		headingelement_link = document.createElement("a");
		headingelement_link.setAttribute("href",item_link);
		headingelement_link.setAttribute("target","_blank");
		headingelement.appendChild(headingelement_link).appendChild(document.createTextNode(heading));
		this.context.place.appendChild(headingelement);
		// var pubDate = new Date(item.pubDate);
		var date_regex = /(.)*?2007/mg;
		var pubDate = item.pubDate.match(date_regex)[0];
		var author_line = "posted by " + item_author + " on " + pubDate;
		createTiddlyElement(this.context.place,"h4",null,null,author_line);
        // pick the right content node
        var raw_content = new String();
		raw_content = (function() {
            return (item["content:encoded"] || (item.content && item.content.content) || item["description"]);
        })();
        var content = raw_content.renderHtmlText();
        content = content.renderHtmlEscapedEntities();
        var para = document.createElement("p");
		var summary_limit = this.context.params[2];
		if (summary_limit) { writeCodeSummary(summary_limit,content,para); }
		else writeCode(content,para);
        this.context.place.appendChild(para);
    }
};

// renderHtmlText puts a string through the browser render process and then extracts the text
// useful to turn HTML entities into literals such as &apos; to '
// this, annoyingly, doesn't cope with entities such as &#8217; - see renderHtmlEscapedEntities
// below for that
// NB: At some point, someone should create a utility function that just creates a text version
// of any HTML string, coping with any character encodings - as if it had been rendered in the
// browser and then copied out. This would combine renderHtmlText, renderHtmlEscapedEntities
// and writeCode or writeCodeSummary
String.prototype.renderHtmlText = function() {
	var e = createTiddlyElement(document.body,"div");
	e.innerHTML = this;
	var text = getPlainText(e);
	removeNode(e);
	return text;
};

// renderHtmlEscapedEntities takes a HTML string which has already been run through
// renderHtmlText to deal with converting entities such as &apos; to '
// It then converts remaining entities such as &#8217; to '
String.prototype.renderHtmlEscapedEntities = function() {
	var entity_match = /&#(.*?);/mg;
	entities = this.replace(entity_match,function(string_match,matches) {
		var word = string_match.substring(2,string_match.length-1);
		var new_word = String.fromCharCode(word);
		return new_word;
	});
	return entities;
};

// Creates a sub-tree under a given element
// copied from O'Reilly Javascript Library
function writeCode(s, pointer) {
var parent, tag, j;
for ( var i = 0; i < s.length; i++) {
var c = s.charAt(i);
if (c == "<") {
var j = s.indexOf(">", i + 1);
tag = s.substring(i, j + 1);
if (tag.charAt(tag.length - 2) == "/") {
if (pointer != null && pointer.nodeType == 3) {
pointer = pointer.parentNode;
}
pointer.appendChild(createElementFromString(tag));
} else if (tag.charAt(1) != "/") {
if (pointer != null && pointer.nodeType == 3) {
pointer = pointer.parentNode;
}
pointer = pointer.appendChild(createElementFromString(tag));
} else {
if (pointer.parentNode != null &&
pointer.parentNode.parentNode != null) {
pointer = pointer.parentNode.parentNode;
}
}
i = j;
} else {
if (pointer.nodeType == 3) {
n = s.indexOf("<", i + 1);
if (n == -1) {
pointer.nodeValue += s.substr(i);
i = s.length;
} else {
pointer.nodeValue += s.substring(i, n);
i = n - 1;
}
} else {
pointer = pointer.appendChild(document.createTextNode(c));
}
}
}
}

// Creates a plaintext summary of a given HTML string
// based on writeCode() from O'Reilly Javascript Library
function writeCodeSummary(limit, s, pointer) {
	var parent, tag, j;
	limit = (limit < s.length ? limit : s.length);
	// count keeps track of the number of text characters added
	var count = 0;
	for ( var i = 0; count < limit; i++) {
		var c = s.charAt(i);
		// Ignore tags
		if (c == "<") {
			var j = s.indexOf(">", i + 1);
			i = j;
		} else {
			if (pointer.nodeType == 3) {
				n = s.indexOf("<", i + 1);
				if (n == -1) {
					pointer.nodeValue += s.substr(i);
					i = s.length;
					count += s.length;
				} else {
					// check we're not adding too many characters
					// n - i is the length of the string we are adding
					// limit - count is the number we have left to play with
					var extratext;
					if (n - i > limit - count) {
						extratext = s.substring(i, i + (limit - count));
					} else extratext = s.substring(i, n);
					pointer.nodeValue += extratext;
					count += extratext.length;
					i = n - 1;
				}
			} else {
				pointer = pointer.appendChild(document.createTextNode(c));
				count++;
			}
		}
	}
}

// parse a string and create an element from it
// based on O'Reilly Javascript Library code
function createElementFromString(str) {
var node, a = str.match(/<(\w+)(\s+)?([^>]+)?>/);
if (a != null) {
node = document.createElement(a[1]);
if (a[3] != null) {
var attrs = a[3].split(" ");
if (attrs.length > 0) {
for ( var i = 0; i < attrs.length; i++) {
var att = attrs[i].split("=");
if (att[0].length > 0 &&
att[0] != "/" && att[1] && att[1].length != 2) {
var a_n = document.createAttribute(att[0]);
a_n.value = att[1].replace(/^['"](.+)['"]$/, "$1");
node.setAttributeNode(a_n);
}
}
}
}
}
return node;
}

//}}}