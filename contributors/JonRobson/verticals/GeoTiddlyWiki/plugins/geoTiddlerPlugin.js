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
config.macros.canvasMaps.getCoreGeoJson = function(sourcetiddler){
	if(!sourcetiddler) sourcetiddler ='GeojsonCoreData';
	
	if(sourcetiddler.indexOf('.svg') > -1){
		//svg file.
		return "svgfile";
	}
	else{
		var source = store.getTiddler(sourcetiddler);
		if(!source) return {};
		var data = source.text;
	}

	
	if(data.indexOf("({") == 0) {
		data = eval(data);
	}
	else if(source.tags.contains("svg")){
		return "svg";
	}
	else{
		data = {};
		alert("please define a geojson in tiddler '"+sourcetiddler +"'")
	}

	
	//look for any changes in meta data
	//coming soon
	
	var features = data.features;
	for(var i=0; i < features.length; i++){
		var name = features[i].properties.name;
		var tiddler = store.getTiddler(name);
		
		if(tiddler){
			if(tiddler.fields.geoproperties){

				try{
					var newp = eval("("+tiddler.fields.geoproperties+")");
					console.log(features[i].properties,newp);

					features[i].properties = newp;
				}
				catch(e){
					alert("invalid geo meta data set for tiddler " + name + " exception:" + e);
				}

			}
		}
	}
	
	//tiddler.geoproperties
	//add geotags
 	store.forEachTiddler(function(title,tiddler) {
		//add geotags
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
/*
	if (!document.createElement('canvas').getContext && !window.G_vmlCanvasManager) {
		//alert('not loaded');
		var that = this;
		var args = arguments;
		var func = function() {
			config.macros.canvasMaps.handler.apply(that,args);
		};
		return window.setTimeout(func,300);
	} else {
		*/
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
				
				var geometa = {};
				
				shape.properties.toSource(); //no ie support for this!
				
				var fields = {};
				fields.geoproperties = geometa;
				store.saveTiddler(country,country,text,userName,new Date(),tags,fields);
			}
			var tiddlerElem = story.findContainingTiddler(resolveTarget(e));
			story.displayTiddler(tiddlerElem,country);
			return false;
		};

		
		var prms = paramString.parseParams(null, null, true);
		var source = null;
		if(getParam(prms,"source")) source = getParam(prms,"source");
		

		
		var latitude = 0, longitude = 0, zoom = 1;
		if(getParam(prms,"zoom")) zoom = getParam(prms,"zoom");
		if(getParam(prms,"long")) longitude = getParam(prms,"long");
		if(getParam(prms,"lat")) latitude = getParam(prms,"lat");
		var t ={'scale':{'x':zoom, 'y': zoom}, 'translate': {'x': longitude, 'y':latitude}};
		//var t = {'translate':{x:0,y:0}, 'scale': {x:1, y:1}};	
		eMap.controller.setTransformation(t);
		var geodata = this.getCoreGeoJson(source);
		
		if(geodata == 'svg'){
			eMap.drawFromSVG(store.getTiddlerText(source));
		}
		else if(geodata == 'svgfile'){
			eMap.drawFromSVGFile(source);
		}
		else
			eMap.drawFromGeojson(geodata);
		

		
				
	//}
};

} //# end of 'install only once'
//}}}
