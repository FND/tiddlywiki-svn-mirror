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

config.macros.canvasMaps = {};

config.macros.geoto = {};
config.macros.canvasMaps.getCoreGeoJson = function(){
	
	var data = store.getTiddlerText('GeojsonCoreData');
	
	
	if(data) {
		data = eval(data);
	}
	else
 		data = geojson;


	
	//look for any changes in meta data
	//coming soon
	
	//add geotags
 	store.forEachTiddler(function(title,tiddler) {
		var tags = tiddler.tags;
		var longc, latc;
		for(var i=0; i < tags.length; i++){
			var tag =tags[i];
			if(tag.indexOf('long:') == 0){
				longc = parseFloat(tag.substring(5));
			}
			else if(tag.indexOf('lat:') == 0)
					latc = parseFloat(tag.substring(4));
		}
		
		if(longc && latc){
			var geotagfeature = {type: "feature", geometry:{type: "point", coordinates:[longc,latc]}, properties:{name: title}};
			data.features.push(geotagfeature); //add the tagging feature
		}
	}	
	);
	
	return data;
};

config.macros.canvasMaps.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	// horrible hacked method to make sure excanvas has loaded - this should not be in this plugin

	if (!document.createElement('canvas').getContext && !window.G_vmlCanvasManager) {
		//alert('not loaded');
		var that = this;
		var args = arguments;
		var func = function() {
			config.macros.canvasMaps.handler.apply(that,args);
		};
		return window.setTimeout(func,300);
	} else {
		var wrapper = createTiddlyElement(place,"div","wrapper","wrapper");
		var statustext = createTiddlyElement(wrapper,"div","wrapper_statustext");
		createTiddlyText(statustext,"loading... please wait a little while!");
		var caption = createTiddlyElement(place,"div","caption","caption");
		var eMap = new EasyMap('wrapper');
		eMap.addControl('pan');
		eMap.addControl('zoom');
		
		var that = eMap;
		var myElement = document.getElementById('caption');
		
	
		eMap.clickHandler = function(e){
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
				console.log(shape.properties);
				store.saveTiddler(country,country,text,userName,new Date(),tags);
			}
			var tiddlerElem = story.findContainingTiddler(resolveTarget(e));
			story.displayTiddler(tiddlerElem,country);
			return false;
		};

		
		var geodata = this.getCoreGeoJson();
		eMap.drawFromGeojson(geodata);
		
	}
};

} //# end of 'install only once'
//}}}
