
/*
Some common utils used throughout package 
*/
var VismoMapUtils = {
	googlelocalsearchurl: "http://ajax.googleapis.com/ajax/services/search/local?v=1.0&q="
	
	,optimiseForIE6: function(geojson){
      	var newf = [];
        for(var i=0; i < geojson.features.length;i++){
            var f = geojson.features[i];
            var coordinates = f.geometry.coordinates;


            var newc = [];
            
            var good = false;
            
            if(coordinates.length <2){
                good = true;
            }
            for(var j=0; j < coordinates.length; j++){
                var c1 = coordinates[j];
                
            }
            
            var bb = f.geometry.bbox;
            if(bb){
                var dx = bb[2] - bb[0]; var dy= bb[3]- bb[1]; if(dy<0)dy =-dy;if(dx<0)dx =-dx;
                if(dx < 1 || dy < 1){
                    good =false;
                }
            }
            
            if(good){
                newf.push(f);
            }
        }
        geojson.features= newf;
        return geojson;
	
	}
	,addBoundingBoxes: function(geojson){ //currently MultiPolygon only..
		var geojsonbb = geojson;
		for(var i=0; i < geojson.features.length; i++){
			var f = geojson.features[i];

			var g = f.geometry;
			var c = g.coordinates;

			
			if(g.type.toLowerCase() == 'multipolygon'){
				var x1,y1,x2,y2;
				
				var horizontal = {belowzero:0,abovezero:0};
				var vertical = {belowzero:0,abovezero:0};
			
				for(var j=0; j < c.length; j++){
					for(var k=0; k < c[j].length; k++){
						
						for(var l=0; l < c[j][k].length; l++){
							var x = c[j][k][l][0];
							var y = c[j][k][l][1];
							/*if(x < 0 && horizontal.abovezero > horizontal.belowzero){
								x = 180;
							}
							else if(x > 0 && horizontal.abovezero < horizontal.belowzero){
								x = -180;
							}*/
							if(!x1) x1= x;
							if(!x2) x2 =x;
							if(!y1) y1 = y;
							if(!y2) y2 = y;
							if(y > y2) y2 = y;
							if(y < y1) y1 = y;
							if(x < x1) x1 = x;
							if(x > x2) x2= x;
							
							if(x > 0){
								horizontal.abovezero +=1;
							}
							else{
								horizontal.belowzero +=1;
							}
							
							if(y > 0){
								vertical.abovezero +=1;
							}
							else{
								vertical.belowzero +=1;
							}
							
									
										
						}
					}
				}
				
				//if(f.properties.name == "RUSSIAN FEDERATION")
				//console.log(x1,x2);
	
				g.bbox = [];
				g.bbox.push(x1);
				g.bbox.push(y1);
				g.bbox.push(x2);
				g.bbox.push(y2);
				x1 = false; x2=false;y1=false;y2=false;
			}
			
		}
		return geojsonbb;
	}
	 ,tile2long: function(x,z) {
	  	return (x/Math.pow(2,z)*360-180);
	 }
	 ,tile2lat: function(y,z) {
	  	var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
	  	return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
	 }
	,getLongLatAtXY: function(x,y,eMap){
		
		var res = VismoMapUtils.getLongLatFromMouse(x,y,eMap);
	
		
		return res;
	}
	,getSlippyTileNumber: function(lo,la,zoomL,eMap){
		var n = Math.pow(2,zoomL);
		var x = lo;

		var tilex = ((lo + 180)/360) *n;

		tilex = Math.floor(tilex);
		tiley =(Math.floor((1-Math.log(Math.tan(la*Math.PI/180) + 1/Math.cos(la*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoomL)));		
		return {x: tilex, y:tiley};
	}
	,getLocationsFromQuery: function(query,callback){
		var that = this;
		var fileloadedcallback = function(status,params,responseText,url,xhr){
				var response = eval("("+responseText+")");

				if(response.responseStatus == 200){
					var results = response.responseData.results;
					callback(results);
					
					return;
				}

		};
			
	
		VismoFileUtils.loadRemoteFile(that.googlelocalsearchurl+query,fileloadedcallback);
	}
	,getLongLatFromMouse: function(x,y,vismoMap){
		var t =vismoMap.getTransformation();
		var pos = VismoClickingUtils.undotransformation(x,y,t);	
		
		if(vismoMap.settings.projection) {
			pos = vismoMap.settings.projection.inversexy(pos.x,pos.y,t);
		}

		var lo = pos.x;
		var la = -pos.y;
		
		
		/*if(la > 85.0511) la = -la%85.0511;
		if(la < -85.0511) la = -la%85.0511;
		if(lo < -180) lo = -lo%180;
		if(lo > 180) lo = - lo%180;
		*/
		return {latitude: la, longitude: lo};
	}
	,_radToDeg: function(rad){
		return rad / (Math.PI /180);
	},
	_degToRad: function(deg) {
		//return ((deg + 180)/360) ;
		
		return (deg * Math.PI) / 180.0;
	},
	fitgeojsontocanvas: function(json,canvas){ /*canvas must have style width and height properties, returns an VismoTransformation*/
		var view ={};
		var f =json.features;
		for(var i=0; i < f.length; i++){
			var c = f[i].geometry.coordinates;
											
			for(var j=0; j < c.length; j++ ){
				for(var k=0; k < c[j].length; k++){
					

					for(var l=0; l < c[j][k].length;l++){
						
		
						var x =c[j][k][l][0];
						var y = c[j][k][l][1];
						if(!view.x1 || x <view.x1) {
							view.x1 = x;
						}
						else if(!view.x2 || x >view.x2) {
							view.x2 = x;
						}
						
						if(!view.y1 || y <view.y1) {
							view.y1 = y;
						}
						else if(!view.y2 || y >view.y2) {
							view.y2 = y;
						}
						

					}
						
				}
				
			}
		}
		if(!json.transform) json.transform ={};
		if(!json.transform.scale) json.transform.scale = {x:1, y:1};
		if(!json.transform.translate) json.transform.translate = {x:0,y:0};
		
		var canvasx =		parseFloat(canvas.style.width);
		var canvasy =parseFloat(canvas.style.height);
		view.center = {};
		view.width = (view.x2 - view.x1);
		view.height = (view.y2 - view.y1)
		view.center.x = view.x2 - (view.width/2);
		view.center.y = view.y2 - (view.height/2);
		//console.log(view.center.y, view.height);
		var scale = 1,temp;
		var tempx = parseFloat(canvasx/view.width);
		var tempy = parseFloat(canvasy/view.height);

		if(tempx < tempy) temp = tempx; else temp = tempy;
		
		var transform = {scale:{},translate:{}};
		transform.scale.x = temp;
		transform.scale.y = temp;

		transform.boundingBox = view;

		transform.translate.x = -view.center.x;
		transform.translate.y = view.center.y;//view.center.y;	
		return transform;
	},
	/*does not yet support undoing rotating */
	_testCanvas: function(ctx){
		ctx.beginPath();
		ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
		ctx.moveTo(110,75);
		ctx.arc(75,75,35,0,Math.PI,false);   // Mouth (clockwise)
		ctx.moveTo(65,65);
		ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
		ctx.moveTo(95,65);
		ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
		ctx.stroke();

	},	
	_undospherify: function (x,y,transformation,radius){
		var pos= this._spherifycoordinate(x,y,transformation);
		var latitude = Math.asin(y / radius);
		var longitude = Math.asin(parseFloat(x / radius) / Math.cos(latitude));

				
	
		//if(transformation.rotate.z && longitude != 'NaN')longitude -= transformation.rotate.z;
		//longitude = longitude % (6.28318531);
		//if(longitude < 0) longitude = longitude 

		if(transformation.rotate) {
			var r =transformation.rotate.z;
			//console.log("from",longitude);
			longitude +=r;
		
			//longitude =longitude% (6.28318531);
			
		}
		var lon = VismoMapUtils._radToDeg(longitude);
		var lat = VismoMapUtils._radToDeg(latitude);
		//console.log("to",longitude,r,lon);
		return {x:lon,y:lat};
	},
	_spherifycoordinate: function(lon,lat,transformation,radius){
		//http://board.flashkit.com/board/archive/index.php/t-666832.html
		var utils = VismoMapUtils;
		var res = {};
		
		var longitude = VismoMapUtils._degToRad(lon);
		var latitude = VismoMapUtils._degToRad(lat);
 		var wraplat = false;
 		// assume rotate values given in radians
		if(transformation && transformation.rotate){
			//latitude += transformation.rotate.x;
			
			var rotation =transformation.rotate.z;
			//rotation = transformation.translate.x;
			if(rotation){
				var r =parseFloat(rotation);
			
				var newl =parseFloat(longitude+r);
			
				//console.log(longitude,"->",newl,longitude,r,transformation.rotate.z);
			
				longitude +=r;
			}
			if(transformation.rotate.y){
				latitude += parseFloat(transformation.rotate.y);
				/*var limit =VismoMapUtils._degToRad(85);
				if(latitude <-limit){
					latitude += (2 * limit);
					res.movedNorth = true;
					
				}
				
				if(latitude > limit){
					latitude -= (2 * limit);
					res.movedSouth = true;
					
					
				}
				*/	
				
				//latitude = latitude % 6.28318531;
				
			} 
		}
		// latitude is 90-theta, where theta is the polar angle in spherical coordinates
		// cos(90-theta) = sin(theta)
		// sin(90-theta) = cos(theta)
		// to transform from spherical to cartesian, we would normally use radius*Math.cos(theta)
		//   hence in this case we use radius*Math.sin(latitude)
		// similarly longitude is phi-180, where phi is the azimuthal angle
		// cos(phi-180) = -cos(phi)
		// sin(phi-180) = -sin(phi)
		// to transform from spherical to cartesian, we would normally use radius*Math.sin(theta)*Math.cos(phi)
		//   we must exchange for theta as above, but because of the circular symmetry
		//   it does not matter whether we multiply by sin or cos of longitude	
	
		longitude = longitude % 6.28318531; //360 degrees		
	
		
		
		
		res.y = (radius) * Math.sin(latitude);	
		//console.log(latitude);
		//if(wraplat) res.y = ["M",res.y];
		/*
		
		if(latitude > 85.0511){
			res.y = (-radius) * Math.sin(latitude);	
		}
		else{
		res.y = (radius) * Math.sin(latitude);		
		}
		*/
		
		//if(latitude > 85.0511)
		
		
		if(longitude < 1.57079633 || longitude > 4.71238898){//0-90 (right) or 270-360 (left) then on other side 
			res.x = (radius) * Math.cos(latitude) * Math.sin(longitude);		
		}
		else{
			//console.log(longitude,"bad",transformation.rotate.z);
			res.x = false;
		}
	
		return res;
	}

};