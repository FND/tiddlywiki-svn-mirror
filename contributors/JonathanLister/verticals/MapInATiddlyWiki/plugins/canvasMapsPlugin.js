/***
|''Name:''|canvasMapsPlugin |
|''Description:''|A psd-patented "Quick Win" to hack JDLR's canvasMaps.js into TiddlyWiki |
|''Author:''|JonathanLister |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/canvasMapsPlugin.js |
|''Version:''|0.0.1 |
|''Date:''|4/11/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|

NB: This assumes canvasMaps.js has been included in the postjs!

***/

//{{{
if(!version.extensions.canvasMapsPlugin) {
version.extensions.canvasMapsPlugin = {installed:true};

var head = document.getElementsByTagName("head")[0];
var s1 = document.createElement("script");
var s2 = document.createElement("script");
s1.src = "../../../JonRobson/plugins/WorldMaps/canvasMaps.js";
s2.src = "http://www.osmosoft.com/ILGA/demos/ieHack.js";
head.appendChild(s1);
head.appendChild(s2);

config.macros.canvasMaps = {};

config.macros.canvasMaps.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	if(!window.EasyMap) {
		var that = this;
		var args = arguments;
		var func = function() {
			config.macros.canvasMaps.handler.apply(that,args);
		};
		window.setTimeout(func,300);
	} else {
		var wrapper = createTiddlyElement(place,"div","wrapper","wrapper");
		var statustext = createTiddlyElement(wrapper,"div","wrapper_statustext");
		createTiddlyText(statustext,"loading... please wait a little while!");
		var caption = createTiddlyElement(place,"div","caption","caption");
		var eMap = new EasyMap('wrapper','http://www.osmosoft.com/ILGA/demos/spacer.gif'); // 2nd argument not in EasyMap yet
		eMap.addControl('pan');
		eMap.scale.x = 2.2;
		eMap.scale.y = 2.2;
		
		var that = eMap;
		var myElement = document.getElementById('caption');
		eMap.mouseoverHandler = function(e,shape){
			that.oldcolor = shape.fillStyle;
			that.oldstrokecolor = shape.strokeStyle;
			shape.fillStyle = "#FFFFFF";
			shape.strokeStyle = "#FFFFFF";
			var el = myElement;
			var legal = "";
			if(shape.properties.legality == 1) legal = " (legal)";
			else if(shape.properties.legality == 0) legal = " (illegal)";
			else legal = " (no data)";
			el.innerHTML = shape.tooltip + legal;
			that.redrawShape(shape);
		};
	
		eMap.mouseoutHandler = function(e,shape){
			shape.fillStyle = that.oldcolor;
			shape.strokeStyle = that.oldstrokecolor;
			that.redrawShape(shape);
		};
	
		eMap.clickHandler = function(e,shape){
			var tiddlerElem = story.findContainingTiddler(e.target);
			var country = shape.tooltip;
			if(!store.tiddlerExists(country)) {
				var tags = "country";
				var text = "We don't have any information about this country yet! Please edit to add some or leave a comment.";
				var userName = config.options.txtUserName ? config.options.txtUserName : "guest";
				store.saveTiddler(country,country,text,userName,new Date(),tags);
			}
			story.displayTiddler(tiddlerElem,country);
		};
		
		eMap.drawFromGeojsonFile('http://www.osmosoft.com/ILGA/demos/whereLegal.json');
	}
};

} //# end of 'install only once'
//}}}
