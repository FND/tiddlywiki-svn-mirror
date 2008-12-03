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
	setStylesheet(".wrapper {border:1px solid} .easymaptooltip {border:1px solid;background-color: rgb(255,255,255)}",'canvasmaps');
	
	version.extensions.canvasMapsPlugin = {installed:true};

	config.macros.canvasMaps = {};

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

		var features = data.features;
		for(var i=0; i < features.length; i++){
			var name = features[i].properties.name;
			var tiddler = store.getTiddler(name);
	
			if(tiddler){
				var newprop = {};
				newprop.name = name;
				if(tiddler.fields.fill){
					newprop.fill = tiddler.fields.fill;
				}
				else
					newprop.fill = "";

				features[i].properties = newprop;
				
				
			}
		}


		//tiddler.geoproperties
		//add geotags
	 	store.forEachTiddler(function(title,tiddler) {
			//add geotags
			if(tiddler.fields.geo){
				var latlong =tiddler.fields.geo;
				latlong = latlong.replace(" ","");
				var ll = latlong.split(";");
				var longc =parseFloat(ll[1]);
				var latc =parseFloat(ll[0]);
				var geotagfeature = {type: "feature", geometry:{type: "point", coordinates:[longc,latc]}, properties:{name: title,fill:""}};
				data.features.push(geotagfeature); //add the tagging feature
			}
		}	
		);
		return data;
	};
	
	
	function getElementChild(el,tag){
		var att = el.childNodes;
		for(var j=0; j <att.length;j++){			
			if(att[j].tagName == tag) return att[j];
		}
		return false;
		
	}
	
	var geomaps = {};
	config.macros.canvasMaps.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
			if(version.extensions.canvasMapsPlugin.num)
				version.extensions.canvasMapsPlugin.num += 1;
			else
				version.extensions.canvasMapsPlugin.num = 1;
				
			var prms = paramString.parseParams(null, null, true);

			var id = "wrapper"+version.extensions.canvasMapsPlugin.num;
			var wrapper = createTiddlyElement(place,"div",id,"wrapper");
			wrapper.style.position = "relative";
			if(getParam(prms,"width"))wrapper.style.width = getParam(prms,"width")+"px";
			if(getParam(prms,"height"))wrapper.style.height = getParam(prms,"height")+"px";		
			var statustext = createTiddlyElement(wrapper,"div",id+"_statustext");
			createTiddlyText(statustext,"loading... please wait a little while!");
			var caption = createTiddlyElement(place,"div","caption","caption");

			var eMap = new EasyMap(wrapper);
			geomaps[version.extensions.canvasMapsPlugin.num] = eMap;			

			var that = eMap;
			var myElement = document.getElementById('caption');

			eMap.canvas.onmouseup = function(e){
				if(!e) {
					e = window.event;
				}
				var shape = eMap.utils.getShapeAtClick(e);
				
				if(!shape) {
					return false;
				}
				var shapeName = shape.properties.name;
				if(!store.tiddlerExists(shape)) {
					var tags = [];
					var text = "";
					var fields = {};
					
					if(shape.properties.text) text = shape.properties.text;
					if(shape.properties.tags) tags = shape.properties.tags;
					var name =shape.properties.name;
					var userName = config.options.txtUserName ? config.options.txtUserName : "guest";

					fields.fillStyle = shape.properties.fillStyle;
					store.saveTiddler(shapeName,shapeName,text,userName,new Date(),tags,fields);
				}
				var tiddlerElem = story.findContainingTiddler(resolveTarget(e));
				story.displayTiddler(tiddlerElem,shapeName);
				return false;
			};

			eMap.addControl('pan');
			eMap.addControl('zoom');
			console.log(config.browser.isIE);
			if(!config.browser.isIE){
				eMap.addControl("mousepanning");
				eMap.addControl("mousewheelzooming");	
			}	
			var source = null;
			if(getParam(prms,"source")) source = getParam(prms,"source");
	

	
			var latitude = 0, longitude = 0, zoom = 1;
			if(getParam(prms,"zoom")) zoom = getParam(prms,"zoom");
			if(getParam(prms,"long")) longitude = getParam(prms,"long");
			if(getParam(prms,"lat")) latitude = getParam(prms,"lat");
			var t ={'scale':{'x':zoom, 'y': zoom}, 'translate': {'x': longitude, 'y':latitude}};
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
