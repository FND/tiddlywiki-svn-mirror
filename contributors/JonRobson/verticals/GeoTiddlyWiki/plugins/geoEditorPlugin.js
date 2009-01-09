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
			/*
			if(!config.browser.ie){
				tiddler.fields._associatedgeofeature = feature.toSource();
			}*/
					
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
		wikify("\nTOOL:",place);
		var clicking= createTiddlyElement(place,"button",null,null,"COLORER");
		clicking.value="colorer";
		wikify(" parameters:",place);
		var clickinput= createTiddlyElement(place,"input");
		clickinput.value="#00ff00";

		//setup button clicking
		var onmup = function(e,shape,mouse,ll,feature){
			var color =  clickinput.value;
			
			if(clicking.value=='tagger'){			
				if(ll.longitude && ll.latitude){
					var shapeName = "New GeoTiddler ("+ll.longitude+";" + ll.latitude+")";
					that.addGeoTiddler(eMap,shapeName,ll,color);
				}
				
			}
			else if(clicking.value == 'opentiddler'){
				var name =shape.properties.name;
				var tags = [];
				var fields = {};
				var text = "";
				if(store.tiddlerExists(name)) {
					var tid = store.getTiddler(name);
					text = tid.text;
					tags = tid.tags;
					fields = tid.fields;
				}
				if(!config.browser.ie){
					fields.geofeature = feature.toSource();
				}
				fields.fill = shape.properties.fill;
				store.saveTiddler(name,name,text,null,null,tags,fields);
				story.displayTiddler(story.findContainingTiddler(resolveTarget(e)),name);
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
					that.addGeoTiddlerFromGoogleLocalSearchResult(eMap,result[0],clickinput.value);
				}
			};
			EasyMapUtils.getLocationsFromQuery(searchtaggerinput.value,searchResultToTag,clickinput.value);
		
		};
		clicking.onclick = function(){
			switch(this.value){
			
				case "colorer":
				this.value = "tagger";
				this.innerHTML = "tagger";			
				break;
				
				case "tagger":
				this.value = "opentiddler";
				this.innerHTML = "edit existing geotiddler properties (not IE)";			
				break;
				
				case "opentiddler":
				this.value = "colorer";
				this.innerHTML = "colorer";			
				break;
			
			}

		};
		wikify("/n Paste the code below into a tiddler and point your macro at it to display it in your tiddlywiki/n",place);
		var sourceBox= createTiddlyElement(place,"textarea",null,null,"");
		var generateSource= createTiddlyElement(place,"button",null,null,"generate source code (NOT IE)");
	
		generateSource.onclick = function(e){
			if(!config.browser.ie){
			sourceBox.innerHTML = eMap._lastgeojson.toSource();
			}
		};
		
		/*setup handling of mouse */
		
		eMap.setMouseFunctions(onmup);
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