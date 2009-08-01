/***
11/02/09 GOOGLE STATIC MAPS currently broken

|''Name:''|geoPlugin |
|''Description:''|An attempt to bring nice easy to use maps to tiddlywiki using geojson|
|''Author:''|JonRobson and JonathanLister |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/verticals/GeoTiddlyWiki|
|''Version:''|0.7 |
|''Date:''|4/11/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|
|''Dependencies:''|This plugin requires a tiddler geojson containing geojson data eg.[[geojson]] and [[the VismoLibraryPlugin]]|
|''Usage:''|

macro {{{<<geo>>}}}
parameters are..
source {false|<tiddlername containing geodata and tagged with format>}
usetiddlermetadata {false|true}
geotagging {false|true}
id {<identifier name of the map>}
projection {google|googlestaticmap|globe|spinnyglobe} leave empty for normal projection

macro {{{<<geogoto {longitude} {latitude} {zoomLevel} {geo id}>>}}}

|''To Do:''|
easier navigation around map and searching in map (search bar)
caching of saved places

a map selector that shows all available maps in the geotiddlywiki: all tagged ['geojson','georss'] -> drop down, on change clear memory,draw
better editing:
merge function: merge countries to become one shape
geo can read from list of tiddlers with features associated

!Credits
http://spatialreference.org/ref/sr-org/google-projection/ for help with google projection hack
***/


//{{{
	
if(!version){
	version = {extensions:{}};
}
if(!config){
	config = {macros:{}};
}
function getElementChild(el,tag){
	var att = el.childNodes;
	for(var j=0; j <att.length;j++){			
		if(att[j].tagName == tag) return att[j];
	}
	return false;
	
}

	var geomaps = {};
	var numgeomaps = 0;
	
	

	setStylesheet(".easyController_crosshair{} .wrapper {border:1px solid; background-color:#AFDCEC;} .easymaptooltip {border:1px solid;background-color: rgb(255,255,255)}",'geo');
	
	version.extensions.geoPlugin = {installed:true};

	config.macros.geoeditor = {};

	config.macros.geo={
		getMap: function(id){
			return geomaps[id];
		}

        	,addGeoTiddler: function(easyMap,name,ll,fill,text,tags){
        		if(!tags) var tags = [];
        		if(text) var text = "";
        		var fields= {longitude:ll.longitude,latitude:ll.latitude,fill:"#000000"};
        		if(fill) fields.fill = fill;

        		store.saveTiddler(name,name,text,null,new Date(),tags,fields);

        		var tag =GeoTag(ll.longitude,ll.latitude,{name: name,fill: fields.fill});
        		easyMap.drawGeoJsonFeature(tag);
        		easyMap.redraw();	
        	}
		,handler: function(place,macroName,params,wikifier,paramString,tiddler) {
					
			 var prms = paramString.parseParams(null, null, true);
			 var fill = getParam(prms,"fill");

			var editable = eval(getParam(prms,"editable"));
			var that = this;
			var eMap = this.createNewVismoMap(place,prms);
		
	
			var source = getParam(prms,"source");

			var geodata = this.getGeoJson(source,eMap,prms);
			if(geodata == 'svgfile'){
				var callback = function(status,params,responseText,url,xhr){
					var svg = responseText;
					eMap.drawFromGeojson(VismoConversion.svgToGeoJson(svg,eMap.canvas));	
				};
				VismoFileUtils.loadRemoteFile(source,callback);	
			}
			else {	
				eMap.drawFromGeojson(geodata);
			}


			//}
		}	

		,getGeoJson: function(sourceTiddlerName,easyMap,parameters){
			if(sourceTiddlerName == undefined) sourceTiddlerName ='geojson';
			
			var data;
			if(!sourceTiddlerName || sourceTiddlerName == 'false'){
				data = {};
				data.type = "FeatureCollection";
				data.features = [];
			}
			else{
				if(sourceTiddlerName.indexOf('.svg') > -1){
					//svg file.
					return "svgfile";
				}
				else{
					var sourceTiddler = store.getTiddler(sourceTiddlerName);
					if(!sourceTiddler) return {};
					data = sourceTiddler.text;
				}
			}
			if(data.features){
				//good format!
			}
			else if(data.indexOf("({") == 0) {
				data = eval(data);
			}
			else if(sourceTiddler.tags.contains("kml")){
				data = VismoConversion.kmlToGeoJson(data);
			}
			else if(sourceTiddler.tags.contains("georss")){
				data = VismoConversion.geoRssToGeoJson(data);
			}
			else if(sourceTiddler.tags.contains("svg")){
				data = VismoConversion.svgToGeoJson(data,easyMap.wrapper);
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
		

		,createNewVismoMap: function(place,prms){
			var geoid = getParam(prms,"id");
			if(!geoid) geoid = "default" + numgeomaps;
			numgeomaps +=1;

			
			var id = "geo_"+geoid;

			var wrapper = createTiddlyElement(place,"div",id,"wrapper");
			wrapper.style.position = "relative";
		
			if(getParam(prms,"width")){
				var width = getParam(prms,"width");
			
				if(width.indexOf("%") == -1 && width.indexOf("px") == -1){
					width += "px";
				}
				wrapper.style.width = width;
			}
			if(getParam(prms,"height")){
				var height = getParam(prms,"height");
				if(height.indexOf("%") == -1 && height.indexOf("px") == -1)
					height += "px";
				wrapper.style.height = height;		
			}
			var proj = getParam(prms,"projection");
			var statustext = createTiddlyElement(wrapper,"div",id+"_statustext");
			createTiddlyText(statustext,"loading... please wait a little while!");
			var caption = createTiddlyElement(place,"div","caption","caption");
				var onmup = function(e,shape,mouse,longitude_latitude,feature){	

    				if(shape &&shape.properties){

    					var shapeName = shape.getProperty("name");
    				}
    				else{

    				        //add new geotag
    				        var ll = longitude_latitude;
    				        if(ll)that.addGeoTiddler(eMap,"GeoTag (long:"+ ll.longitude + ",lat:" + ll.latitude+ ")",ll,fill,"",["geotagged"])
    					return;
    				}
    				if(!store.tiddlerExists(shapeName)) {
    					var tags = [];
    					var text = "";
    					var fields = {};

    				}
    				var tiddlerElem = null;
    				try{
    					tiddlerElem = story.findContainingTiddler(resolveTarget(e));	
    				}
    				catch(e){

    				}

    				story.displayTiddler(tiddlerElem,shapeName);
    				return false;
    			};

      
                
			var eMap = new VismoMap(wrapper,{dblclick:onmup,projection:proj,tooltip:true});			
			geomaps[geoid] = eMap;
			var that = eMap;
			var myElement = document.getElementById('caption');
			return eMap;
		}
	};
	

	config.macros.geogotobutton = {
		handler: function(place,macroName,params,wikifier,paramString,tiddler){	
			var lo,la,zoom,id;
			if(tiddler && tiddler.fields)lo = tiddler.fields.longitude;
			if(tiddler && tiddler.fields)la = tiddler.fields.latitude;
		
			if(params[1]) lo =params[1];
			if(params[2])la =params[2];
			//zoom = 512;
			if(!params[0]){return;}
			id = params[0];
			var handler = function(){
				if(!geomaps[id]){
					alert("Looks like you don't have a map called " + id + " please modify your ViewTemplate for this to work.")
				}
				else{
				
					geomaps[id].moveTo(lo,la,zoom);
				}
			
			}
		
			if(lo && la){
				createTiddlyButton(place,"go here", "jump to longitude:" + lo + ", latitude:"+la, handler);
			}
		
		}
	};
	config.macros.geogoto = {/*zoom should be 1,2,4,8,16,32..*/
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			var prms = paramString.parseParams(null, null, true);

			var id = getParam(prms,"id");
			if(!params[3]) id = 'default0';

			if(!geomaps[id]) {
			throw "exception in geogoto - map with id '"+ id+"' doesn't exist in page";
			}
			else{

				var lo, la,zoom;
				var lo = getParam(prms,"longitude");
				var la = getParam(prms,"latitude");
				var zoom;
				if(getParam(prms,"zoom")){
					zoom = getParam(prms,"zoom");		 
				}
				geomaps[id].moveTo(lo,la,zoom);
			}

		}
	};

//}}}
	
	
