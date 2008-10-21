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

TiddlyWiki.prototype.superSlicesRE = /(?:^\|.*[^\\]|\s*$)/gm;

//@internal
TiddlyWiki.prototype.calcAllFatSlices = function(title,cols)
{
        var slices = [];
        var text = this.getTiddlerText(title,"");
        return slices;
};


} //# end of 'install only once'
//}}}
