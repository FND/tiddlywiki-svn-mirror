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
***/

//{{{
if(!version.extensions.geoPlugin) {
	setStylesheet(".wrapper {border:1px solid} .easymaptooltip {border:1px solid;background-color: rgb(255,255,255)}",'geo');
	
	version.extensions.geoPlugin = {installed:true};


	config.macros.geo = {};
	config.macros.geo.getgeojson = function(sourcetiddler,hidegeotiddlerdata){
		if(!sourcetiddler) sourcetiddler ='geojson';
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

				features[i].properties = newprop;
				
				
			}
		}


		//tiddler.geoproperties
		//add geotags
		if(!hidegeotiddlerdata){
	 	store.forEachTiddler(function(title,tiddler) {
			//add geotags
			if(tiddler.fields.geo){
				var latlong =tiddler.fields.geo;
				latlong = latlong.replace(" ","");
				var ll = latlong.split(";");
				var longc =parseFloat(ll[1]);
				var latc =parseFloat(ll[0]);
				var prop = {name: title,fill:"#ff0000"};
				var geotagfeature = new GeoTag(longc,latc,prop);
				data.features.push(geotagfeature); //add the tagging feature
			}
		}	
		);
		}
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
	
	config.macros.geogoto = {};
	config.macros.geogoto.handler= function(place,macroName,params,wikifier,paramString,tiddler) {
		var id = params[3];
		if(!params[3]) id = 'default';
		
		if(!geomaps[id]) {alert("geogoto can only be used if there is a geomap somewhere on the page!");}
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
			tiddler.geoid = geoid; 
			var prms = paramString.parseParams(null, null, true);

			var geoid = getParam(prms,"id");
			if(!geoid) geoid = "default";
			
			var id = "wrapper_"+geoid;

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

			eMap.wrapper.onmouseup = function(e){
				
				if(!e) {
					e = window.event;
				}
				
				var t = EasyMapUtils.resolveTargetWithMemory(e);
				if(t.getAttribute("class") == 'easyControl') return false;
				
				var shape = EasyMapUtils.getShapeAtClick(e);
				
				if(!shape) {
					return false;
				}
				var shapeName = shape.properties.name;
				if(!store.tiddlerExists(shapeName)) {
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
			if(getParam(prms,"spherify")) {
				eMap.spherical = true;
				eMap.controller.addControl("rotation");
			 }
			else{
				eMap.controller.addControl('pan');
			}
			
			eMap.controller.addControl('zoom');
			eMap.controller.addControl("mousepanning");
			eMap.controller.addControl("mousewheelzooming");	
				
			var source = null;
			if(getParam(prms,"source")) source = getParam(prms,"source");
	

			var geodata = this.getgeojson(source,getParam(prms,"hidegeotiddlerdata"));
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

