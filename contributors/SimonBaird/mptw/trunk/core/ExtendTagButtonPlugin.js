/***
| Name:|ExtentTagButtonPlugin|
| Description:|Adds a New tiddler button in the tag drop down|
| Version:|3.2 ($Rev$)|
| Date:|$Date$|
| Source:|http://mptw.tiddlyspot.com/#ExtendTagButtonPlugin|
| Author:|Simon Baird <simon.baird@gmail.com>|
| License|http://mptw.tiddlyspot.com/#TheBSDLicense|
***/
//{{{

window.onClickTag_mptw_orig = window.onClickTag;
window.onClickTag = function(e) {
	window.onClickTag_mptw_orig.apply(this,arguments);
	var tag = this.getAttribute("tag");
	var title = this.getAttribute("tiddler");
	// Saq, you're a genius :)
	var popup = Popup.stack[Popup.stack.length-1].popup;
	createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
	wikify("<<newTiddler label:'New tiddler' tag:'"+tag+"'>>",createTiddlyElement(popup,"li"));
	return false;
}

//}}}

