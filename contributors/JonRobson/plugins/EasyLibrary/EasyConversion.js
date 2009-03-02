
/*some conversion functions that convert to geojson */
var EasyConversion ={
	svgToGeoJson: function(svg,canvas){
		var svgxml = EasyFileUtils._getXML(svg);
		var res = EasyMapSVGUtils.convertSVGToMultiPolygonFeatureCollection(svgxml);
		
		
		//res = EasyMapUtils.fitgeojsontocanvas(res,canvas);
		//console.log(res.boundingBox);
		//res
		//work out here where origin should be (half of the maximum width of the svg coordinate space should be 0)
		return res;
	},
	geoRssToGeoJson : function (georss){
	
		var geojson = {type:"FeatureCollection", features:[]};
		
		var xml =EasyFileUtils._getXML(georss);
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

					var geometry = EasyFileUtils.getChildNodeValue(att[j]);
					

					var values = geometry.split(" ");
					if(values[0] != values[values.length-2] |values[1] != values[values.length-1]){
						fail = true;
						console.log("Fail!",geometry.length,geometry);
					
					
					}
					for(var k=0; k < values.length - 1; k+= 2){
						var latitude = parseFloat(values[k]);
						var longitude= parseFloat(values[k+1]);
						geocoordinates.push([longitude,latitude]);
					}
					//console.log(geocoordinates);
					feature.geometry.coordinates.push([geocoordinates]);
				}
				
			}
			if(!fail){
				geojson.features.push(feature);
			}
			else{
				console.log("Unable to construct feature " +feature.properties.name+". Invalid georss coordinates: first and last coordinates should be same. ");
			}
		}

		return geojson;
	}

};