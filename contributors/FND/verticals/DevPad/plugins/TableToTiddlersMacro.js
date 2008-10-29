/***
|''Name''|TableToTiddlersMacro|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#TableToTiddlersMacro]]|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Author''|FND|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|generates individual tiddlers from a table|
!Notes
* one tiddler per row (tiddler name is value of first column)
* transposing; one row in each tiddler per column (excluding first column) in the source data
!Usage
{{{
<<table2tiddlers [tiddler] [tags] [header] [footer] [author] [prefixes] [suffixes]>>
}}}
!!Parameters
|!Index|!Optional|!Description|!Default Value|h
|1|yes|name of target tiddler (containing the table to be processed)|current tiddler|
|2|yes|tags to assign to newly-created tiddlers|slices2tiddlers|
|3|yes|author to assign to newly-created tiddlers|slices2tiddlers|
|4|yes|table includes header row (true/false)|false|
|5|yes|table includes footer row (true/false)|false|
|6|yes|bracketed list of prefixes to assign to newly-created tiddlers' rows (one item per row)|N/A|
|7|yes|bracketed list of suffixes to assign to newly-created tiddler's rows (one item per row)|N/A|
!!Example
{{{
<<table2tiddlers [[Log Data]] "logs" "admin" "true" "true" "|!Time| |!User| [[|!Avg. Value|]] |!Signature|" "|h | | |f">>
}}}
This will generate a table of three rows ("Time", "User", "Avg. Value") in each newly-created tiddler, provided that there are a total of four columns in the source data.
!Revision History
!!v0.1 (2008-01-10)
* initial release
!To Do
* use launch button instead of executing the macro when rendered
* instead of suffix and prefix arrays as parameters, use one parameter (prefix-suffix pair) for each row
* documentation
!Code
***/
//{{{
config.macros.table2tiddlers = {
	tags: ["slices2tiddlers"],
	modifier: "slices2tiddlers"
};

config.macros.table2tiddlers.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	var tiddlerTitle = params[0] || tiddler.title;
	var tags = params[1] ? params[1].readBracketedList() : this.tags;
	var modifier = params[2] || this.modifier;
	var header = (params[3] == "true") ? true : false; // table includes header row
	var footer = (params[4] == "true") ? true : false; // table includes footer row
	var prefixes = params[5] ? params[5].readBracketedList(false) : [];
	var suffixes = params[6] ? params[6].readBracketedList(false) : [];
	var tiddlers = [];
	var errors = [];
	// retrieve individual rows
	var rows = store.getTiddlerText(tiddlerTitle);
	if(rows)
		rows = rows.split("\n");
	else
		wikify("error: tiddler not found", place);
	// create tiddlers from rows
	if(rows && rows.length > 0) {
		// remove table header and footer
		if(header)
			rows.splice(0, 1);
		if(footer)
			rows.splice(rows.length - 1, 1);
		// create tiddlers
		var cols, title, text;
		for(var i = 0; i < rows.length; i++) {
			// retrieve columns
			cols = rows[i].split("|");
			cols.splice(0, 1); // remove first element (always empty)
			cols.splice(cols.length - 1, 1); // remove last element (always empty)
			// create new tiddler
			title = cols[0];
			text = "";
			for(var j = 1; j < cols.length; j++) {
				text += (prefixes[j - 1] || "")
					+ cols[j]
					+ (suffixes[j - 1] || "")
					+ "\n";
			}
			if(!store.tiddlerExists(title)) { // do not overwrite local tiddlers
				store.saveTiddler(title, title, text, modifier, (new Date), tags, null, null, (new Date));
				tiddlers.push(title);
			} else {
				errors.push(title);
			}
		}
		// report results
		var output = "";
		if(errors.length > 0) {
			output += "!Tiddlers Not Created (" + errors.length + ")\n";
			for(i = 0; i < errors.length; i++)
				output += "* [[" + errors[i] + "]]\n";
		}
		if(tiddlers.length > 0) {
			output += "!Tiddlers Created (" + tiddlers.length + ")\n";
			for(i = 0; i < tiddlers.length; i++)
				output += "* [[" + tiddlers[i] + "]]\n";
		}
		wikify(output, place);
	}
};
//}}}