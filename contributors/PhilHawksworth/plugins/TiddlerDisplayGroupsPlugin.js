/***
|''Name:''|TiddlerDisplayGroupsPlugin |
|''Description:''|Display groups of tiddlers in the story according to defined template. |
|''Author:''|Phil Hawksworth |
|''Version:''|0.1 |
|''Date:''|28th April 2008 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4 beta |
***/

//{{{
if(!version.extensions.TiddlerDisplayGroupsPlugin) {
version.extensions.TiddlerDisplayGroupsPlugin = {installed:true};
	
var TiddlerDisplayGroups = [];
	
function TiddlerDisplayGroup() {
	this.groupField = null;
	this.bunches = [];
	this.pattern = null;
	TiddlerDisplayGroups.push(this);
};


// Get the TiddlerDisplayGroups object which this tiddler is managed by.
function getTiddlerDisplayGroup(tiddler) {
	var groupObj = null;
	store.forEachField(tiddler,function(t,f,v){
		for (var g=0; g < TiddlerDisplayGroups.length; g++) {
			if(TiddlerDisplayGroups[g].getGroupField() == f) {
				groupObj = TiddlerDisplayGroups[g];
				break;
			}
		};
	},true);
	return groupObj;
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
// return the bunch.
TiddlerDisplayGroup.prototype.fileTiddler = function(tiddlerTitle) {
	var t = store.getTiddler(tiddlerTitle);
	var groupField = this.getGroupField();
	var common_id = store.getValue(t, groupField);
	var b = this.findBunch(common_id);
	if(!b)
		b = this.createBunch(common_id);
	var details = this.templateSectionDetails(tiddlerTitle);
	b.addTiddler(tiddlerTitle, details.label, details.openAt);
	return b;
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


// return the template object for a the section that this tiddler belongs to.
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

// return the section details for the section in the template preceeding the one specified
TiddlerDisplayGroup.prototype.getPreviousSectionDetails = function(label) {
	var sectionIndex = 0;
	for (var i=0; i < this.pattern.length; i++) {
		if(this.pattern[i].label == label) 
			sectionIndex = i;
	};	
	if(sectionIndex > 0)
		return this.pattern[sectionIndex-1];
	else
		return null;
};


// Return the tiddler that this tiddler should be displayed after in the story.
TiddlerDisplayGroup.prototype.getTiddlerDisplayPosition = function(tiddlerTitle) {
	
	// get section details for this tiddler
	var sectionDetails = this.templateSectionDetails(tiddlerTitle);
	if(!sectionDetails)
		return null;

	var groupField = this.getGroupField();
	var t = store.getTiddler(tiddlerTitle);
	var common_id = store.getValue(t, groupField);
	var bunch = this.findBunch(common_id);
	if(!bunch) 
		return null;
	
	var after = null;
	var targetSection = sectionDetails.label;
	
	// determin top or bottom display.
	var locationInSection = sectionDetails.openAt;

	// if bottom. find last tiddler in this section of bunch
	if(locationInSection == 'bottom') {
		var tiddlers = bunch.getTiddlersInSection(targetSection);
		if(tiddlers && tiddlers.length > 0) {
			var after = tiddlers[tiddlers.length-1].title;	
			return after;
		}
	}
	
	// if top or if there were no tiddlers in the group to display at the bottom of, find last tiddler in bunch of for previous section
	while(!after) { 
		var previousSection = this.getPreviousSectionDetails(targetSection);
		if(!previousSection)
			return null;
		var tiddlers = bunch.getTiddlersInSection(previousSection.label);
		if(tiddlers && tiddlers.length > 0) {
			var after = tiddlers[tiddlers.length - 1].title;
		}
		targetSection = previousSection.label;
	}
	return after;
};




// get any tiddlers that must be displayed along with this one
TiddlerDisplayGroup.prototype.findRequiredTiddlers = function(tiddlerTitle) {
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
	var requiredTiddlers = [];
	for (var t=0; t < tiddlers.length; t++) {
		if(store.getValue(tiddlers[t], groupField) == common_id) {
			requiredTiddlers.push(tiddlers[t].title);
		}		
	};
	return requiredTiddlers.length > 0 ? requiredTiddlers : null;
};


// Get any tiddlers that require this tiddler to be diplayed.
TiddlerDisplayGroup.prototype.findRequiredByTiddlers = function(tiddlerTitle) {

	//find the bunch that this tiddler belongs to
	var t = store.getTiddler(tiddlerTitle);
	var	groupField = this.getGroupField();
	var common_id =	store.getValue(t, groupField);	
	var bunch = this.findBunch(common_id);
	
	//get the section label of the section that this tiddler belongs to.
	var section = bunch.getSection(tiddlerTitle);
	
	//for all other sections.
	var tiddlers = [];
	var t, thisLabel, require;	
	for (var i=0; i < this.pattern.length; i++) {
		if(this.pattern[i].label != section) {
			thisLabel = this.pattern[i].label;
			require = this.lookupTemplateSectionDetails(thisLabel).require;	
			if(require == section)
				tiddlers = tiddlers.concat(bunch.getTiddlersInSection(thisLabel));
		}
	};
	return tiddlers.length > 0 ? tiddlers : null;
};



// Bunch constructor.
function Bunch(id) {
	this.id = id;
	this.tiddlers = [];
};


// Add a tiddler to a bunch without creating duplications.
Bunch.prototype.addTiddler = function(tiddlerTitle, sectionLabel, placement) {
	if(this.isPresent(tiddlerTitle))
		return;
	var t = {'title':tiddlerTitle, 'section':sectionLabel};
	this.tiddlers.push(t);
};


// Remove a tiddler from a bunch
Bunch.prototype.removeTiddler = function(tiddlerTitle) {
	if(this.isPresent(tiddlerTitle)) {
		for (var t=0; t < this.tiddlers.length; t++) {
			if(this.tiddlers[t].title == tiddlerTitle)
				this.tiddlers.remove(this.tiddlers[t]);
		};
	}
};


// Check for the existence of a given tiddler in a bunch.
Bunch.prototype.isPresent = function(tiddlerTitle) {
	for (var i=0; i < this.tiddlers.length; i++) {
		if(this.tiddlers[i].title == tiddlerTitle) {
			return true;
		}
	};
	return false;
};


// Return the name of the section which this tiddler belongs to in the bunch.
Bunch.prototype.getSection = function(tiddlerTitle) {
	for (var t=0; t < this.tiddlers.length; t++) {
		if(this.tiddlers[t].title == tiddlerTitle)
			return this.tiddlers[t].section;
	};
};


// Return an array of tiddlers which belong to a given section of this bunch
Bunch.prototype.getTiddlersInSection = function(sectionLabel) {
	var tiddlers = [];
	for (var t=0; t < this.tiddlers.length; t++) {
		if(this.tiddlers[t].section == sectionLabel)
			tiddlers.push(this.tiddlers[t]);
	};
	return tiddlers;
};



//store the existing displayTiddler and closeTiddler functions for use later.
version.extensions.TiddlerDisplayGroupsPlugin.displayTiddler = story.displayTiddler;
version.extensions.TiddlerDisplayGroupsPlugin.closeTiddler = story.closeTiddler;

//replace the displayTiddler function.
Story.prototype.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle) {	

	var group_object = getTiddlerDisplayGroup(tiddler);
	if(!group_object) {
		version.extensions.TiddlerDisplayGroupsPlugin.displayTiddler.apply(this, arguments);
		return;
	}

	var bunching_id = store.getValue(tiddler, group_object.getGroupField());

	// Find or create bunch
	var b = group_object.findBunch(bunching_id);
	if(!b) 
		b = group_object.createBunch(bunching_id);

	var animSrc = srcElement;

	// Set the correct display location in the bunch.
	var s = group_object.getTiddlerDisplayPosition(tiddler);
	var src = srcElement;
	var srcElement = story.getTiddler(group_object.getTiddlerDisplayPosition(tiddler));

	// Display.
	version.extensions.TiddlerDisplayGroupsPlugin.displayTiddler.apply(this,[src,tiddler,template,animate,unused,customFields,toggle,animSrc]);

	//file tiddler
	group_object.fileTiddler(tiddler);
	
	//find and display required tiddlers.
	var dTiddlers = group_object.findRequiredTiddlers(tiddler);
	if(dTiddlers) {
		for (var t=0; t < dTiddlers.length; t++) {
			tiddler = dTiddlers[t];
			story.displayTiddler.apply(this, [null,tiddler,null,false,unused,customFields,false,animSrc]);
		};		
	}
};


// Replace the closeTiddler function
Story.prototype.closeTiddler = function(title,animate,unused){
	
	//close the tiddler.
	version.extensions.TiddlerDisplayGroupsPlugin.closeTiddler.apply(this,arguments);
	
	//Get the group display object that manages this tiddler.
	var tiddler = store.getTiddler(title);
	var group_object = getTiddlerDisplayGroup(tiddler);
	if(!group_object) 
		return;
	
	// find required-by tiddlers.
	var requiredby = group_object.findRequiredByTiddlers(title);
	if(requiredby) {
		for (var r=0; r < requiredby.length; r++) {
			title = requiredby[r].title;
			story.closeTiddler.apply(this, arguments);
		};
	}

	//remove it from the bunch.
	var bunching_id = store.getValue(title,'rr_session_id');
	if(bunching_id) {
		var b = group_object.findBunch(bunching_id);	
		b.removeTiddler(title);
	}
};


} //# end of 'install only once'
//}}}
