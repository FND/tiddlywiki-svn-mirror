/***
|''Name:''|ArchivedTimeline|
|''Version:''|0.5.0 (Apr 19, 2006)|
|''Source:''|https://sourceforge.net/projects/ptw/|
|''Author:''|BramChen|
|''Type:''|Macro|
!Description
Timeline archived monthly.
!Syntax/Examples
>{{{<<timeline [modified | created]>>}}}

!Known issues/Todos
* 

!Instructions

!Notes
*
!Revision history
* v0.5.0 (Apr 19, 2006)
** Fixed bug for twice records of the same date ()
** Added Date.prototype.convertToLocalYYYYMMDDHHMM for backward compatible with 2.0.6-
* v0.4.0 (Apr 03, 2006)
** Added new parameter to <<timeline sortfield maxentries>>
** Added config.options.txtTimelineMaxentries
* v0.3.1 (Feb 04, 2006)
** JSLint checked
* v0.3.0 (Feb 04, 2006)
** Fixed several missing variable declarations
* v0.2.0 (Dec 26, 2005)
** changed for the new feature of Macro timeline of TW 2.0.0 beta 6
* v0.1.0 (Nov 3, 2005)
** Initial release.

!Code
***/
//{{{
version.extensions.archivedTimeline = {major: 0, minor: 5, revision: 0,
	date: new Date("Apr 19, 2006"),
	name: "ArchivedTimeline",
	type: "Macro",
	author: "BramChen",
	source: "http://sourceforge.net/project/showfiles.php?group_id=150646"
};
config.options.txtTimelineMaxentries=0;
config.macros.archivedTimeline = {
	tooltips: "Archives sorted by  ",
	msg : "The param of macro timeline should be 'created' or 'modified'",
	dateFormat: "YYYY0MM0DD"
};
config.macros.timeline = config.macros.archivedTimeline;

config.macros.timeline.handler = function(place,macroName,params) {
	var field = params[0] ? params[0] : "modified";
	if (field != "modified" && field != "created") {
		displayMessage(config.macros.timeline.msg);
		return;
	}
	place.appendChild(document.createTextNode(this.tooltips + field));
	var tiddlers = store.reverseLookup("tags","excludeLists",false,field);
	var lastMonth = ""; var lastDay = ""; var theText = "----\n"; var i = 0;
	var last = (params[1])?params[1]:config.options.txtTimelineMaxentries;
		last = (isNaN(last)||last<1) ? 0:tiddlers.length-Math.min(tiddlers.length,parseInt(last));
	var cookie; var archives;
	for (var t=tiddlers.length-1; t>=last; t--) {
		var tiddler = tiddlers[t];
		var theMonth = tiddler[field].convertToLocalYYYYMMDDHHMM().substr(0,6);
		var theDay = tiddler[field].convertToLocalYYYYMMDDHHMM().substr(0,8);
		if(theMonth != lastMonth) {
			if (lastMonth === "") {
				lastMonth = theMonth;
				}
			else {
				place.appendChild(document.createElement("hr"));
				cookie = 'chktimeline'+(i++);
				archives = this.formatString(this.dateFormat, lastMonth);
				this.slider(place,cookie,theText,archives,this.tooltips + archives);
				lastMonth = theMonth; theText = "----\n";
			}
		}
		if(theDay != lastDay){
			theText +=  tiddler[field].formatString(this.dateFormat) + '\n';
			lastDay = theDay; 
		}
		theText += '* [[' + tiddler.title + ']]\n';
	}
	place.appendChild(document.createElement("hr"));
	cookie = 'chktimeline'+(i++);
	archives = this.formatString(this.dateFormat, lastMonth);
	this.slider(place,cookie,theText,archives,this.tooltips + archives);
	place.appendChild(document.createElement("hr"));
};

config.macros.timeline.onClickSlider = config.macros.slider.onClickSlider;

config.macros.timeline.slider = function(place,cookie,text,id,tooltips)
{
	var btn = createTiddlyButton(place,id,tooltips,this.onClickSlider);
	var panel = createTiddlyElement(place,"div",null,"timelineSliderPanel",null);
		panel.setAttribute("cookie",cookie);
		panel.style.display = config.options[cookie] ? "block" : "none";
	if(text){
		wikify(text,panel);
	}
};

config.macros.timeline.formatString = function(template, yyyymm)
{
	var dateString = new Date(yyyymm.substr(0,4)+'/'+yyyymm.substr(4,2)+'/01');
	template = template.replace(/DDD|0DD|DD|hh|mm|ss/g,'');
	return dateString.formatString(template);
};
if (!Date.prototype.convertToLocalYYYYMMDDHHMM){
	Date.prototype.convertToLocalYYYYMMDDHHMM = function(){
		return(String.zeroPad(this.getFullYear(),4) + String.zeroPad(this.getMonth()+1,2) + String.zeroPad(this.getDate(),2) + String.zeroPad(this.getHours(),2) + String.zeroPad(this.getMinutes(),2));
	}
}
//}}}