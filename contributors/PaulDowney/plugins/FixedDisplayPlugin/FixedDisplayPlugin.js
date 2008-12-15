/***
|''Name:''|FixedDisplayPlugin|
|''Description:''|Use the DefaultTiddlers to assert a fixed page. |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/FixedDisplayPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/FixedDisplayPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
|''Overrides''|Story.prototype.saveTiddler() |
!!Documentation
A marvelously naive method of implementing a fixed page display, the DefaultTiddlers are reasserted whenever a tiddler is saved.
!!Code
***/
//{{{
if(!version.extensions.FixedDisplayPlugin) {
version.extensions.FixedDisplayPlugin = {installed:true};

Story.prototype._fixedDisplay_saveTiddler = Story.prototype.saveTiddler;
Story.prototype.saveTiddler = function(title,minorUpdate)
{
	this._fixedDisplay_saveTiddler(title,minorUpdate);
        this.forEachTiddler(function(title,element) {
                if(element.getAttribute("dirty") != "true")
                        this.closeTiddler(title);
        });
	this.displayDefaultTiddlers();
};

}
//}}}
