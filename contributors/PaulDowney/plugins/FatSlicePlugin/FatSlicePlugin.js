/***
|''Name:''|FatSlicePlugin|
|''Description:''|wide slices|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/FatSlicePlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation

!!!Source Code
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
		if (!cols.length) {
			cols = slice;
			for(var i=0;i<cols.length;i++){
				cols[i] = cols[i].replace(/[^\w]/g, '');
			}
		} else {
			row = {};
			for(var i=0; i<cols.length; i++){
				row[cols[i]]=slice[i];
			}
			slices[key] = row;
		}
		m = this.fatSlicesRE.exec(text);
	}
	return slices;
};

TiddlyWiki.prototype.getFatSlice = function(title,row,col) {
	var slices = this.calcFatSlices(title);
	return slices[row][col];
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
