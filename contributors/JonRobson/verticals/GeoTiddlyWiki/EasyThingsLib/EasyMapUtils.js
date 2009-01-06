
/*
Some common utils used throughout package 
*/

if(!window.console) {
	console = {
		log:function(message) {
			var d = document.getElementById('consolelogger');
			if(d) {
				d.innerHTML += message+"<<] ";
			}
		}
	};
}

Array.prototype.contains = function(item)
{
	return this.indexOf(item) != -1;
};

if(!Array.indexOf) {
	Array.prototype.indexOf = function(item,from)
	{
		if(!from)
			from = 0;
		for(var i=from; i<this.length; i++) {
			if(this[i] === item)
				return i;
		}
		return -1;
	};
}

var EasyMapUtils = {
	getLongLatFromMouse: function(x,y,easyMap){
		
		var pos = EasyClickingUtils.undotransformation(x,y,easyMap.controller.transformation);
		return {latitude:-pos.y,longitude:pos.x};
	}
	,_radToDeg: function(rad){
		return rad / (Math.PI /180);
	},
	_degToRad: function(deg) {
		return deg * Math.PI / 180;
	},
	fitgeojsontocanvas: function(json,canvas){ /*canvas must have style width and height properties*/
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
		json.transform.scale.x = temp;
		json.transform.scale.y = temp;

		json.boundingBox = view;

		json.transform.translate.x = -view.center.x;
		json.transform.translate.y = view.center.y;//view.center.y;	
		return json;
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
	_undospherify: function (x,y,transformation){
		var radius = transformation.spherical.radius;
		var pos= this._spherifycoordinate(x,y,transformation);
		var latitude = Math.asin(y / radius);
		var longitude = Math.asin(parseFloat(x / radius) / Math.cos(latitude));

				
	
		//if(transformation.rotate.z && longitude != 'NaN')longitude -= transformation.rotate.z;
		//longitude = longitude % (6.28318531);
		//if(longitude < 0) longitude = longitude 

		if(transformation.rotate) {
			var r =transformation.rotate.z;
			console.log("from",longitude);
			longitude +=r;
		
			//longitude =longitude% (6.28318531);
			
		}
		var lon = EasyMapUtils._radToDeg(longitude);
		var lat = EasyMapUtils._radToDeg(latitude);
		console.log("to",longitude,r,lon);
		return {x:lon,y:lat};
	},
	_spherifycoordinate: function(lon,lat,transformation){//http://board.flashkit.com/board/archive/index.php/t-666832.html
		var radius = transformation.spherical.radius;
		var utils = EasyMapUtils;
		var res = {};
		
		var longitude = EasyMapUtils._degToRad(lon);
		var latitude = EasyMapUtils._degToRad(lat);
 		
 		// assume rotate values given in radians
		if(transformation && transformation.rotate){
			//latitude += transformation.rotate.x;
			longitude += transformation.rotate.z
			 
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
		if(longitude < 1.57079633 || longitude > 4.71238898){//0-90 (right) or 270-360 (left) then on other side 
			res.x = (radius) * Math.cos(latitude) * Math.sin(longitude);		
		}
		else{
			res.x = false;
		}
	
		return res;
	}

};
