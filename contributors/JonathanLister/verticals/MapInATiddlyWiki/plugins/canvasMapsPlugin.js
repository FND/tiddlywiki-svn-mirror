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

NB: This assumes canvasMaps3D.js has been included in the postjs!

***/

//{{{
if(!version.extensions.canvasMapsPlugin) {
version.extensions.canvasMapsPlugin = {installed:true};

var head = document.getElementsByTagName("head")[0];
var s1 = document.createElement("script");
var s2 = document.createElement("script");
var s3 = document.createElement("script");
var s4 = document.createElement("script");
s1.src = "http://osmosoft.com/ILGA/demos/canvasMaps3D.js";
s2.src = "http://osmosoft.com/ILGA/demos/iehack.js";
s3.src = "http://osmosoft.com/ILGA/demos/jquery.js";
s4.src = "http://osmosoft.com/ILGA/demos/whereLegal.js";
//s1.src = "../../../JonRobson/plugins/WorldMaps/canvasMaps3D.js"
//s2.src = "../../../JonRobson/plugins/WorldMaps/ieHack.js";
//s3.src = "../../../JonRobson/plugins/WorldMaps/jquery.js";
//s4.src = "../../../JonRobson/plugins/WorldMaps/whereLegal.js";
head.appendChild(s1);
head.appendChild(s2);
head.appendChild(s3);
head.appendChild(s4);
config.macros.canvasMaps = {};

config.macros.canvasMaps.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	// horrible hacked method to make sure excanvas has loaded - this should not be in this plugin
	if ((!document.createElement('canvas').getContext && !window.G_vmlCanvasManager) || !window.EasyMap || !window.geojson) {
		console.log('not loaded');
		var that = this;
		var args = arguments;
		var func = function() {
			config.macros.canvasMaps.handler.apply(that,args);
		};
		return window.setTimeout(func,300);
	} else {
		console.log('loaded');
		var wrapper = createTiddlyElement(place,"div","wrapper");
		wrapper.style.width = "800px";
		wrapper.style.height = "400px";
		wrapper.style.position = "relative";
		var caption = createTiddlyElement(wrapper,"div","caption");
		var statustext = createTiddlyElement(wrapper,"div","wrapper_statustext");
		createTiddlyText(statustext,"loading... please wait a little while!");
		var eMap = new EasyMap('wrapper');
		eMap.addControl('pan');
		eMap.addControl('zoom');
		//eMap.scale.x = 1.8;
		//eMap.scale.y = 1.8;
		//eMap.translate.x = 1;
		
		var that = eMap;
		var myElement = document.getElementById('caption');
		
	
		/*eMap.clickHandler = function(e){
			if(!e) {
				e = window.event;
			}
			var shape = eMap.utils.getShapeAtClick(e);
			if(!shape) {
				return false;
			}
			var country = shape.properties.name;
			if(!store.tiddlerExists(country)) {
				var tags = "country";
				var text = "We don't have any information about this country yet! Please edit to add some or leave a comment.";
				var userName = config.options.txtUserName ? config.options.txtUserName : "guest";
				store.saveTiddler(country,country,text,userName,new Date(),tags);
			}
			var tiddlerElem = story.findContainingTiddler(resolveTarget(e));
			story.displayTiddler(tiddlerElem,country);
			return false;
		};*/
		eMap.clickHandler = function(e){

			var s = eMap.utils.getShapeAtClick(e);
			
			if(s)
				alert(s.properties.name);
		};
		
		// geojson var from whereLegal.js
		eMap.drawFromGeojson(geojson);
	}
};

} //# end of 'install only once'
//}}}
