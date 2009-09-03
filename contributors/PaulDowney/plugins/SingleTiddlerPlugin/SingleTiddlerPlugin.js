/***
|''Name:''|SingleTiddlerPlugin|
|''Description:''| Simple Single Tiddler Display |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/SingleTiddlerPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SingleTiddlerPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
Display one tiddler at one time.
!!Code
***/
//{{{
if(!version.extensions.SingleTiddlerPlugin) {
version.extensions.SingleTiddlerPlugin = {installed:true};

	Story.prototype._displayTiddler = Story.prototype.displayTiddler;
	Story.prototype.displayTiddler = function()
	{
		story.closeAllTiddlers();
		this._displayTiddler.apply(this, arguments);
	}
}
//}}}
