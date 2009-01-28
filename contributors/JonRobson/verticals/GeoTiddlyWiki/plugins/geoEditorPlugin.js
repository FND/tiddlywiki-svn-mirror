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

	,addGeoTiddler: function(easyMap,name,ll,fill,text,tags){
		if(!tags) var tags = [];
		if(text) var text = "";
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
		/*Geotagging */
		var searchResultToTag = function(result) {
			if(result.length ==0) {
				return false;
			}
			else{
				that.addGeoTiddlerFromGoogleLocalSearchResult(eMap,result[0],clickinput.value);
			}
		};
		config.macros.googlelocalsearcher.setup(place,searchResultToTag, false,"tag location:");
	
	/*tool toggler */
		var tooltoggler= createTiddlyElement(place,"button",null,null,"viewer");
		tooltoggler.value="viewer";
		wikify(" parameters:",place);
		var clickinput= createTiddlyElement(place,"input");
		clickinput.value="rgb(255,0,0)";

		var geotag = function(e,shape,mouse,ll,feature,key){
			var color = "rgb(255,0,0)";
			if(ll.longitude && ll.latitude){
				var shapeName = "New GeoTiddler ("+ll.longitude+";" + ll.latitude+")";
				
				that.addGeoTiddler(eMap,shapeName,ll,color);
			}	
		}
		var onmup = function(e,shape,mouse,ll,feature,key){
			var color =  clickinput.value;
			console.log("key pressed is, ",key);
			if(!key){
				if(shape) story.displayTiddler(story.findContainingTiddler(resolveTarget(e)),shape.properties.name);
			}
			else if(key == 'g'){			
				geotag(e,shape,mouse,ll,feature,key);
				
			}
			else if(key = 'e'){
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
			
			else if(key == 'c'){
				that.clickColorsCountry(e,eMap,color);
			}
			return false;
		};

		tooltoggler.onclick = function(){
			switch(this.value){
				case "viewer":
				this.value = "colorer";
				this.innerHTML = "colorer";
				break;
				case "colorer":
				this.value = "tagger";
				this.innerHTML = "tagger";			
				break;
				
				case "tagger":
				this.value = "opentiddler";
				this.innerHTML = "edit existing geotiddler properties (not IE)";			
				break;
				
				case "opentiddler":
				this.value = "viewer";
				this.innerHTML = "viewer";			
				break;
			
			}

		};
		

	/*source code generator */		
		wikify("\n Paste the code below into a tiddler and point your macro at it to display it in your tiddlywiki\n",place);
		var sourceBox= createTiddlyElement(place,"textarea",null,null,"");
		wikify("\n ",place);
		var generateSource= createTiddlyElement(place,"button",null,null,"generate source code (NOT IE)");
	

		generateSource.onclick = function(e){
			if(!config.browser.ie){
			sourceBox.innerHTML = eMap._lastgeojson.toSource();
			}
		};
		
		/*setup handling of mouse */
		
		eMap.setMouseFunctions(onmup,null);
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

config.macros.geosearchandgoto = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {				
	 
		var prms = paramString.parseParams(null, null, true);
		var mapid = getParam(prms,"id");
		
		var tagit =document.createElement("button");
		var f = function(results){
			var map = config.macros.geo.getMap(mapid);
			var la = results[0].lat;
			var lo = results[0].lng;
			var zoom;
			
			if(map.controller.transformation.scale.x)
				zoom = map.controller.transformation.scale.x;
			else
				zoom = 1;
			map.moveTo(la,lo,zoom);
		/*	
			tagit.title = results[0].titleNoFormatting;
			tagit.longitude = lo;
			tagit.latitude = la;
			*/
		};
		config.macros.googlelocalsearcher.setup(place,f,true);

/*
		tagit.onclick = function(e){
			if(this.latitude && this.longitude && this.title){
				config.macros.addGeoTiddler(map,this.title,{longitude:this.longitude,latitude:this.latitude},"#cccccc");
			}
		}
		place.appendChild(tagit);
*/		
		
	}
}
config.macros.googlelocalsearcher = {

	setup: function(place,f,dontconfirm,alternativePretext){
	
		var newplace = createTiddlyElement(place,"div");
		if(!alternativePretext) alternativePretext ="''find location'': ";
		wikify(alternativePretext,newplace);
		var searchtaggerinput = createTiddlyElement(newplace,"input",null,null);
		var suggestions = createTiddlyElement(newplace,"span");
		var searchtaggerclick = createTiddlyElement(newplace,"button",null,null,"go");		
		wikify("\n tips: for San Francisco search for San Francisco, California,USA - the more specific the more accurate",newplace);
		var handler = function(results){
			
			var title =results[0].titleNoFormatting;
			var answer;
			if(!dontconfirm){
				answer = confirm(title + " sound good?");
			}
			else{
			answer = true;
			}
			if(answer){
				
				searchtaggerinput.value = title;
				f(results);
			}
		
			
		}
		
		searchtaggerclick.onclick = function(e){
			EasyMapUtils.getLocationsFromQuery(searchtaggerinput.value,handler);
		};		
	}
	
	
};