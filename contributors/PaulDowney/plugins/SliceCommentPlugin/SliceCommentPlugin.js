/***
|''Name:''|SliceCommentPlugin|
|''Description:''|enhance core slice functions to support commenting out of slices using --strikethough--|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SliceCommentPlugin |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.2|

***/

//{{{
if(!version.extensions.SliceComment){
version.extensions.SliceCommentPlugin = {installed:true};

TiddlyWiki.prototype.slicesCommentRE = /--[^\-]*--/gm;

//# ideally would like to wrap the original function or fix the split regex .. 
//# .. or patch the core
TiddlyWiki.prototype.calcAllSlices = function(title)
{
        var slices = {};
        var text = this.getTiddlerText(title,"");
	text = text.replace(this.slicesCommentRE,"");
        this.slicesRE.lastIndex = 0;
        var m = this.slicesRE.exec(text);
        while(m) {
                if(m[2])
                        slices[m[2]] = m[3];
                else
                        slices[m[5]] = m[6];
                m = this.slicesRE.exec(text);
        }
        return slices;
};

} //# end of 'install only once'
//}}}
