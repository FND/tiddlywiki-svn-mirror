/***
|''Name:''|geoPlugin |
|''Description:''|An attempt to bring nice easy to use maps to tiddlywiki using geojson|
|''Author:''|JonRobson and JonathanLister |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/verticals/GeoTiddlyWiki|
|''Version:''|0.7 |
|''Date:''|4/11/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|
|''Dependencies:''|This plugin requires a tiddler geojson containing geojson data eg.[[geojson]]|
|''Usage:''|

macro <<geo>>
parameters are..
source {false|<tiddlername containing geodata and tagged with format>}
usetiddlermetadata {false|true}
geotagging {false|true}
id {<identifier name of the map>}
projection {google|googlestaticmap|globe|spinnyglobe} leave empty for normal projection

macro <<geogoto {longitude} {latitude} {zoomLevel} {geo id}>>

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
if(!version.extensions.geoPlugin) {
	setStylesheet(".wrapper {border:1px solid} .easymaptooltip {border:1px solid;background-color: rgb(255,255,255)}",'geo');
	
	version.extensions.geoPlugin = {installed:true};

	config.macros.geoeditor = {};
	
	config.macros.geo={
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {				
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
		}	
		,getGoogleMercatorProjection: function(){
			
			var p = {};
			p.googleHack = 0.000006378137;
			p.source = new Proj4js.Proj('WGS84');//
			p.dest = new Proj4js.Proj('GOOGLE');
			p.resultCache = {};
			p.inversexy = function(x,y){
				x /= this.googleHack;
				y /= this.googleHack;
				var pointSource = new Proj4js.Point(x ,y);
				var pointDest = Proj4js.transform(p.dest,p.source, pointSource);

				return pointDest;
			}

			p.xy = function(x,y){
					if(this.resultCache[x+"|"+y]) return this.resultCache[x+"|"+y];
					var pointSource = new Proj4js.Point(x,y);
					var pointDest = Proj4js.transform(p.source,p.dest, pointSource);


					var newx =pointDest.x;
					var newy = pointDest.y;
					//newx /= Math.pow(2,17);
					//newy /=Math.pow(2,17);
					//19 zoom levels in google
					//console.log(newx,newy);
					newx *= this.googleHack;
					newy *= this.googleHack;
					
					this.resultCache[x+"|"+y] = {x:newx , y:newy};
					return this.resultCache[x+"|"+y];
					
			}
			return p;
		}
		
		,setupGoogleStaticMapLayer: function(eMap){
			var that = this;
			eMap.settings.projection = this.getGoogleMercatorProjection();
			//eMap.settings.renderPolygonMode = false;
			eMap._fittocanvas = false;
			var s = {};
			eMap.settings.beforeTransform = function(transformation){
				//eMap.attachBackground("none");
				var x =0,y =0, t= transformation.translate,scale= transformation.scale;
			
				if(s._oldscale > scale.x){
					s._googlezoomer -= 1;
				
				}
				else if(s._oldscale < scale.x){
					s._googlezoomer += 1;
					
				}
				else if(!s._oldscale){
					s._googlezoomer = 1;
				
				}
	
				var res = eMap.settings.projection.inversexy(t.x,t.y);
				x = -res.x;
				y = res.y;


				var zoomL = s._googlezoomer;

				var w = parseInt(eMap.wrapper.style.width);
				var h = parseInt(eMap.wrapper.style.height);
				var gsmPath ="gsm/"+w+"X"+h+"/"+zoomL+"/"+y+"_"+x+".gif";
				var gsmURL ="http://maps.google.com/staticmap?center="+y+","+x+"&zoom="+zoomL+"&size="+w+"x"+h+"&key=YOUR_KEY_HERE";
				
		
				
				try{
					that.saveImageLocally(gsmURL,gsmPath,eMap);
				}
				catch(e){
					console.log("unable to cache static image for this map view. ("+e+")")
				}

				s._oldscale = scale.x;
				
			
			};

			var w = parseInt(eMap.wrapper.style.width);
			var h = parseInt(eMap.wrapper.style.height);
			
	
	
			try{
				that.saveImageLocally("http://maps.google.com/staticmap?center=0,0&zoom=0&size="+w+"x"+h+"&key=YOUR_KEY_HERE","gsm/"+w+"x"+h+"/0/0_0.gif",eMap);
			}
			catch(e){
				console.log("unable to cache static image for this map view. ("+e+")")
			}
			s._googlezoomer = 0;
		
		}
		,saveImageLocally: function(sourceurl,dest,eMap) {
			
			var localPath = getLocalPath(document.location.toString());
			var savePath;
			if((p = localPath.lastIndexOf("/")) != -1) {
				savePath = localPath.substr(0,p) + "/" + dest;
			} else {
				if((p = localPath.lastIndexOf("\\")) != -1) {
					savePath = localPath.substr(0,p) + "\\" + dest;
				} else {
					savePath = localPath + "." + dest;
				}
			}
			var applyBackground = function(){
				eMap.attachBackground(dest);
			}
			
			var onloadfromweb = function(status,params,responseText,url,xhr){
				console.log("loaded from web");	
				try{
					saveFile(savePath,responseText);
				}
				catch(e){
					console.log("error saving locally..");
				}
				//eMap.attachBackground(dest);
				window.setTimeout(applyBackground,0);
			};
			
			var onloadlocally = function(status,params,responseText,url,xhr){
			
				eMap.attachBackground(dest);
			};
			try{
				EasyFileUtils.loadRemoteFile(savePath,onloadlocally,null,null,null,null,null,null,true);
			}
			catch(e){//couldnt load probably doesn't exist!
				console.log("loading from web..");
				EasyFileUtils.loadRemoteFile(sourceurl,onloadfromweb,null,null,null,null,null,null,true);		
			}
			
			
		}
		
		,convertSourceToGeoJsonFormat: function(sourcetiddler){
	
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
			var proj = getParam(prms,"projection");
			if(proj == 'globe' || proj == 'spinnyglobe') {			
				eMap.spherical = true;
				eMap.controller.addControl("rotation");
				if(proj == 'spinnyglobe'){
					var f = function(){
						var t = eMap.controller.transformation;
						if(!t.rotate) t.rotate = {};
						if(!t.rotate.z) t.rotate.z  = 0;
					
						t.rotate.z += 0.5;
						eMap.controller.setTransformation(t);
						window.setTimeout(f,500);
					};
					f();
				}
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

			var statustext = createTiddlyElement(wrapper,"div",id+"_statustext");
			createTiddlyText(statustext,"loading... please wait a little while!");
			var caption = createTiddlyElement(place,"div","caption","caption");

			var eMap = new EasyMap(wrapper);
			var proj = getParam(prms,"projection");
			if(proj){
				if(proj == 'google'){
					eMap.settings.projection = this.getGoogleMercatorProjection();
				}
				else if(proj == 'googlestaticmap'){
					if(parseInt(wrapper.style.width)  > 640|| parseInt(wrapper.style.height) > 640){
						throw "Max resolution for using google static maps is 640 by 640 - your width or height is too big";
					}
					else{
						this.setupGoogleStaticMapLayer(eMap);
					}
				}
			}
			
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
		
		if(!geomaps[id]) {
		throw "exception in geogoto - map with id '"+ id+"' doesn't exist in page";
		}
		var lo, la,zoom;
		if(params[0]) lo = parseFloat(params[0]);
		if(params[1]) la = parseFloat(params[1]);
		if(params[2]) zoom = parseFloat(params[2]);		 

		geomaps[id].moveTo(la,lo,zoom);
	
	}
	


} //# end of 'install only once'
//}}}

