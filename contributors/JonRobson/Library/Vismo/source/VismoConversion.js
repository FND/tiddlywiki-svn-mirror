/*some conversion functions that convert to geojson */
var VismoConversion ={
	niaveGeoJsonFlatten: function(geojson,niaveness){
		
		var newdata = geojson;
		var coordsDropped = 0;
		for(var i=0; i < newdata.features.length; i++){
			var g = newdata.features[i].geometry;
		
			if(g.type == 'MultiPolygon'){
				for(var ij =0; ij < g.coordinates.length; ij++){
					for(var j=0; j < g.coordinates[ij].length; j++){
		
						var bettercoords = [];
						var every = 0;
						if(g.coordinates[ij][j].length > 50){
							for(var k=0; k < g.coordinates[ij][j].length; k++){

								var c = g.coordinates[ij][j][k];
							
								if(every == 0){
									var x = parseFloat(c[0]);
									var y = parseFloat(c[1]);
									bettercoords.push([x,y]);
									every= niaveness;
								}
								else{
									every -= 1;
								}	
			
							}
							coordsDropped += (g.coordinates[ij][j].length - bettercoords.length);
							g.coordinates[ij][j] = bettercoords;
						}
					}
				}
			}
		}
		//console.log(coordsDropped,"dropped");
		return newdata;
	}
	,svgToGeoJson: function(svg,canvas){
		var svgxml = VismoFileUtils._getXML(svg);
		var res = VismoMapSVGUtils.convertSVGToMultiPolygonFeatureCollection(svgxml);
		
		
		//res = VismoMapUtils.fitgeojsontocanvas(res,canvas);
		//console.log(res.boundingBox);
		//res
		//work out here where origin should be (half of the maximum width of the svg coordinate space should be 0)
		return res;
	},
	_kmlPolygonToFeature: function(xmlNode,feature){
		var geocoordinates = [];
		var polyChildren =xmlNode.childNodes;
		
		for(var k=0; k < polyChildren.length; k++){
			var fail = true;
			if(polyChildren[k].tagName =='outerBoundaryIs'){
				
				var outerChildren =polyChildren[k].childNodes;
				for(var l=0; l < outerChildren.length; l++){
					if(outerChildren[l].tagName == 'LinearRing'){
						
						var ringChildren =outerChildren[l].childNodes;
						for(var m=0; m < ringChildren.length; m++){
							if(ringChildren[m].tagName == 'coordinates'){
							
								
								var geometry = VismoFileUtils.getChildNodeValue(ringChildren[m]);
								geometry = geometry.trim();
						
								
								var coords = geometry.split(" "); //\n?
								for(var n=0; n < coords.length; n+= 1){
									var values = coords[n].split(",");
									var longitude= parseFloat(values[0]);
									var latitude = parseFloat(values[1]);
									var altitude = parseFloat(values[2]);
									geocoordinates.push([longitude,latitude]);
								
								}
								if(coords.length ==0){
									return false;
								}
								else{
									fail = false;
								}
								feature.geometry.coordinates.push([geocoordinates]);			
								
							}	
						}
					}
				}

                                                
			}
		}
		if(!feature){
			fail  = true;
		}
		else if(feature.geometry.coordinates[0].length == 0){
			fail = true;
		}
		else if(feature.geometry.coordinates[0][0].length == 1){
			fail = true;
		}
	
		if(fail) {
			return false;
		}
		else{
				
			return feature;
		}
	}
	,kmlToGeoJson: function(kml){
		var geojson = {type:"FeatureCollection", features:[]};
		
		var xml =VismoFileUtils._getXML(kml);
		var items = xml.getElementsByTagName("Placemark");
		
		for(var i=0; i < items.length; i++){
	
			var feature = {type:'Feature', geometry:{type:'MultiPolygon', coordinates:[]},properties:{'name':'georss'}};
						
			
			var att = items[i].childNodes;
			
			for(var j=0; j < att.length; j++){
				var fail = false;
				
				if(att[j].tagName == 'name' && att[j].firstChild){
					feature.properties.name =att[j].firstChild.nodeValue;
				}
				
				if(att[j].tagName == 'Polygon'){
					
					var succeeded = this._kmlPolygonToFeature(att[j],feature);

					if(succeeded){
						feature = succeeded;
					}
					else{
						fail = true;
					}
				}
				if(att[j].tagName == 'MultiGeometry'){
					
					var children = att[j].childNodes;
					for(var k=0; k < children.length; k++){
						if(children[k].tagName == 'Polygon'){

							var succeeded = this._kmlPolygonToFeature(children[k],feature);
						
							if(succeeded){
								feature = succeeded;
							}
							else{
								fail = true;
							}
						}	
					}
				}
				
			}
			//console.log("ere",fail);
			//if(!fail)
	//console.log(feature.geometry.coordinates.length);
			if(!fail && feature && feature.geometry.coordinates.length > 0) {
					geojson.features.push(feature);
			}
		}
	
		return geojson;
	}
	
	,geoRssToGeoJson : function (georss){
	
		var geojson = {type:"FeatureCollection", features:[]};
		var xml =VismoFileUtils._getXML(georss);
		var items = xml.getElementsByTagName("item");
		
		for(var i=0; i < items.length; i++){
			
			var feature = {type:'Feature', geometry:{type:'MultiPolygon', coordinates:[]},properties:{'name':'georss'}};
						
			var fail = false;
			var att = items[i].childNodes;
			for(var j=0; j < att.length; j++){

				
				if(att[j].tagName == 'title' && att[j].firstChild){
					feature.properties.name =att[j].firstChild.nodeValue;
				}
				if(att[j].tagName == 'description' && att[j].firstChild){
					feature.properties.description =att[j].firstChild.nodeValue;
				}
				
				if(att[j].tagName == 'georss:polygon'){
					var geocoordinates = [];
					//console.log(att[j].innerHTML,att[j].firstChild,"inner");

					var geometry = VismoFileUtils.getChildNodeValue(att[j]);
					geometry = geometry.trim();
					geometry = geometry.replace(/  +/g, " ");
					geometry = geometry.replace(/\n/g, "");
					var values = geometry.split(" ");
				
					if(values[0] != values[values.length-2] |values[1] != values[values.length-1]){
						values.push(values[0]);
						values.push(values[1]);
					}
					for(var k=0; k < values.length - 1; k+= 2){
						var latitude = parseFloat(values[k]);
						var longitude= parseFloat(values[k+1]);
						geocoordinates.push([longitude,latitude]);
					}
					feature.geometry.coordinates.push([geocoordinates]);
				}
				
			}
			if(!fail){
				geojson.features.push(feature);
			}
			else{
				
				//console.log("Unable to construct feature " +feature.properties.name+". Invalid georss coordinates: first and last coordinates should be same. ");
			}
		}
		
		return geojson;
	}

};