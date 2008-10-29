/***
|''Name''|RandomSliceMacro|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Author''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#RandomSliceMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|Fetches a random slice from a given tiddler.|
!Usage
{{{
<<randomSlice [tiddler name] [show label] [separator string]>>
}}}
!!Examples
<<randomSlice [[ColorPalette]]>>
<<randomSlice [[ColorPalette]] true "::">>
!Revision History
!!v0.1 (2007-12-16)
* initial release
!To Do
* documentation
* custom label position (pre-/suffix)
!Code
***/
//{{{
config.macros.randomSlice = {};

config.macros.randomSlice.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	var title = params[0] || tiddler.title;
	var showLabel = params[1] || false;
	var separator = params[2] || ": ";
	var slices = store.calcAllSlices(title);
	var labels = [];
	for(var name in slices) { // use Hash.keys() instead? cf. http://rick.measham.id.au/javascript/hash.htm
		labels.push(name);
	}
	if(labels.length > 0) {
		var r = Math.round((labels.length - 1) * Math.random());
		var value = slices[labels[r]];
		if(showLabel) {
			var output = labels[r] + separator + value;
		} else {
			var output = value;
		}
		wikify(output, place);
	}
};
//}}}