/***
|''Name:''|ProgressBarPlugin.js|
|''Description:''|Progress bar plugin |
|''Author:''|Jeremy Ruston (jeremy (at) osmosoft (dot) com)|
|''Source:''|http://svn.tiddlywiki.org/Trunk/contributors/JeremyRuston/plugins/ProgressBarPlugin.js|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JeremyRuston/plugins/ProgressBarPlugin.js|
|''Version:''|0.0.9|
|''Status:''|Under Development|
|''Date:''|Dec 09, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|BSD|
|''~CoreVersion:''|2.4.1|
***/

/***
The {{{<<progress name:"blah">>}}} macro creates a named progress bar. All visible progress bars with a given name can
be updated at once with a single call to the setProgress() function
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ProgressBarPlugin) {
version.extensions.ProgressBarPlugin = {installed:true};

config.macros.progress = {
	
	defaultProgressName: "defaultProgress",
	progressClassPrefix: "progressClass_",
	width: 100,
	
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		params = paramString.parseParams("name");
		var progressName = params[0]["name"] ? params[0]["name"][0] : this.defaultProgressName;
		var box = createTiddlyElement(place,"span",null,"sparkline",String.fromCharCode(160));
		addClass(box,"progressBar");
		addClass(box,this.progressClassPrefix + progressName)
		var w = box.offsetWidth;
		var h = box.offsetHeight;
		box.style.paddingRight = (this.width - w) + "px";
		box.style.position = "relative";
		var tick = document.createElement("img");
		tick.border = 0;
		tick.className = "sparktick";
		tick.style.position = "absolute";
		tick.src = "data:image/gif,GIF89a%01%00%01%00%91%FF%00%FF%FF%FF%00%00%00%C0%C0%C0%00%00%00!%F9%04%01%00%00%02%00%2C%00%00%00%00%01%00%01%00%40%02%02T%01%00%3B";
		tick.style.left = "0px";
		tick.style.width = "25px";
		tick.style.top = "0px";
		tick.style.height = h + "px";
		box.appendChild(tick);
		box.tick = tick;
	}
};

function setProgress(progressName,percent)
{
	var progressBars = document.getElementsByClassName("progressBar");
	percent = percent < 0 ? 0 : percent;
	percent = percent > 100 ? 100 : percent;
	for(var t = 0; t < progressBars.length; t++) {
		progressBars[t].tick.style.width = (percent/100) * config.macros.progress.width + "px";
	}
}

} // if(!version.extensions.ProgressBarPlugin)

//}}}
