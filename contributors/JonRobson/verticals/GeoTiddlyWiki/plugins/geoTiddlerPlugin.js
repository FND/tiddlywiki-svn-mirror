/***
|''Name:''|geoPlugin |
|''Description:''|An attempt to bring nice easy to use maps to tiddlywiki using geojson|
|''Author:''|JonRobson and JonathanLister |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/verticals/GeoTiddlyWiki|
|''Version:''|0.0.5 |
|''Date:''|4/11/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|
|''Dependencies:''|This plugin requires a tiddler geojson containing geojson data eg.[[geojson]]|
|''Usage:''|
parameters
source
usetiddlermetadata
geotagging
todo..
map selector: all tagged ['geojson','georss'] -> drop down, on change clear memory,draw
merge function: merge countries to become one shape
geo can read from list of tiddlers with features associated
***/


//{{{
if(!version.extensions.geoPlugin) {
	setStylesheet(".wrapper {border:1px solid} .easymaptooltip {border:1px solid;background-color: rgb(255,255,255)}",'geo');
	
	version.extensions.geoPlugin = {installed:true};

	config.macros.geoeditor = {};
	
	config.macros.geo={	
		
		convertSourceToGeoJsonFormat: function(sourcetiddler){
	
		}
		,getGeoJson: function(sourceTiddlerName,easyMap,parameters){
			if(!sourceTiddlerName) sourceTiddlerName ='geojson';
			if(sourceTiddlerName.indexOf('.svg') > -1){
				//svg file.
				return "svgfile";
			}
			else{
				var sourceTiddler = store.getTiddler(sourceTiddlerName);
				if(!sourceTiddler) return {};
				var data = sourceTiddler.text;
			}
		
			if(data.indexOf("({") == 0) {
				data = eval(data);
			}
			else if(sourceTiddler.tags.contains("georss")){
				data = EasyConversion.geoRssToGeoJson(data);
			}
			else if(sourceTiddler.tags.contains("svg")){
				data = EasyConversion.svgToGeoJson(data,easyMap.wrapper);
			}
			else{
				data = {};
				alert("please define some valid data (eg. geojson or georss) in tiddler '"+sourceTiddler +"'. If data is valid but is not a geojson make sure it is tagged with either 'georss' or 'svg' depending which format it is in.")
			}
		
			//look for any overriding changes from the meta data
			var usetiddlermetadata = true;
			if(getParam(parameters,"usetiddlermetadata")){
				usetiddlermetadata = eval(getParam(parameters,"usetiddlermetadata"));
			}
			if(usetiddlermetadata){
				var features = data.features;
				for(var i=0; i < features.length; i++){
					var geometry = features[i].geometry;
					var properties = features[i].properties;
					var name = properties.name;
					var tiddler = store.getTiddler(name);
		
					if(tiddler){
						var newprop = {};
						newprop.name = name;
						
						if(tiddler.fields.geofeature && tiddler.fields.geofeature != ""){
							try{
								var newfeature= eval(tiddler.fields.geofeature);
								features[i] = newfeature;
								
								}
							catch(e){
								console.log("invalid feature metadata set in tiddler " + name + "("+e+")");
							}
						}
						if(tiddler.fields.fill){
							newprop.fill = tiddler.fields.fill;
						}
						/*
						else if(! tiddler.fields.fill && properties.fill){ //if nothing there in tiddler update
							tiddler.fields.fill = properties.fill;
						}*/
					

					

						features[i].properties = newprop;				
					}
				}
			}
			//tiddler.geoproperties
			//add geotags
			data = this.geotag(data,parameters);
			return data;
		}
		/*
		takes geotagging parameter 
		if false no geotags added
		if empty all geotags loaded
		if a list of tiddlers given only the tags associated with that data will be added
		*/
		,geotag: function(geojson,parameters){
			if(getParam(parameters,"geotagging")){
				var geo = eval(getParam(parameters,"geotagging"));
				if(typeof geo == 'boolean' && !geo) return geojson;
				//else if(typeof geo == 'object') subset
			}
			
			var data = geojson;
			var hidegeotiddlerdata = getParam(parameters,"hidegeotiddlerdata")
			
			if(!hidegeotiddlerdata){
		 		store.forEachTiddler(function(title,tiddler) {
					//add geotags
					var longc,latc,fill;
					if(tiddler.fields.geo){
						var latlong =tiddler.fields.geo;
						latlong = latlong.replace(" ","");
						var ll = latlong.split(";");
						longc =parseFloat(ll[1]);
						latc =parseFloat(ll[0]);

					}
					if(tiddler.fields.longitude && tiddler.fields.latitude){
						longc =parseFloat(tiddler.fields.longitude);
						latc =parseFloat(tiddler.fields.latitude);
					}
			
					if(tiddler.fields.fill){
						fill = tiddler.fields.fill;
					}
					else{
						fill = "#ff0000";
					}
					if(longc && latc){
						var prop = {name: title,fill:fill};
						var geotagfeature = new GeoTag(longc,latc,prop);
						data.features.push(geotagfeature); //add the tagging feature
					}
				}	
				);
			}
			return data;
		}
		
	
		,addEasyMapControls: function(eMap,prms){
			if(getParam(prms,"spherify")) {
				eMap.spherical = true;
				if(getParam(prms,"spherify") == "andspin"){
					var f = function(){
						var t = eMap.controller.transformation;
						if(!t.rotate) t.rotate = {};
						if(!t.rotate.z) t.rotate.z  = 0;
						
						t.rotate.z += 0.05;
						eMap.controller.setTransformation(t);
						window.setTimeout(f,50);
					};
					f();
				}
				eMap.controller.addControl("rotation");
			 }
			else{
				eMap.controller.addControl('pan');
			}

			eMap.controller.addControl('zoom');
			eMap.controller.addControl("mousepanning");
			eMap.controller.addControl("mousewheelzooming");
		}
		,addEasyMapClickFunction: function(easyMap,clickFunction){
		
			easyMap.wrapper.onmouseup = clickFunction;
		
		}
		,createNewEasyMap: function(place,prms){
			var geoid = getParam(prms,"id");
			if(!geoid) geoid = "default" + numgeomaps;
			numgeomaps +=1;

			var id = "geo_"+geoid;

			var wrapper = createTiddlyElement(place,"div",id,"wrapper");
			wrapper.style.position = "relative";
			if(getParam(prms,"width")){
				var width = getParam(prms,"width");
				if(width.indexOf("%") == -1 && width.indexOf("px") == -1)
					width += "px";
				wrapper.style.width = width;
			}
			if(getParam(prms,"height")){
				var height = getParam(prms,"height");
				if(height.indexOf("%") == -1 && height.indexOf("px") == -1)
					height += "px";
				wrapper.style.height = height;		
			}

			var statustext = createTiddlyElement(wrapper,"div",id+"_statustext");
			createTiddlyText(statustext,"loading... please wait a little while!");
			var caption = createTiddlyElement(place,"div","caption","caption");

			var eMap = new EasyMap(wrapper);
			geomaps[geoid] = eMap;



			var that = eMap;
			var myElement = document.getElementById('caption');


			return eMap;
		}
	};
	
	
	function getElementChild(el,tag){
		var att = el.childNodes;
		for(var j=0; j <att.length;j++){			
			if(att[j].tagName == tag) return att[j];
		}
		return false;
		
	}
	
	var geomaps = {};
	var numgeomaps = 0;
	
	config.macros.geogoto = {};
	config.macros.geogoto.handler= function(place,macroName,params,wikifier,paramString,tiddler) {
		var id = params[3];
		if(!params[3]) id = 'default0';
		
		if(!geomaps[id]) {alert("geogoto can only be used if it can find a geo mqp try putting an id as third parameter which points to a map currently visible on the screen.");}
		var lo, la,zoom;
		if(params[0]) lo = parseFloat(params[0]);
		if(params[1]) la = parseFloat(params[1]);
		if(params[2]) zoom = parseFloat(params[2]);		 
		var tran = geomaps[id].controller.transformation;
		if(lo) tran.translate.x = -la;
		if(la) tran.translate.y = lo;
		if(zoom){ tran.scale.x = zoom;tran.scale.y = zoom;}
		geomaps[id].controller.setTransformation(tran);
	}
	
	config.macros.geo.handler = function(place,macroName,params,wikifier,paramString,tiddler) {				
		 
			var prms = paramString.parseParams(null, null, true);

			
			var onmup = function(e,shape,mouse,longitude_latitude,feature){								
				if(shape &&shape.properties){
					var shapeName = shape.properties.name;
				}
				else{
					return;
				}
				if(!store.tiddlerExists(shapeName)) {
					var tags = [];
					var text = "";
					var fields = {};
				
					/*
					if(shape.properties.text) text = shape.properties.text;
					if(shape.properties.tags) tags = shape.properties.tags;
					if(shape.properties.fill) fields.fill = shape.properties.fill;
					var name =shape.properties.name;
					var userName = config.options.txtUserName ? config.options.txtUserName : "guest";

					store.saveTiddler(shapeName,shapeName,text,userName,new Date(),tags,fields);
					*/
	
				}
				var tiddlerElem = null;
				//tiddlerElem = story.findContainingTiddler(resolveTarget(e));
				
				

				story.displayTiddler(tiddlerElem,shapeName);
				return false;
			};			
			var eMap = this.createNewEasyMap(place,prms);
			eMap.setMouseFunctions(onmup,false);
			
			this.addEasyMapControls(eMap,prms);
	
			var source = getParam(prms,"source");

			var geodata = this.getGeoJson(source,eMap,prms);
			if(geodata == 'svgfile'){
				var callback = function(status,params,responseText,url,xhr){
					var svg = responseText;
					eMap.drawFromGeojson(EasyConversion.svgToGeoJson(svg,eMap.canvas));	
				};
				EasyFileUtils.loadRemoteFile(source,callback);	
			}
			else {	
				eMap.drawFromGeojson(geodata);
			}

			
		//}
	};


} //# end of 'install only once'
//}}}

