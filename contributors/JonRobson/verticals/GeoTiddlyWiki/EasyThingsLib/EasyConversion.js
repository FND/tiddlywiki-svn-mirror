
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
			
			var feature = {type:'Feature', geometry:{type:'MultiPolygon', coordinates:[[]]},properties:{'name':'georss'}};
						
			var att = items[i].childNodes;
			for(var j=0; j < att.length; j++){
				if(att[j].tagName == 'georss:polygon'){
					var geocoordinates = [];
					var geometry= att[j].firstChild.nodeValue;
					var values = geometry.split(" ");
					for(var k=0; k < values.length - 1; k+= 2){
						var latitude = parseFloat(values[k]);
						var longitude= parseFloat(values[k+1]);
						geocoordinates.push([longitude,latitude]);
					}
					
					feature.geometry.coordinates.push([geocoordinates]);
				}
				
				if(att[j].tagName == 'title' && att[j].firstChild){
					feature.properties.name =att[j].firstChild.nodeValue;
				}
				if(att[j].tagName == 'description' && att[j].firstChild){
					feature.properties.description =att[j].firstChild.nodeValue;
				}
			}

			geojson.features.push(feature);
		}

		return geojson;
	}

};