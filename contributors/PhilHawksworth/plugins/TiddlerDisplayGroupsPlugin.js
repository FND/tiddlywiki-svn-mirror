/***
|''Name:''|TiddlerDisplayGroupsPlugin |
|''Description:''|Display groups of tiddlers in the story according to defined template. |
|''Author:''|Phil Hawksworth |
|''Version:''|0.1 |
|''Date:''|15th April 2008 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4 beta |
***/

//{{{
if(!version.extensions.TiddlerDisplayGroupsPlugin) {
version.extensions.TiddlerDisplayGroupsPlugin = {installed:true};
	
function TiddlerDisplayGroup() {
	this.groupField = null;
	this.bunches = [];
	this.pattern = null;
};

function Bunch(id) {
	this.id = id;
	this.tiddlers = [];	
};

TiddlerDisplayGroup.prototype.createBunch = function(common_id) {
	var b = new Bunch(common_id);
	this.bunches.push(b);
	return b;
};


TiddlerDisplayGroup.prototype.setGroupField = function(field) {
	this.groupField = field;
};

TiddlerDisplayGroup.prototype.getGroupField = function() {
	return this.groupField;
};

// return this TiddlerDisplayGroup's bunches
TiddlerDisplayGroup.prototype.getBunches = function() {
	return this.bunches;
};


// Return a bunch which contains tiddlers with a given property in common.
TiddlerDisplayGroup.prototype.findBunch = function(common_id) {
	for (var b=0; b < this.bunches.length; b++) {
		if(this.bunches[b].id == common_id)
			return this.bunches[b];
	};
	return null;
};


// assign a tiddler to the correct bunch depending on the value of a common property.
TiddlerDisplayGroup.prototype.fileTiddler = function(tiddlerTitle, property) {
	var t = store.getTiddler(tiddlerTitle);
	var common_id = store.getValue(t, property);	
	var b = this.findBunch(common_id);
	if(!b)
		b = this.createBunch(common_id);
	b.addTiddler(tiddlerTitle);
};


// Add a tiddler to a bunch without creating duplications.
Bunch.prototype.addTiddler = function(tiddlerTitle) {
	/*
		TODO ensure that the insert doesn't create dupes.
	*/
	var t = store.getTiddler(tiddlerTitle);
	this.tiddlers.push(t);
};


// register a display pattern for this TiddlerDisplayGroup. 
TiddlerDisplayGroup.prototype.setPattern = function(pattern) {
	this.pattern = pattern;
};


// return the template object for a given section.
TiddlerDisplayGroup.prototype.lookupTemplateSectionDetails = function(label) {
	for (var i=0; i < this.pattern.length; i++) {
		if(this.pattern[i].label == label)
			return this.pattern[i];
	};
	return null;
};


// return the template object for a given section.
TiddlerDisplayGroup.prototype.templateSectionDetails = function(tiddlerTitle) {
	var t = store.getTiddler(tiddlerTitle);
	if(!t)
		return null;
	var tagfilter;
	for (var i=0; i < this.pattern.length; i++) {
		tagfilter = this.pattern[i].tag;
		if(t.isTagged(tagfilter)) {
			return this.pattern[i];
		}
	};
	return null;
};


// Return the tiddler that this tiddler should be displayed after in the story.
TiddlerDisplayGroup.prototype.getTiddlerDisplayPosition = function(tiddlerTitle) {
	var sectionDetails = this.templateSectionDetails(tiddlerTitle);
	if(!sectionDetails)
		return null;
	// console.log(sectionDetails);
	
};


// display any tiddlers that must be display along with this one
TiddlerDisplayGroup.prototype.displayDependentTiddlers = function(tiddlerTitle) {
	var sectionDetails = this.templateSectionDetails(tiddlerTitle);
	if(!sectionDetails)
		return null;
	if(sectionDetails.require === null)
		return null;	
	var dependencySection = this.lookupTemplateSectionDetails(sectionDetails.require);
	
	// get tiddler with that tag and with the correct common_id as its groupField.
	var tiddlers = store.getTaggedTiddlers(dependencySection.tag);
	var	groupField = this.getGroupField();
	var t = store.getTiddler(tiddlerTitle);
	var common_id =	store.getValue(t, groupField);
	for (var t=0; t < tiddlers.length; t++) {
		if(store.getValue(tiddlers[t], groupField) == common_id)
			store.displayTiddler(tiddlers[t].title);
	};
};



	
} //# end of 'install only once'
//}}}
