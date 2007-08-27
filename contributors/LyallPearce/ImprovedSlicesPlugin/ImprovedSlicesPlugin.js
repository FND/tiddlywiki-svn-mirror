/***
|''Name:''|ImprovedSlicesPlugin|
|''Source:''|http://www.Remotely-Helpful.com/TiddlyWiki/ImprovedSlicesPlugin.html|
|''Version:''|1.0.1|
|''Author:''|Lyall Pearce|
|''License:''|[[Creative Commons Attribution-Share Alike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.4|
|''Requires:''|N/A|
|''Overrides:''|~TiddlyWiki.prototype.getTiddlerSlice() and ~store.getTiddlerSlice() |
|''Description:''|Enhances the Slicing capabilities where slices work before.|
!!!!!Usage
<<<
Whereas default slice functionality is specified as {{{"TiddlerName::SliceName"}}}, this plugin extends this, transparently
such that the following forms work...

{{{"TiddlerName::SliceName"}}}

Standard behaviour. Find the slice, return the data, as per standard TiddlyWiki functionality.

For table based slices, the following additional functionality is provided.

{{{"TiddlerName::SliceName#x"}}} where x is a number, meaning return this many columns of the table.

Zero values return all columns after the slice name.
Positive values return that many columns, starting in the column after the slice name.
Negative values return that many columns (converted to positive), starting from the last column in the row, counting backwards.

Given the following table...
|Slice Name|Value|Another Value|Move Value|
|SliceName|Value 1|Value 2|Value 3|

{{{"TiddlerName::SliceName#0"}}} = Value 1|Value 2|Value 3
{{{"TiddlerName::SliceName#1"}}} = Value 1
{{{"TiddlerName::SliceName#2"}}} = Value 1|Value 2
{{{"TiddlerName::SliceName#-1"}}} = Value 3
{{{"TiddlerName::SliceName#-2"}}} = Value 2|Value 3
{{{"TiddlerName::SliceName#-3"}}} = Value 1|Value 2|Value 3


In addition to the above, {{{"TiddlerName::SliceName+x#y"}}} x specifies how many columns to skip (from the start or end) before returning y columns.

If you wish to use the +x syntax, then you must include the #y component. eg. {{{"TiddlerName::SliceName+2"}}} will be treated as "SliceName+2", not "SliceName", skip 2 columns before returning a column.

{{{"TiddlerName::SliceName+0#0"}}} = Value 1|Value 2|Value 3
{{{"TiddlerName::SliceName+0#1"}}} = Value 1
{{{"TiddlerName::SliceName+0#2"}}} = Value 1|Value 2
{{{"TiddlerName::SliceName+1#0"}}} = Value 2|Value 3
{{{"TiddlerName::SliceName+1#1"}}} = Value 2
{{{"TiddlerName::SliceName+1#2"}}} = Value 2|Value 3

If x is negative, then skip ''backwards'' from the end before returning y columns (continuing to count backwards)

{{{"TiddlerName::SliceName+0#-1"}}} = Value 3
{{{"TiddlerName::SliceName+0#-2"}}} = Value 2|Value 3
{{{"TiddlerName::SliceName+0#-3"}}} = Value 1|Value 2|Value 3
{{{"TiddlerName::SliceName+1#-1"}}} = Value 2
{{{"TiddlerName::SliceName+1#-2"}}} = Value 1|Value 2
{{{"TiddlerName::SliceName+1#-3"}}} = Value 1

<<<
!!!!!ToDo
<<<
    Bugs: 
1. A table consisting of a single cell, prior to a table containing slices, will swallow the first slice.
   Something to do with the regex not behaving as I expect.
2. If a table row contains a cell containing whitespace, the whole row is swallowed. Eg. {{{| |SliceName|values|}}}

<<<
!Code
***/
//{{{
version.extensions.TiddlerEncryptionPlugin = {major: 1, minor: 0, revision: 1, date: new Date(2007,8,27)};

// Unlike the core, I have separated the non-table slices and table slices into separate
// regexps - this makes it easier to understand, albeit a bit longer.
TiddlyWiki.prototype.slicesReColon = /(?:^[\t ]*[\'\/]*~?([\.\w\t ]+)[\'\/]*\:[\'\/\t ]*(.*?)[\t ]*$)/gm;

// Does not cope with slices with leading cells that contain spaces...  eg. | |sliceName|sliceValue|
TiddlyWiki.prototype.slicesReTable   = /(?:^[\|\t \>\~]*?\|[\'\/\t\ \~]*([\w ]+?)[:\'\/\t\ ]*?\|[\t\ ]*(.+?)[\t\ ]*\|[\t\ ]*$)/gm;

// Completely replace the default slice calculation routine - to use the two regexps
// rather than the more complex single regexp
TiddlyWiki.prototype.calcAllSlices_ImprovedSlicesPlugin  = TiddlyWiki.prototype.calcAllSlices;
TiddlyWiki.prototype.calcAllSlices = function(title)
{
    var slices = {};
    var text = this.getTiddlerText(title,"");
    var m = undefined;
    this.slicesReTable.lastIndex = 0;
    do {
	m = this.slicesReTable.exec(text);
	if(m) {
	    slices[m[1]] = m[2];
	};
    } while(m);
    m = undefined;
    this.slicesReColon.lastIndex = 0;
    do {
	m = this.slicesReColon.exec(text);
	if(m) {
	    slices[m[1]] = m[2];
	};
    } while(m);
    return slices;
};
// Completely replace the default slice finding routine.
store.getTiddlerSlice_ImprovedSlicesPlugin = TiddlyWiki.prototype.getTiddlerSlice;
store.getTiddlerSlice = function(title,sliceName)
{
    var hashLoc = sliceName.lastIndexOf('#');
    var plusLoc = hashLoc < 0 ? -1 : sliceName.lastIndexOf('+', hashLoc);
    // var testingMode = title.substr(0,9) == 'TestSlice' ? 1 : 0;
    var theSliceName;
    if(plusLoc < 0) {
	theSliceName = hashLoc < 0 ? sliceName : sliceName.substring(0, hashLoc);
    } else { 
	theSliceName = hashLoc < 0 ? sliceName : sliceName.substring(0, plusLoc);
    }
    var plusAttr = (plusLoc < 0) ? 0 : parseInt(sliceName.substring(plusLoc+1, hashLoc));
    var hashAttr = (hashLoc < 0) ? 0 : parseInt(sliceName.substr(hashLoc+1));

    var slices = this.slices[title];
    if(!slices) {
	slices = this.calcAllSlices(title);
	this.slices[title] = slices;
    }
    try {
	var sliceValues = slices[theSliceName].split('|');
    } catch (e) {
	return "";
    }
    var sliceEnd = 1;
    var sliceBegin = plusAttr;
    if (hashAttr != 0) {
	if(hashAttr < 0) {
	    sliceEnd = (sliceValues.length) - plusAttr;
	    sliceBegin = sliceEnd + (hashAttr * 1);
	} else {
	    sliceEnd = sliceBegin + hashAttr;
	}
    }
    // if(testingMode == 1) {
    // 	displayMessage("Title="+title+" slice="+sliceName+" plusLoc="+plusLoc+" plusAttr="+plusAttr+" hashLoc="+hashLoc+" hashAttr="+hashAttr+" theSliceName="+theSliceName+" sliceBegin="+sliceBegin+" sliceEnd="+sliceEnd+" Source="+sliceValues);
    // }
    return sliceValues.slice(sliceBegin, sliceEnd).join('|');
};
//}}}
