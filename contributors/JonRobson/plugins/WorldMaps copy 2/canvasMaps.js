
var EasyMap = function(){
	
	this.canvas = document.getElementById('map');
	this.ctx = this.canvas.getContext('2d');
	this.ctx.save();		
	this.overlay = document.getElementById("overlay")
	this.overlay.useMap = "#currentImageMap";
	this.overlay.width = this.canvas.width;
	this.overlay.height = this.canvas.height;
	this.imageMap = document.getElementById("currentImageMap");
};

//tagmindmap class body
EasyMap.prototype = {
	
	drawShape: function(easyShape){
	//if(easyShape.shape == 'polygon') drawPolygon();	
	},
	drawPolygon: function(coords,fill,r,g,b){

		if(!fill) fill = false;
		if(!r) r = 0; 
		if(!g) g=0;
		if(!b) b=0;
		this.ctx.fillStyle = "rgb("+r+"," + g +","+b+")";
		this.ctx.beginPath();

		var x = 0;
		var y=0;
		for(var i=0; i < coords.length-1; i+=2){
			x = parseInt(coords[i]);
			y = parseInt(coords[i+1]);
			this.ctx.lineTo(x,y);
		}
		//connect last to first
		this.ctx.lineTo(coords[0],coords[1], coords[coords.length-2],coords[coords.length-1]);
		this.ctx.closePath();
		if(!fill) 
		  this.ctx.stroke();
		else 
		  ctx.fill();
	},
	
	clear: function(){
		this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		var m = this.imageMap;
		if (m.hasChildNodes() )
		{
		    while (m.childNodes.length >= 1 )
		    {
		        m.removeChild(m.firstChild );       
		    } 
		}
		
	},
	
	drawFromSVG: function(SVGfile){
		this.clear();
		var  points="56.956,81.045 102.162,86.689 107.813,89.915 111.849,88.303 114.271,88.303 116.693,90.722 115.886,93.14 117.501,95.56 122.343,96.365 123.152,99.591 124.766,102.01 128.803,102.816 132.838,101.204 140.103,101.204 143.333,97.171 147.369,95.56 147.369,100.398 140.91,104.428 138.489,104.428 136.875,108.46 137.682,109.267 136.875,110.878 129.61,111.685 128.803,114.104 124.766,119.749 123.958,116.523 123.958,115.717 121.536,120.555 121.536,126.199 111.849,133.456 110.235,133.456 107.006,140.712 107.006,147.969 106.198,152 104.583,153.614 102.969,153.614 101.354,141.519 94.897,139.906 91.667,139.101 90.86,143.132 85.209,139.906 79.559,139.906 71.486,150.388 69.064,148.775 68.258,139.906 65.834,139.101 64.22,140.712 62.606,139.906 60.184,133.456 56.956,132.65 56.148,133.456 50.497,133.456 45.653,129.423 40.81,129.423 40.81,127.005 36.774,122.167 36.774,114.911 39.195,114.104 38.389,111.685 38.389,106.042 50.497,84.271 52.111,84.271 53.726,86.689";
		var coords = this._convertToMapCoords(points);

		var elem = document.createElement("AREA");
		elem.coords = coords;
		elem.href = "javascript:alert('osmotastic');";
		elem.shape = "polygon";
		this.drawPolygon(coords);
		this._makePolygonClickable(elem);
	},
	
	

	/*draw from image map */
	drawFromImageMap: function(mapID,backimg){
		var map = document.getElementById(mapID).getElementsByTagName('AREA');
		this.clear();


		var that = this;
		var doIt = function(){
			
			that.ctx.restore();
			for(var x = 0; map[x]; x++ ){
				var s = new EasyShape(map[x]);
				console.log(s);
				var el= map[x];

				if(el.shape == "polygon"){
					var fill = false;
					var a = that._getArrayFromString(el.coords);
					that._makePolygonClickable(el);
					that.drawPolygon(a,fill);

				}

			}
		};
		
		if(backimg){
			var img = new Image();   // Create new Image object 
			var imgDoIt = function(){
				that.canvas.width = img.width;
				that.canvas.height = img.height;
				that.ctx.drawImage(img, 0, 0);
				doIt();

			}

			img.onload = imgDoIt;
			img.src = backimg;

		}
		else
			doIt();

	},


	_convertToMapCoords: function(SVGCoordinates){
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

	},

	_makePolygonClickable: function(elem){
		var area = document.createElement("AREA");
		if(elem.tagName == 'AREA') {
			area.shape = elem.shape;
			area.href = elem.href;
			area.alt = elem.alt;
			area.coords = elem.coords;

			area.name = elem.name;
			var map = document.getElementById("currentImageMap");
			map.appendChild(area);
		}
	},
		
	_getArrayFromString: function(coords){
		var y = new Array();
		var x =coords.split(",");
		for(i in x){
			y[i] = x[i];
		}

		return y;
	}	

};

var EasyShape = function(node){
	if(node.tagName == "AREA")
		this.constructFromAreaTag(node);
	
};

EasyShape.prototype={
	constructFromAreaTag: function(node){
		this.shape = node.shape;
		this.coords = node.coords;
		this.href = node.href;
	}
};




