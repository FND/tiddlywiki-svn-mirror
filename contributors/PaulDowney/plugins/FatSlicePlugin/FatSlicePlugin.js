/***
|''Name:''|FatSlicePlugin|
|''Description:''|slices with multiple columns|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''Source:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/FatSlicePlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/FatSlicePlugin/ |
|''Documentation:''|##Documentation |
|''Status:''|@@Beta@@|
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4.1|
!Documentation
The Fat Slice Plugin enriches the existing Slice mechanism in TiddlyWiki.
It enables the specification of lookup tables which are addressable by column and row rather than just Name/Value pairs of the current slice implementation.

A data table takes the form:
{{{
| |!column1 |!column2 |!column3 |
|row1| a | b | c |
|row2| d | e | f |
|row3| g | h | i |
}}}

Values can be retrieved from the data set via the getFatSlice() function:
{{{
var v = getFatSlice('TiddlerName', 'RowName', 'ColumnName');
}}}

Such data is also accessable from wikitext via the slice macro:
{{{
<<slice [[TiddlerName]] "RowName" "ColumnName">>
}}}

The slice macro also provides access to data in standard tiddler slices:
{{{
<<slice [[TiddlerName]] "SliceName">>
}}}

!!Source Code
***/

//{{{
if(!version.extensions.FatSlicePlugin){
version.extensions.FatSlicePlugin = {installed:true};

TiddlyWiki.prototype.fatSlicesRE = /^\|(.*)\|$/gm;

// @internal
TiddlyWiki.prototype.calcFatSlices = function(title) {
	var slices = {};
	var cols = [];
	var text = this.getTiddlerText(title,"");
	this.slicesRE.lastIndex = 0;
	var m = this.fatSlicesRE.exec(text);
	while(m) {
		var slice = m[1].split('|');
		var key = slice.shift();
		key = key.replace(/[^\w]/g, '');
		if (!key) {
			cols = slice;
			for(var i=0;i<cols.length;i++){
				cols[i] = cols[i].replace(/[^\w]/g, '');
			}
		} else {
			row = {};
			for(var i=0; i<cols.length; i++){
				if (cols[i]){
					row[cols[i]]=slice[i];
				}
			}
			slices[key] = row;
		}
		m = this.fatSlicesRE.exec(text);
	}
	return slices;
};

TiddlyWiki.prototype.getFatSlice = function(title,row,col) {
	var slices = this.calcFatSlices(title);
	return slices[row]?slices[row][col]:undefined;
};

// Slice macro.
config.macros.slice = {};
config.macros.slice.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	if(params.length > 2){
		createTiddlyText(place,store.getFatSlice(params[0],params[1],params[2]));
	} else {
		// use the builtn in slice functionality.
		createTiddlyText(place,store.getTiddlerSlice(params[0],params[1]));		
	}
};

} //# end of 'install only once'
//}}}
