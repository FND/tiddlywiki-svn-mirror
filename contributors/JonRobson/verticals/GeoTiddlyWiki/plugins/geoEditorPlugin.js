config.macros.geoedit={
	clickColorsCountry: function(e,easyMap,color){	
			if(!e) {
				e = window.event;
			}

			var t = EasyClickingUtils.resolveTargetWithEasyClicking(e);
			if(t.getAttribute("class") == 'easyControl') return false;

			var shape = easyMap.easyClicking.getShapeAtClick(e);

			if(!shape) {
				return false;
			}
			var shapeName = shape.properties.name;
			
			if(!store.tiddlerExists(shapeName)) {
				var tags = [];
				var text = "";
				var fields = {};
				store.saveTiddler(shapeName,shapeName,text,null,new Date(),tags,fields);
			}
			
			var tid = store.getTiddler(shapeName);
			tid.fields.fill = color;
			
			shape.properties.fill = color;
			easyMap.redraw();
			
			return false;
	}

	,addGeoTiddler: function(easyMap,name,ll,fill){
		var tags = [];
		var text = "";
		var fields= {longitude:ll.longitude,latitude:ll.latitude,fill:"#000000"};
		if(fill) fields.fill = fill;
			
		store.saveTiddler(name,name,text,null,new Date(),tags,fields);
	
		var tag =GeoTag(ll.longitude,ll.latitude,{name: name,fill: fields.fill});
		easyMap._drawGeoJsonFeature(tag);
		easyMap.redraw();	
	}
	
	,addGeoTiddlerFromGoogleLocalSearchResult: function(easyMap,result,color){
		var tiddlername = result.titleNoFormatting;
		var tags = [];
		
		var ll = {};
		ll.longitude= result.lng;
		ll.latitude= result.lat

		this.addGeoTiddler(easyMap,tiddlername,ll,color);
	}
	,handler: function(place,macroName,params,wikifier,paramString,tiddler) {				
	 
		var prms = paramString.parseParams(null, null, true);
		var that = this;

				
		var eMap = config.macros.geo.createNewEasyMap(place,prms);
	
		wikify("!geotagging \n search and tag",place);
		var searchtaggerinput = createTiddlyElement(place,"input",null,null);
		var searchtaggerclick = createTiddlyElement(place,"button",null,null,"search and tag");
		wikify("\nmanual tagging:",place);
		var geotagger= createTiddlyElement(place,"button",null,null,"clickAndTag: off");
		geotagger.value="off";
		wikify("\ncoloring:",place);
		var colorinput= createTiddlyElement(place,"input");
		colorinput.value="#00ff00";

		//setup button clicking
		var onmup = function(e){
			var color =  colorinput.value;
			
			if(geotagger.value=='on'){		
				var p =EasyClickingUtils.getMouseFromEvent(e);
				var ll = EasyMapUtils.getLongLatFromMouse(p.x,p.y,eMap);	
				if(ll.longitude && ll.latitude){
					var shapeName = "New GeoTiddler ("+ll.longitude+";" + ll.latitude+")";
					that.addGeoTiddler(eMap,shapeName,ll,color);
					geotagger.value = "off";
					geotagger.innerHTML = "clickAndTag: off";
				}
				
			}
			else{
				that.clickColorsCountry(e,eMap,color);
			}
			return false;
		};
		searchtaggerclick.onclick = function(){
			
			var searchResultToTag = function(result) {
				if(result.length ==0) {
					return false;
				}
				else{
					that.addGeoTiddlerFromGoogleLocalSearchResult(eMap,result[0],colorinput.value);
				}
			};
			EasyMapUtils.getLocationsFromQuery(searchtaggerinput.value,searchResultToTag,colorinput.value);
		
		};
		geotagger.onclick = function(){
			this.value = "on";
			this.innerHTML = "clickAndTag: on";
		};
		/*setup handling of mouse */
		
		config.macros.geo.addEasyMapClickFunction(eMap,onmup);
		config.macros.geo.addEasyMapControls(eMap,prms);

		/*Time to draw */
		var source = getParam(prms,"source");
		var geodata = config.macros.geo.getGeoJson(source,eMap,prms);
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
		
	}
		
};