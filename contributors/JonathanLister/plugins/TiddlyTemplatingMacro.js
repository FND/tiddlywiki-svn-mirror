/***

|''Name:''|TiddlyTemplatingMacro |
|''Description:''|Renders a template and saves the output to a local file |
|''Author:''|JonathanLister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/TiddlyTemplatingMacro.js |
|''Version:''|2 |
|''Date:''|25/3/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3 |

Usage:
{{{
<<TiddlyTemplating path template>>
}}}

Description:
Provides a button labelled "Publish" that triggers the templating and saving processes

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.TiddlyTemplating) {
version.extensions.TiddlyTemplating = {installed:true};

config.macros.TiddlyTemplating = {};

config.macros.TiddlyTemplating.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var button = createTiddlyButton(place,"publish","publish",config.macros.TiddlyTemplating.publish);
	button.params = params;
};

config.macros.TiddlyTemplating.publish = function(e)
{
	config.messages.fileSaved = "file successfully saved";
	config.messages.fileFailed = "file save failed";
	var saveName = this.params[0];
	var template = this.params[1];
	if (!template) {
		// Change to use a default template when one exists, maybe to backup the whole TW?
		displayMessage("TiddlyTemplating: usage <<TiddlyTemplating filename template>>");
		return;
	}
	var localPath = getLocalPath(document.location.toString());
	var savePath;
	if((p = localPath.lastIndexOf("/")) != -1)
		savePath = localPath.substr(0,p) + "/" + saveName;
	else if((p = localPath.lastIndexOf("\\")) != -1)
		savePath = localPath.substr(0,p) + "\\" + saveName;
	else
		savePath = localPath + "." + saveName;
	displayMessage("generating...");
	var content = expandTemplate(template);
	displayMessage("saving...");
	var fileSave = saveFile(savePath,convertUnicodeToUTF8(content));
	if(fileSave) {
		displayMessage("saved... click here to load","file://"+savePath);
	} else {
		alert(config.messages.fileFailed,"file://"+savePath);
	}
};

} //# end of 'install only once'
//}}}
