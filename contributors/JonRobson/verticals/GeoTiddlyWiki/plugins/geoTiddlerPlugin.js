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
		getMap: function(id){
			return geomaps[id];
		}
		,handler: function(place,macroName,params,wikifier,paramString,tiddler) {
					
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
		,getGoogleMercatorProjection: function(easymap){
			
			var p = {};
			p.googleHack = 1/((2 * Math.PI * 6378137) / parseInt(easymap.wrapper.style.width));
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

			p.calculatescalefactor= function(easymapscale,res){
				
				if(!res){ 
					if(easymapscale <= 1){
						return 0;
					}
					else{
						res = 0;
					}
				}
				
				if(easymapscale <= 1){
					return res;
				}
				else{
					var news = easymapscale / 2;
					res +=1 ;
					return this.calculatescalefactor(news,res);
				}
			};
			p.xy = function(x,y,t){
				
					if(this.resultCache[x+"|"+y]) {
						return this.resultCache[x+"|"+y];
					}
					var pointSource = new Proj4js.Point(x,y);
					var pointDest = Proj4js.transform(p.source,p.dest, pointSource);


					var newx =pointDest.x;
					var newy = pointDest.y;
					newx *= this.googleHack;
					newy *= this.googleHack;
					
					this.resultCache[x+"|"+y] = {x:newx , y:newy};
					return this.resultCache[x+"|"+y];
					
			}
			return p;
		}
		
		,setupGoogleStaticMapLayer: function(eMap){
			var that = this;
		
			eMap.settings.projection = this.getGoogleMercatorProjection(eMap);
			eMap._fittocanvas = false;
			var useLocalImage = function(dest){
				eMap.attachBackground(dest);
			};
			eMap.settings.beforeRender = function(transformation){
				

				//eMap.attachBackground("none");
				var x =0,y =0, t= transformation.translate,scale= transformation.scale;
			
				var okScales = [1,2,4,8,16,32,64,128,256,512,1024,2048, 4096, 8192,16384,32768];
				
				//if(!okScales.contains(scale.x)){ //cant work under these conditions!!!
					eMap.settings.backgroundimg = "none";
					eMap.wrapper.style.backgroundImage = "none";
				
					//return;
				//}
				var res = eMap.settings.projection.inversexy(t.x,t.y);
				x = -res.x;
				y = res.y;


				var zoomL = eMap.settings.projection.calculatescalefactor(scale.x);
				var w = parseInt(eMap.wrapper.style.width);
				var h = parseInt(eMap.wrapper.style.height);
				var gsmPath ="gsm/"+w+"X"+h+"/"+zoomL+"/"+y+"_"+x+".gif";
				var gsmURL ="http://maps.google.com/staticmap?center="+y+","+x+"&zoom="+zoomL+"&size="+w+"x"+h+"&key=YOUR_KEY_HERE";
				

				
				try{
					that.saveImageLocally(gsmURL,gsmPath,useLocalImage);
				}
				catch(e){
					console.log("unable to cache static image for this map view. ("+e+")")
				}

			
			
			};

			var w = parseInt(eMap.wrapper.style.width);
			var h = parseInt(eMap.wrapper.style.height);
			
	
	
			try{
				that.saveImageLocally("http://maps.google.com/staticmap?center=0,0&zoom=0&size="+w+"x"+h+"&key=YOUR_KEY_HERE","gsm/"+w+"x"+h+"/0/0_0.gif",useLocalImage);
			}
			catch(e){
				console.log("unable to cache static image for this map view. ("+e+")")
			}
			
		
		}
		,_createTiles: function(eMap,numtiles){
			//eMap.wrapper.style.overflow = "hidden";
			
			var res = {};
			
			var tiley =  - (parseInt(eMap.wrapper.style.height) /2);		
			var y= 0;
		
		
			var tiles = document.createElement("div");
			tiles.style.overflow = "hidden";
			tiles.style.position= "absolute";
			tiles.style.width = eMap.wrapper.style.width;
			tiles.style.height = eMap.wrapper.style.height;
			var maintile = document.createElement("div");
			maintile.style.position = "absolute";
			maintile.style.width = "256px";
			maintile.style.height = "256px";
			/*maintile.style.left = "0px";
			maintile.style.top = "0px";
			maintile.store = {};
			maintile.store.left= 0;
			maintile.store.top= 0;
			*/
			tiles.appendChild(maintile);
			for(var y = 0; y < numtiles; y++){
				var tilex = - (parseInt(eMap.wrapper.style.width) /2);
				for(var x = 0; x < numtiles; x++){
					var tile = document.createElement("div");
					tile.style.position = "absolute";
					tile.style.width = "256px";
					tile.style.height = "256px";
					tiles.appendChild(tile);
					res[x+"|"+y] = tile;
					tilex += 256; //size of a tile
				}
				tiley += 256;
			}
			
			eMap.wrapper.appendChild(tiles);
			
			res['main'] = maintile;
			return res;
			

			
		}
		,setupSlippyStaticMapLayer: function(eMap){
			/*Filename(url) format is /zoom/x/y.png */
			var projection = this.getGoogleMercatorProjection(eMap);
			eMap.settings.projection = projection;
			eMap._fittocanvas = false;
			var that = this;
			var tiles = this._createTiles(eMap,2);
			var eMap = eMap;

			
			eMap.settings.beforeRender = function(transformation){
				
				var zoomOut = false;
				if(eMap.settings.lastScale > transformation.scale.x)
					zoomOut = true;
				
				eMap.settings.lastScale = transformation.scale.x;
					//eMap.attachBackground("none");
					var x =0,y =0,lo,la, translate= transformation.translate,scale= transformation.scale;

					eMap.settings.backgroundimg = "none";
					eMap.wrapper.style.backgroundImage = "none";
					
					var zoomL = projection.calculatescalefactor(scale.x);
					
					
					var i;
					for(i in tiles){
						tiles[i].style.backgroundImage ="none";
					}
						
					var tile = tiles["main"];
				
					var left = (scale.x * translate.x) % 256;
					var top = (scale.y * translate.y) % 256;
					tile.style.top = top + "px";
					tile.style.left = left + "px";
					if(zoomL == 0){
							zoomL = 0;
							tilex = 0;tiley=0;
						var slippyurl ="http://tile.openstreetmap.org/"+zoomL +"/"+tilex+"/"+tiley+".png";
						var localurl = "slippy/"+zoomL+ "/"+ tilex + "/" + tiley + ".png";
						that.renderTile(slippyurl,localurl,tile);					
					}
					else{
						
						tiles.main.style.backgroundImage = "none";
						var bottomrtile = tiles["1|1"];
						
						var temp ={x: (translate.x),y:(translate.y)};
					
						
						temp.x *= scale.x;
						
						temp.y *= scale.y;
						
						temp.x -= 128;
						temp.y -= 128;
					
						var brleft = temp.x;
						var brtop =temp.y;
					
						
						brtop = brtop%256.0;
						brleft= brleft %256.0;
							
						if(brtop < 0) brtop += 256;
						if(brleft < 0) brleft += 256;
						
						var lola = EasyMapUtils.getLongLatAtXY(brleft+128,brtop+128,eMap);
						var br =EasyMapUtils.getSlippyTileNumber(lola.longitude,lola.latitude,zoomL,eMap);
						
						tilex = br.x;
						tiley = br.y;
													
						bottomrtile.style.left = brleft +"px";
						bottomrtile.style.top = brtop + "px";
						bottomrtile.title = zoomL+"/"+tilex + "/" + tiley;
						var slippyurl ="http://tile.openstreetmap.org/"+zoomL +"/"+tilex+"/"+tiley+".png";
						var localurl = "slippy/"+zoomL+ "/"+ tilex + "/" + tiley + ".png";
						that.renderTile(slippyurl,localurl,bottomrtile);
						
						//below code to be done dynamically so can have more than 4 tiles
						/*top tile*/
						var tile = tiles["1|0"];
						var t =  brtop - 256;
						tile.style.top = t + "px";
						tile.style.left = brleft +"px";
						var x = tilex;
						var y = tiley -1;
						tile.title =zoomL+"/"+x + "/" + y;
						var slippyurl ="http://tile.openstreetmap.org/"+zoomL +"/"+x+"/"+y+".png";
						var localurl = "slippy/"+zoomL+ "/"+ x + "/" + y + ".png";
						that.renderTile(slippyurl,localurl,tile);
						
						
						/*bottom left tile*/
						tile = tiles["0|1"];
						var l = brleft - 256
						tile.style.top = brtop + "px";
						tile.style.left = l +"px";
						x = tilex - 1;
						 
						y = tiley;
						var n = Math.pow(2,zoomL);
						if(x == -1) x = n-1;
						if(y == -1) y = n-1;
						var slippyurl ="http://tile.openstreetmap.org/"+zoomL +"/"+x+"/"+y+".png";
						var localurl = "slippy/"+zoomL+ "/"+ x + "/" + y + ".png";
						that.renderTile(slippyurl,localurl,tile);

						/*top left tile */
						tile = tiles["0|0"];
						tile.style.top = t + "px";
						tile.style.left = l +"px";
						x = tilex - 1;
						y = tiley -1;
						if(x == -1) x = n-1;
						if(y == -1) y = n-1;
						tile.title =zoomL+"/"+x + "/" + y;
						var slippyurl ="http://tile.openstreetmap.org/"+zoomL +"/"+x+"/"+y+".png";
						var localurl = "slippy/"+zoomL+ "/"+ x + "/" + y + ".png";
						that.renderTile(slippyurl,localurl,tile);	
						
				
					}

			};
			
			
		}
		,renderTile: function(weburl,localurl,tile){
			var renderTile = function(dest){
					tile.style.backgroundImage = "url('"+dest+"')";
					//var numtiles = Math.pw(2,zoomL);
	
			};
			var renderTileWeb = function(url){
					tile.style.backgroundImage = "url('"+url+"')";
					//var numtiles = Math.pw(2,zoomL);
	
			};
			try{	
				var localPath = getLocalPath(document.location.toString());
				var savePath;
				if((p = localPath.lastIndexOf("/")) != -1) {
					savePath = localPath.substr(0,p) + "/" + localurl;
				} else {
					if((p = localPath.lastIndexOf("\\")) != -1) {
						savePath = localPath.substr(0,p) + "\\" + localurl;
					} else {
						savePath = localPath + "." + localurl;
					}
				}
				//savePath = encodeURIComponent( escape(savePath.replace("\\", "\/")));
				
				//savePath =decodeURIComponent(savePath);
				//weburl =decodeURIComponent(weburl);
				//EasyFileUtils.saveImageLocally(weburl,savePath,renderTile,renderTileWeb); 
				//console.log(savePath,"saved");
				this.saveImageLocally(weburl,localurl,renderTile,renderTileWeb);
			}
			catch(e){
				console.log("unable to cache static image for this map view. ("+e+")")
			}
		}
		,saveImageLocally: function(sourceurl,dest,dothiswhensavedlocally,renderTileWeb) {
			
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
			savePath =decodeURIComponent( escape(savePath));
			sourceurl =decodeURIComponent( escape(sourceurl));
			
			var onloadfromweb = function(status,params,responseText,url,xhr){
				try{
					saveFile(savePath,responseText);
				}
				catch(e){
					console.log("error saving locally..");
				}
				renderTileWeb(url);
			};
			
			var onloadlocally = function(status,params,responseText,url,xhr){
			
				dothiswhensavedlocally(dest);
			};
			try{
				EasyFileUtils.loadRemoteFile(savePath,onloadlocally,null,null,null,null,null,null,true);
			}
			catch(e){//couldnt load probably doesn't exist!
			
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
				eMap.setProjection("GLOBE");
				eMap.controller.addControl("rotation");
				if(proj == 'spinnyglobe'){
					var f = function(){
						var t = eMap.controller.transformation;
						if(!t.rotate) t.rotate = {};
						if(!t.rotate.z) t.rotate.z  = 0;
					
						t.rotate.z += 0.3;
						eMap.controller.setTransformation(t);
						window.setTimeout(f,600);
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
			var proj = getParam(prms,"projection");
			if(proj == 'slippystaticmap'){
				wrapper.style.height = "256px";
				wrapper.style.width= "256px";
			}
			var statustext = createTiddlyElement(wrapper,"div",id+"_statustext");
			createTiddlyText(statustext,"loading... please wait a little while!");
			var caption = createTiddlyElement(place,"div","caption","caption");

			var eMap = new EasyMap(wrapper);

			if(proj){
				if(proj == 'google'){
					eMap.settings.projection = this.getGoogleMercatorProjection();
				}
				else if(proj == 'slippystaticmap'){
					this.setupSlippyStaticMapLayer(eMap);					
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
				
				geomaps[id].moveTo(la,lo,zoom);
			}
			
		}
		
		if(lo && la){
			createTiddlyButton(place,"go here", "jump to longitude:" + lo + ", latitude:"+la, handler);
		}
	
		
		}
	};
	config.macros.geogoto = {};
	/*zoom should be 1,2,4,8,16,32..*/
	config.macros.geogoto.handler= function(place,macroName,params,wikifier,paramString,tiddler) {
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
			geomaps[id].moveTo(la,lo,zoom);
		}
	
	}

} //# end of 'install only once'

//}}}
