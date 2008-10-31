var canvas;
var ctx;

function init(){
	canvas = document.getElementById('map');
	ctx = canvas.getContext('2d');
	ctx.save();		
}

function drawUK(){
	var coords = [92,123,84,139,86,154,81,164,92,165,109,159,115,172,102,172,97,188,106,190,87,205,145,194,154,177,124,145,131,132,119,130,138,113,143,100,129,106,119,121,92,123,92,123];
	drawPolygonFromMapCoords(coords);
}

function drawPolygonFromMapCoords(coords,fill,r,g,b){

	if(!fill) fill = false;
	if(!r) r = 0; 
	if(!g) g=0;
	if(!b) b=0;
	ctx.fillStyle = "rgb("+r+"," + g +","+b+")";
	ctx.beginPath();

	var x = 0;
	var y=0;
	for(var i=0; i < coords.length-1; i+=2){
		x = parseInt(coords[i]);
		y = parseInt(coords[i+1]);
		ctx.lineTo(x,y);
	}
	//connect last to first
	ctx.lineTo(coords[0],coords[1], coords[coords.length-2],coords[coords.length-1]);
	ctx.closePath();
	if(!fill) 
	  ctx.stroke();
	else 
	  ctx.fill();
}

function getArrayFromString(coords){
	var y = new Array();
	var x =coords.split(",");
	for(i in x){
		y[i] = x[i];
	}

	return y;
}

/*pass a <map> tag and associate with image if required*/
function drawFromMap(mapID,backimg){
	var map = document.getElementById(mapID).getElementsByTagName('AREA');
	//
	var overlay = document.getElementById("overlay")
	overlay.useMap = "#"+mapID;
	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	var img = new Image();   // Create new Image object  
	

	doIt = function(){
		console.log('lets do it');
		ctx.restore();
		//ctx.scale(2,2);
		//ctx.translate(-50,-50);
		for(var x = 0; map[x]; x++ ){
			var el= map[x];

			if(el.shape == "polygon"){

				if(el.alt == 'Algeria'){
				fill = true;
				} 
				else fill = false;
				var a = getArrayFromString(el.coords);
				drawPolygonFromMapCoords(a,fill);

			}

		}
	}
	if(backimg){
		var imgDoIt = function(){
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);
			doIt();

		}
		
		img.useMap = "#"+mapID;
		img.onload = imgDoIt;
		img.src = backimg;

	}
	else
		doIt();
}


function convertToMapCoords(SVGCoordinates){
	var pointPairs = [];
	
	if(SVGCoordinates) {
		//pointList = SVGCoordinates.trim();
		pointPairs = SVGCoordinates.split(" ");
	}

	var numPairs = pointPairs.length;
	var points = [];
	
	if(numPairs > 0) {

	 	var coords, numCoords;
	
		for(var i=0; i<numPairs; i++) {
			coords = pointPairs[i].split(",");
			numCoords = coords.length;
			if(numCoords > 1) {
				if(coords.length == 2)
					coords[2] = null;
			}
			points[points.length] = coords[0];
			points[points.length] = coords[1];
		}
	}
	return points;
	
}

function drawFromSVG(){
	
	var  points="56.956,81.045 102.162,86.689 107.813,89.915 111.849,88.303 114.271,88.303 116.693,90.722 115.886,93.14 117.501,95.56 122.343,96.365 123.152,99.591 124.766,102.01 128.803,102.816 132.838,101.204 140.103,101.204 143.333,97.171 147.369,95.56 147.369,100.398 140.91,104.428 138.489,104.428 136.875,108.46 137.682,109.267 136.875,110.878 129.61,111.685 128.803,114.104 124.766,119.749 123.958,116.523 123.958,115.717 121.536,120.555 121.536,126.199 111.849,133.456 110.235,133.456 107.006,140.712 107.006,147.969 106.198,152 104.583,153.614 102.969,153.614 101.354,141.519 94.897,139.906 91.667,139.101 90.86,143.132 85.209,139.906 79.559,139.906 71.486,150.388 69.064,148.775 68.258,139.906 65.834,139.101 64.22,140.712 62.606,139.906 60.184,133.456 56.956,132.65 56.148,133.456 50.497,133.456 45.653,129.423 40.81,129.423 40.81,127.005 36.774,122.167 36.774,114.911 39.195,114.104 38.389,111.685 38.389,106.042 50.497,84.271 52.111,84.271 53.726,86.689";
		
	var coords = convertToMapCoords(points);
	drawPolygonFromMapCoords(coords);
}