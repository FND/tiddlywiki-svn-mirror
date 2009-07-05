/*Extends VismoMaps to provide tiled background */
var VismoGlobe=  function(eMap){
	var i;
	for(i in VismoGlobe.prototype){
		eMap[i] = VismoGlobe.prototype[i];
	}	
	
	eMap.setGlobeProjection("GLOBE");
	return eMap;
	
};

VismoGlobe.prototype = {
	setGlobeProjection: function(){
		var vismomap = this;
		vismomap._fittocanvas = false;
		this.settings.beforeRender = function(t){
				vismomap._createGlobe(vismomap.getProjection().getRadius(t.scale));
		};
		
		this.settings.projection= {
				name: "GLOBE",
				nowrap:true,
				radius: 10,
				direction: 0
				,init: function(){
					this.direction = 0;
				}
				,getRadius: function(){
					return this.radius;
				}
				,inversexy: function(x,y,t){
						var radius =this.getRadius(t.scale);
						var res = VismoMapUtils._undospherify(x,y,t,radius);
						return res;
				}
				,xy: function(x,y,t){
					
					var radius =this.getRadius(t.scale);
					if(!radius || !x || !y || !t) return {x:x,y:y};
					var res = VismoMapUtils._spherifycoordinate(x,y,t,radius);
					/*
					if(res.movedNorth && this.direction >= 0){
						this.direction = -1;
						res.move= true;
					}
					else if(res.movedSouth && this.direction <= 0){
						this.direction = 1;
						res.move = true;
					}
					
					if(res.y > radius - 10 || res.y < 10-radius){
						
						res.y = false;
					}*/
					return res;
				}
		};
		
		var heightR = parseInt(vismomap.wrapper.style.height)  /2;
		var widthR= parseInt(vismomap.wrapper.style.width) /2;
		if(widthR > heightR){
			this.settings.projection.radius = heightR;
		}
		else{
			this.settings.projection.radius = widthR;
		}
		
	
		
	}
	,toggleSpin: function(){
		var eMap = this;
		var f = function(){
			var t = eMap.controller.transformation;
			if(!t.rotate) t.rotate = {};
			if(!t.rotate.z) t.rotate.z  = 0;
		
			t.rotate.z += 0.3;
			eMap.controller.setTransformation(t);
			window.setTimeout(f,600);
		};
		f();
	}
	,_createGlobe: function(radius){
		if(VismoUtils.browser.isIE) {return;}
		var ctx = this.vismoClicking.canvas.getContext('2d');
		if(!ctx) return;
		var t =this.controller.transformation;
		var tr =t.translate;
		var s = t.scale;
		var o = t.origin;
		ctx.save();	
		ctx.translate(o.x,o.y);
		ctx.scale(s.x,s.y);
		ctx.translate(tr.x,tr.y);
	
	
		var radgrad = ctx.createRadialGradient(0,0,10,0,0,radius);

		radgrad.addColorStop(0,"#AFDCEC");
		radgrad.addColorStop(0.5, '#00C9FF');
		radgrad.addColorStop(1, '#00B5E2');
		radgrad.addColorStop(1, 'rgba(0,201,255,0)');

		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fillStyle = radgrad;
		ctx.fill();
		ctx.restore();

	}
};



var VismoSlippyMap = function(vismoMap){	
	//vismoMap.resize(512,512);
	this.loadedurls = {};
	this.setupSlippyStaticMapLayer(vismoMap);

        vismoMap.oldDrawFromGeojson = vismoMap.drawFromGeojson
         vismoMap.drawFromGeojson = function(geojson,autosize){
                vismoMap.oldDrawFromGeojson(geojson,false);
        };
        
	return vismoMap;
};

VismoSlippyMap.prototype = {
	getGoogleMercatorProjection: function(vismomap){
		
		var p = {};
		p.source = new Proj4js.Proj('WGS84');//
		p.dest = new Proj4js.Proj('GOOGLE');
		p.resultCache = {};
		var that = this;
		p.getTileServerUrl = function(){
		        return that.tileserverurl;
		}
		p.tilesize = 256;
		p.googleHack = 1/((2 * Math.PI * 6378137) /p.tilesize);
		p.inversexy = function(x,y){
			x /= this.googleHack;
			y /= this.googleHack;
			var pointSource = new Proj4js.Point(x ,y);
			var pointDest = Proj4js.transform(p.dest,p.source, pointSource);

			return pointDest;
		}

		p.calculatescalefactor= function(vismomapscale,res){
			
			if(!res){ 
				if(vismomapscale <= 1){
					return 0;
				}
				else{
					res = 0;
				}
			}
			
			if(vismomapscale <= 1){
				return res;
			}
			else{
				var news = vismomapscale / 2;
				res +=1 ;
				return this.calculatescalefactor(news,res);
			}
		};
		p.xy = function(x,y,t){
			
				if(this.resultCache[x+"|"+y]) {
					return this.resultCache[x+"|"+y];
				}
				var pointSource = new Proj4js.Point(x,y);
				var pointDest = Proj4js.transform(p.source,p.dest, pointSource);


				var newx =pointDest.x;
				var newy = pointDest.y;
				newx *= this.googleHack;
				newy *= this.googleHack;
				
				this.resultCache[x+"|"+y] = {x:newx , y:newy};
				return this.resultCache[x+"|"+y];
				
		}
		return p;
	}
	,setupSlippyStaticMapLayer: function(eMap){
		/*Filename(url) format is /zoom/x/y.png */
		
		var projection = this.getGoogleMercatorProjection(eMap);
		//var projection = {};
		eMap.setTransparency(0.7);
		eMap.settings.projection = projection;
		var that = this;
		
		var mapheight =parseInt(eMap.wrapper.style.height);
		var mapwidth =parseInt(eMap.wrapper.style.width);
		var tileGridDimension = {x:mapwidth/projection.tilesize + 1,y:(mapheight/projection.tilesize) + 1};
		var tiles = this._createTiles(eMap,tileGridDimension.x,tileGridDimension.y);
		var eMap = eMap;
		
		eMap.settings.afterRender = function(transformation){
		        var origin = transformation.origin;
			jQuery(that.tilesWrapper).css({top: origin.y, left: origin.x});
			var zoomOut = false;
			if(eMap.settings.lastScale > transformation.scale.x)
				zoomOut = true;
			eMap.settings.lastScale = transformation.scale.x;
			var x =0,y =0,lo,la, translate= transformation.translate,scale= transformation.scale;
		
			eMap.wrapper.style.backgroundImage = "none";
			var zoomL = projection.calculatescalefactor(scale.x);	
	
				
			var mapheight =parseInt(eMap.wrapper.style.height);
			var mapwidth =parseInt(eMap.wrapper.style.width);
			
			var tile = tiles["main"];
			var left = (scale.x * translate.x);
			var top = (scale.y * translate.y);
			top += (origin.y - 128);
			left += (origin.x - 128);
			tile.style.top = top + "px";
			tile.style.left = left + "px";
			if(zoomL == 0){
				var i;
				for(i in tiles){
					tiles[i].style.backgroundImage ="none";
				}
				zoomL = 0;
				tilex = 0;tiley=0;
				var slippyurl =projection.getTileServerUrl()+zoomL +"/"+tilex+"/"+tiley+".png";
				that.renderTile(slippyurl,zoomL,tilex,tiley,tile);					
			}
			else{
				
				tiles.main.style.backgroundImage = "none";
				var temp ={x: (translate.x),y:(translate.y)};
				temp.x *= scale.x;
				temp.y *= scale.y;				
				temp.x += (origin.x);
				temp.y += (origin.y);
				var tlleft = temp.x;
				var tltop =temp.y;
				//brtop = brtop%(256);
				tlleft= temp.x % 256;
				tltop =  temp.y % 256;
                                if(tltop > 0) tltop -= 256;
                                if(tltop < -256) tltop += 256;
                                if(tlleft < -256) tlleft += 256;
		                if(tlleft > 0) tlleft -= 256;
				var lola;
				
				lola = VismoMapUtils.getLongLatAtXY(tlleft+128,tltop+128,eMap);
			
				var tltilexy =VismoMapUtils.getSlippyTileNumber(lola.longitude,lola.latitude,zoomL,eMap);
				
				for(var idX=0; idX < tileGridDimension.x; idX++){
					for(var idY=0; idY < tileGridDimension.y; idY++){
						var leftShift = idX;
						var upShift = idY;
						var index = idX + "|"+idY;
						var tile = tiles[index];
						var top = tltop + (256 * idY);
						var left = tlleft + (256 *idX);
						var tilex = tltilexy.x + idX;
						var tiley = tltilexy.y + idY;

						
						var numtiles = Math.pow(2,zoomL);
						if(tilex <  0) tilex = numtiles + tilex;
						if(tiley < 0) tiley = numtiles + tiley;
						if(tilex >= numtiles) tilex -= numtiles;
						if(tiley >= numtiles) tiley -= numtiles;
					
						tile.style.left = left +"px";
						tile.style.top = top + "px";
						tile.title = zoomL+"/"+tilex + "/" + tiley;
						var slippyurl ="http://tile.openstreetmap.org/"+zoomL +"/"+tilex+"/"+tiley+".png";
						that.renderTile(slippyurl,zoomL,tilex,tiley,tile);
						
					}

				}
			
		
			}

		};
		
		
	}
	,renderTile: function(weburl,zoomlevel,x,y,tile){
		var that = this;
		var renderTile = function(dest){
			tile.style.backgroundImage = "none";
			var style ="url('"+dest+"')";
			if(style == tile.style.backgroundImage) return;
			tile.style.backgroundImage = style;
			//var numtiles = Math.pw(2,zoomL);

		};
		var renderTileWeb = function(url){
			var style ="url('"+url+"')";
			tile.style.backgroundImage = "none";
			if(style == tile.style.backgroundImage) return;
			tile.style.backgroundImage = style;

		};
		try{	
			var localurl = zoomlevel+ "_"+ x + "_" + y + ".png";
			if(localurl != tile.style.backgroundImage){
				if(that.loadedurls[localurl]){
					renderTile(localurl);
				}
				else{
					tile.style.backgroundImage = "none";
					VismoFileUtils.saveImageLocally(weburl,localurl,renderTile,renderTileWeb);
					that.loadedurls[localurl] = true;
				}
			}
		}
		catch(e){
			tile.style.backgroundImage = "none";
			//console.log("unable to cache static image for this map view. ("+e+")")
		}
	}
	,_createTiles: function(eMap,numtilesx,numtilesy){
		var res = {};
		var tiles = document.createElement("div");
		tiles.style.overflow = "hidden";
		tiles.className = "VismoTileWrapper"
		tiles.style.position= "absolute";
		tiles.style.width = eMap.wrapper.style.width;
		tiles.style.height = eMap.wrapper.style.height;
		var maintile = document.createElement("div");
		maintile.style.position = "absolute";
		maintile.style.width = "256px";
		maintile.style.height = "256px";
		tiles.appendChild(maintile);
		
		for(var y = 0; y < numtilesy; y++){
			for(var x = 0; x < numtilesx; x++){
				var tile = document.createElement("div");
				tile.className = "tile_"+x+ "_"+y;
				tile.style.position = "absolute";
				tile.style.width = "256px";
				tile.style.height = "256px";
				//if(x == 0 && y == 0) tile.style.border = "solid 1px black";
				var index =x+"|"+y;
				tiles.appendChild(tile);
				res[index] = tile;
			}
		}
		
		eMap.wrapper.appendChild(tiles);
		
		res['main'] = maintile;
		return res;
		

		
	}
	
};