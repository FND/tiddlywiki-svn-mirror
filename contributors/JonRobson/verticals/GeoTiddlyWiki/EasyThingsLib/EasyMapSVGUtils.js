/*
SVG targeted functions withe goal to convert to a geojson structure
*/
var EasyMapSVGUtils= {
	convertSVGToMultiPolygonFeatureCollection: function(xml,canvas){			
		var svgu = EasyMapSVGUtils;
		var res = new Object();
		res.type = "FeatureCollection";
		res.features = [];

		var objs = xml.getElementsByTagName("svg:polygon");
		res.features = res.features.concat(svgu.createFeaturesFromSVGPolygonElements(objs));
		objs = xml.getElementsByTagName("polygon");
		res.features = res.features.concat(svgu.createFeaturesFromSVGPolygonElements(objs));
		objs =xml.getElementsByTagName("svg:path");
		res.features = res.features.concat(svgu.createFeaturesFromSVGPathElements(objs));
		objs =xml.getElementsByTagName("path");
		res.features = res.features.concat(svgu.createFeaturesFromSVGPathElements(objs));
		res.transform = {};
		res.transform.translate = {'x':0, 'y':0};
		res.transform.scale = {'x':1, 'y':1};
		
		res = EasyMapUtils.fitgeojsontocanvas(res,canvas)
		return res;
	},
	createFeatureFromSVGPolygonElement: function(svgpoly){
		
		var f = {};
		f.type = 'Feature';
		f.geometry = {};
		f.geometry.type = "MultiPolygon";
		
		//this.shape = "polygon";
		f.geometry.coordinates = this._convertFromSVGPathCoords(svgpoly.getAttribute("points"));
		f.properties = {};
		
		f.properties.name = svgpoly.getAttribute("name")
		f.properties.href= svgpoly.getAttribute("xlink");
	
		if(svgpoly.getAttribute("fill")) {
			f.properties.fill = svgpoly.getAttribute("fill"); 
		}
		
		return f;
		
	},	
	createFeatureFromSVGPathElement: function(svgpath){
		
		var f = {};
		f.type = 'Feature';
		
		f.properties = {};
		f.properties.colour = '#cccccc';
		f.properties.fill = svgpath.getAttribute("fill"); 
		//f.properties.fill = false; //UNCOMMENT ME FOR EDITING MODE
		f.properties.name = svgpath.getAttribute("id");
		f.properties.href= svgpath.getAttribute("xlink");
		f.geometry = {};
		f.geometry.type = "MultiPolygon";
		var p =svgpath.getAttribute("d");
		var t =svgpath.getAttribute("transform");
		var parent = svgpath.parentNode;

		if(!t && parent && parent.getAttribute("transform") && parent.tagName =='g'){
			t = parent.getAttribute("transform");
		}
		
		
		var newp = this._convertFromSVGPathCoords(p,t);
		//if(f.properties.name == 'it_6')console.log(p,newp);
		var coords = newp;
		//console.log(coords[0].length,f.properties.name,f);
		//if(coords[0].length == 1)console.log(coords[0]);
		f.geometry.coordinates = coords;
		return f;
	},
	createFeaturesFromSVGPolygonElements: function(polys){
		var res = [];
		
		for(var i=0; i< polys.length; i++){
			var el = polys[i];
			res.push(this.createFeatureFromSVGPolygonElement(el));
		}
		return res;
	},		
	createFeaturesFromSVGPathElements: function(paths){
		var res = [];
		
		for(var i=0; i< paths.length; i++){
			var el = paths[i];
			var f=this.createFeatureFromSVGPathElement(el);
			res.push(f);
		}
		return res;
	},
	
	_convertFromSVGPathCoords: function(SVGCoordinates,transformation){
		//transformation in form matrix(0.5,0,0,0.5,-180,0)
		var matrix =[],translate=[];
		var bads = [];
		if(transformation){
			if(transformation.indexOf("translate") > -1){ //matrix given!
				transformation=transformation.replace("translate(","");
				transformation=transformation.replace(")","");
				transformation=transformation.replace(" ","");
				translate  = transformation.split(",");
			}			
			if(transformation.indexOf("matrix") > -1){ //matrix given!
				transformation=transformation.replace("matrix(","");
				transformation=transformation.replace(")","");
				transformation=transformation.replace(" ", "");
				matrix  = transformation.split(",");
			}
		}
		var pointPairs = [];
		
		if(SVGCoordinates) {
			var c = SVGCoordinates;

			

			
			c = c.replace(/^\s*(.*?)\s*$/, "$1");
			
			 //fix the svg lazy bug (allowing coordinates in form 4-2 rather than 4,-2) 
			while(c.search(/-?(\d*\.+\d*)\-/g) >-1){
				//console.log("!");
				c = c.replace(/(-?\d*\.?\d*)\-/g,"$1,-")
			}
			
			while(c.search(/([A-Z] *-?\d*\.?\d*) *(-?\d*.?\d* *[A-Z])/gi) >-1){ //sorts out M xx.xx yy.yyL -> M xx.xx,yy.yyL 
				c = c.replace(/([A-Z] *-?\d*\.?\d*) *(-?\d*.?\d* *[A-Z])/gi,"$1,$2")
			}
			
			while(c.search(/([A-Z]\d*\.?\d*) *(\d*\.?\d*[A-Z])/gi) > -1){
				c = c.replace(/([A-Z]\d*\.?\d*) *(\d*\.?\d*[A-Z])/gi,"$1,$2");	
			}
				
			//end fixes
			
			c = c.replace(/(c|L|M|V|H)/gi, " $1"); //create spacing
			c = c.replace(/C|L|M/g, "");//get rid of abs path markers.. absolute coordinates are great
			c = c.replace(/z/gi, " z ");
			//console.log("help",c);
			
			pointPairs = c.split(" ");
			
		}

		var numPairs = pointPairs.length;
		var points = [[]];
		var polyc = [];
		if(numPairs > 0) {
			
		 	var coords, numCoords;

			var last = {'x':0,'y':0};
			for(var i=0; i<numPairs; i++) {
				var pair = pointPairs[i];
				var closeme = false;

				
				if(pair.search(/z|Z/) >-1){
					closeme = true;
					pair = pair.replace("z",""); //close path		
				}		

				if(pair.length > 0){				
					coords = pair.split(",");
					
					if(coords.length > 0){
						var relative = false;
						var x =coords[0];
						var y = coords[1];
						
						if(x.search(/V|H/i) == 0){ //vertical or horizontal command
							if(x.search(/V/) ==0){//vertical absolute
								x = x.substring(1);
								y = last.y;
							}
							else if(x.search(/v/) ==0 ){//vertical relative
								x = parseFloat(last.x + x.substring(1));
								y = last.y;								
							}
							else if(x.search(/h/)==0){//horizontal relative
								y = parseFloat(last.y + x.substring(1));
								x = last.x;								
							}
							else { //horizontal absolute x
								y = x.substring(1);
								x = last.x;	
							}
						
						}
				
					else if(x.search(/[a-z]/) == 0){ //its relative
							relative = true;
							x = x.substring(1);
						
						}

					x =parseInt(x);
					y=parseInt(y);
					}
					
					
					if(x && y){
						
						
						if(relative){
							x+= last.x; y+= last.y;
							//console.log(coords,x,y);
							
						}
						last.x = x; last.y = y;
						if(matrix.length == 6){
							var ox = x, oy=y;							
							x = parseInt((ox * matrix[0]) +   matrix[4]);
							y = parseInt(oy * matrix[3]);
						}
						
						if(translate.length == 2){
							x += parseFloat(translate[0]);
							y += parseFloat(translate[1]);
						}
					
						//console.log(x,y);
						if(typeof x == 'number' && typeof y =='number')	{
							
							polyc.push([x,-y]);
						}
					}
					else{
						//if(coords.length !=0 && coords.indexOf('-'))bads.push(pair);
					} 
				}
				if(closeme){
					points[0].push(polyc);
					polyc = [];
				}

			}
		}
		if(polyc.length >0) points[0].push(polyc);
		//console.log("read error!",bads);
		return points;
	}	
};