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
TiddlyWiki.prototype.calcFatSlices = function(title)
{
        var slices = {};
	var cols = [];
        var text = this.getTiddlerText(title,"");
        this.slicesRE.lastIndex = 0;
        var m = this.fatSlicesRE.exec(text);
        while(m) {
		var slice = m[1].split('|');
		console.log(slice);
		var key = slice.shift();
		console.log(key);
		if (!cols.length){
			cols = slice;
		} else {
			row = {};
			for(var i=0;i<cols.length;i++){
				row[cols[i]]=slice[i];
			}
			slices[key] = row;
		}
                m = this.fatSlicesRE.exec(text);
        }
        return slices;
};


} //# end of 'install only once'
//}}}
