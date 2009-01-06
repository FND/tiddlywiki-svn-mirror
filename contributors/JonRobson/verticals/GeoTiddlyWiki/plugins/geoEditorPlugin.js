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

	,handler: function(place,macroName,params,wikifier,paramString,tiddler) {				
	 
		var prms = paramString.parseParams(null, null, true);
		var that = this;

				
		var eMap = config.macros.geo.createNewEasyMap(place,prms);
		
		var onmup = function(e){
			var inID =eMap.wrapper.id + "_color";
			if(document.getElementById(inID).value) color =document.getElementById(inID).value;
			
			if(geotagger.value=='on'){		

				var p =EasyClickingUtils.getMouseFromEvent(e);
				var ll = EasyMapUtils.getLongLatFromMouse(p.x,p.y,eMap);	
				if(ll.longitude && ll.latitude){
					var tags = [];
					var text = "";
					var fields = {longitude:ll.longitude,latitude:ll.latitude,fill:"#000000"};
					var shapeName = "longitude: "+ll.longitude+";latitude:" + ll.latitude;
					store.saveTiddler(shapeName,shapeName,text,null,new Date(),tags,fields);
					geotagger.value = "off";
				}
				
			}
			else{
				that.clickColorsCountry(e,eMap,color);
			}
			return false;
		};
		
		
		var inID =eMap.wrapper.id + "_color";	
		wikify("geotag:",place);
		var geotagger= createTiddlyElement(place,"button");
		geotagger.value="off";
		geotagger.onclick = function(){
			this.value = "on";
			alert("click on map to tag!");
		}
		wikify("color:",place);
		var i= createTiddlyElement(place,"input");
		i.id = inID;
		i.value="#00ff00";
		config.macros.geo.addEasyMapClickFunction(eMap,onmup);
		config.macros.geo.addEasyMapControls(eMap,prms);

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