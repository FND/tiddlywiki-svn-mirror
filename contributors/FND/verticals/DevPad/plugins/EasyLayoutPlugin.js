/***
<<EasyLayout>>
***/
//{{{
/*
** Macro Initialization
*/

config.macros.EasyLayout = {};
config.macros.EasyLayout.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	this.loadSettings();
	this.generateUI(place);
};

/*
** User Interface
*/

config.macros.EasyLayout.generateUI = function(parent) {
	// create root form
	var frm = createTiddlyElement(parent, "form", null, "easyLayout"); // DEBUG: requires action parameter
	frm.style.border = "1px solid #AAA"; // DEBUG: use shadow tiddler for styles
	frm.style.marginBottom = "1em"; // DEBUG: use shadow tiddler for styles
	frm.style.padding = "5px"; // DEBUG: use shadow tiddler for styles
	frm.style.overflow = "hidden"; // DEBUG: use shadow tiddler for styles
	frm.style.backgroundColor = "#EEE"; // DEBUG: use shadow tiddler for styles

	// create custom UI elements
	this.createUiElements(frm);

	// create control buttons
	var btns = createTiddlyElement(frm, "div");
	btns.style.textAlign = "right"; // DEBUG: use shadow tiddler for styles
	// preview
	var btn = createTiddlyElement(btns, "input");
	btn.setAttribute("type", "button");
	btn.setAttribute("value", "Apply");
	btn.onclick = function() {
		config.macros.EasyLayout.applyChanges(false);
		return false;
	}
	// save
	btn = createTiddlyElement(btns, "input");
	btn.setAttribute("type", "button");
	btn.setAttribute("value", "Save");
	btn.onclick = function() {
		config.macros.EasyLayout.applyChanges(true);
		return false;
	}
};

// DEBUG: read from JSON structure for easy modification
config.macros.EasyLayout.createUiElements = function(frm) {
	// initialize variables
	var fs = null; // fieldset
	var sc = null; // section

	/*
	** Header
	*/
	fs = this.createFieldset(frm, "Header");
	// height
	sc = this.createSection(fs);
	this.createInputField(sc, "input", "height");
	this.createOptions(sc, "headerHeight");
	// width
	sc = this.createSection(fs);
	this.createInputField(sc, "input", "width");
	this.createOptions(sc, "headerWidth");

	/*
	** Sidebar
	*/
	fs = this.createFieldset(frm, "Sidebar");
	// width
	sc = this.createSection(fs);
	this.createInputField(sc, "input", "width");
	this.createOptions(sc, "sidebarWidth");
	// offset
	sc = this.createSection(fs);
	this.createInputField(sc, "input", "offset");
	this.createOptions(sc, "sidebarOffset");
};

/*
** Layout Modification
*/

config.macros.EasyLayout.applyChanges = function(permanent) {
	alert("not implemented"); // DEBUG: to do
	if(permanent)
		this.saveSettings();
}

/*
** Settings
*/

config.macros.EasyLayout.saveSettings = function() {
	alert("permanent settings not implemented"); // DEBUG: to do -- options: slices in a dedicated tiddler, extended fields, JSON(?)
}

config.macros.EasyLayout.loadSettings = function() {
	alert("permanent settings not implemented"); // DEBUG: to do
}

/*
** DOM Utilities
*/

config.macros.EasyLayout.createFieldset = function(parent, label) {
	var e = createTiddlyElement(parent, "fieldset");
	e.style.marginBottom = "5px"; // DEBUG: use shadow tiddler for styles
	createTiddlyElement(e, "legend", null, null, label);
	return e;
};

config.macros.EasyLayout.createSection = function(parent) {
	var e = createTiddlyElement(parent, "DIV");
	e.style.marginBottom = "5px"; // DEBUG: use shadow tiddler for styles
	return e;
};

config.macros.EasyLayout.createInputField = function(parent, ID, description) {
	var e = createTiddlyElement(parent, "div", null, null, description + ":");
	e.style.fontWeight = "bold"; // DEBUG: use shadow tiddler for styles
	e.style.marginRight = "1em"; // DEBUG: use shadow tiddler for styles
	e = createTiddlyElement(parent, "input", ID);
	e.setAttribute("type", "text"); // DEBUG: might not work in IE; need to set attribute before appending node to document!?
	return e;
};

config.macros.EasyLayout.createOptions = function(parent, IdPrefix) { // DEBUG: dynamic arguments - e.g. createOptions("px", "em", "%")	
	parent.innerHTML = parent.innerHTML // innerHTML required due to IE bug
		+ "<input id='" + IdPrefix + "1' name='" + IdPrefix + "' type='radio'>"
		+ "<label for='" + IdPrefix + "1'>px</label>"
		+ "<input id='" + IdPrefix + "2' name='" + IdPrefix + "' type='radio'>"
		+ "<label for='" + IdPrefix + "2'>em</label>"
		+ "<input id='" + IdPrefix + "3' name='" + IdPrefix + "' type='radio'>"
		+ "<label for='" + IdPrefix + "3'>%</label>"
};
//}}}