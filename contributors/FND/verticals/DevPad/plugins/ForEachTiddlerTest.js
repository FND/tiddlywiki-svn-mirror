/***
|Name|ForEachTiddlerTest|
|Source|[[FND's DevPad|http://devpad.tiddlyspot.com/#FETTest]]|
|Version|0.1|
|Author|FND|
|License|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|N/A|
|Overrides|N/A|
|Description|just for testing/debugging purposes|
!Usage
Add {{{<<FET>>}}} to the desired tiddler(s).
<<FET>>
!Changelog
!!v0.1 (2007-05-21)
* initial release
!Issues / To Do
* ...
!Code
***/
//{{{
/*
** Command Button
*/

/* Macro Button */
// adapted from Jack's DoBackupMacro (http://groups.google.com/group/TiddlyWiki/browse_thread/thread/5f1123d08bdadeac/86245d5e4bbe846c)
config.macros.FET = { label: "FETTest", prompt: "ForEachTiddler Test" };
config.macros.FET.handler = function(place) {
	createTiddlyButton(place, this.label, this.prompt, function() {
			var tmp = FETTest().tiddlers;
			tmp = FETTest(tmp, "plugin"); // DEBUG: test for second run
			alert(FETTest(tmp, "systemConfig")); // DEBUG: test for third run
			return false; // DEBUG: ?
		}, null, null, this.accessKey
	); // DEBUG - to do: look up createTiddlyButton()'s parameters
}

/*
** Main Code
*/

FETTest = function(object, filter) {
	// initialize
	alert(object + "\n\n" + filter); // DEBUG
	var tiddlers = []; // title and tags[] for each tiddler
	var tags = []; // global tags list
	var results = {}; // object for return values
	if(object == null) { // use store if no object has been specified
		object = store;
	}
	// retrieve matching tiddlers
	object.forEachTiddler(
		function(title, tiddler) {
			if(filter == null || inArray(filter, tiddler.tags)) { // check whether tiddler is assigned the filter tag
				var t = {}; // DEBUG: viable container for using forEachTiddler on?
				t.title = title;
				t.tags = tiddler.tags;
				tiddlers.push(t);
				// add unique tags to global list
				for(var i = 0; i < tiddler.tags.length; i++) {
					tags.pushUnique(tiddler.tags[i]);
				}
			}
		}
	);
	// return results
	results.tiddlers = tiddlers;
	results.tags = tags;
	return results;
}

/*
** Support Functions
*/

function inArray(needle, haystack) {
    for(var i = 0; i < haystack.length; i++) {
        if(haystack[i] == needle) {
            return true;
        }
    }
    return false;
}
//}}}