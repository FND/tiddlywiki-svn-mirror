/***

|''Name:''|TiddlyTemplatingMacro |
|''Description:''|Renders a template and saves the output to a local file |
|''Author:''|JonathanLister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/TiddlyTemplatingMacro.js |
|''Version:''|3 |
|''Date:''|25/3/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3 |

Usage:
{{{
<<TiddlyTemplating template|template:tiddlerName [filter:filterString] [wikitext:true] [fileName:fileName]>>
}}}

Description:
Provides a button labelled "Publish" that triggers the templating and saving processes

***/

//{{{
if(!version.extensions.TiddlyTemplating) {
version.extensions.TiddlyTemplating = {installed:true};

config.macros.TiddlyTemplating = {
	defaultFileName:"output.txt"
};

config.macros.TiddlyTemplating.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var button = createTiddlyButton(place,"Publish","Publish",config.macros.TiddlyTemplating.templateAndPublish);
	button.params = params;
	button.paramString = paramString;
};

config.macros.TiddlyTemplating.templateAndPublish = function(e)
{
	var p = this.paramString.parseParams("anon",null,true,false,false);
	var template = config.macros.TiddlyTemplating.getTemplate(p);
	var tiddlers = config.macros.TiddlyTemplating.getTiddlers(p);
	var wikitext = getParam(p,"wikitext",null);
	var fileName = getParam(p,"fileName",null);
	displayMessage("generating...");
	var content = expandTemplate(template,tiddlers,wikitext);
	config.macros.TiddlyTemplating.save(fileName,content);
};

config.macros.TiddlyTemplating.getTemplate = function(p)
{
	var template = getParam(p,"template",null);
	if(!template)
		template = getParam(p,"anon",null);
	return template;
};

config.macros.TiddlyTemplating.getTiddlers = function(p)
{
	var filter = getParam(p,"filter",null);
	var tiddlers = [];
	if(filter) {
		tiddlers = store.filterTiddlers(filter);
	} else {
		// no filter provided, so inherit or create temp tiddler
		tiddlers.push(tiddler ? tiddler : new Tiddler("temp"));
	}
	return tiddlers;
};

config.macros.TiddlyTemplating.getFileName = function(p)
{
	var fileName = getParam(p,"fileName",null);
	if(!fileName)
		fileName = this.defaultFileName;
};

config.macros.TiddlyTemplating.save = function(fileName,content)
{
	config.messages.fileSaved = "file successfully saved";
	config.messages.fileFailed = "file save failed";
	var localPath = getLocalPath(document.location.toString());
	var savePath;
	if((p = localPath.lastIndexOf("/")) != -1)
		savePath = localPath.substr(0,p) + "/" + fileName;
	else if((p = localPath.lastIndexOf("\\")) != -1)
		savePath = localPath.substr(0,p) + "\\" + fileName;
	else
		savePath = localPath + "." + fileName;
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