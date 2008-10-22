function Drawing(object){
	this.OUTLINE = 0;
	this.FILL = 1;

	this.BUTT = "butt";
	this.ROUND = "round";
	this.SQUARE = "square";

	this.context = null;

	this.clear = funcClear;
	this.clipCircle = funcClipCircle;
	this.clipRectangle = funcClipRectangle;
	this.drawArc = funcDrawArc;
	this.drawBezier = funcDrawBezier;
	this.drawFloor = funcDrawFloor;
	this.drawRectangle = funcDrawRectangle;
	this.drawTriangle = funcDrawTriangle;
	this.drawWall = funcDrawWall;
	this.initialize = funcInitialize;
	this.setFillColor = funcSetFillColor;
	this.setFillColorA = funcSetFillColorA;
	this.setLineColor = funcSetLineColor;
	this.setLineColorA = funcSetLineColorA;
	this.setLineStyle = funcSetLineStyle;
	this.textureSphere = funcTextureSphere;

	function funcClear(x1, y1, x2, y2){
		this.context.clearRect(x1, y1, x2-x1, y2-y1);
	}
	function funcInitialize(canvas){
		this.context = canvas.getContext("2d");
	}
	function funcSetFillColor(red, green, blue){
		red=(red>255)?255:((red<0)?0:Math.floor(red));
		green=(green>255)?255:((green<0)?0:Math.floor(green));
		blue=(blue>255)?255:((blue<0)?0:Math.floor(blue));
		this.context.fillStyle = "rgb("+red+", "+green+", "+blue+")";
	}
	function funcSetFillColorA(red, green, blue, alpha){
		red=(red>255)?255:((red<0)?0:Math.floor(red));
		green=(green>255)?255:((green<0)?0:Math.floor(green));
		blue=(blue>255)?255:((blue<0)?0:Math.floor(blue));
		alpha=((alpha>255)?255:((alpha<0)?0:Math.floor(alpha)))/255;
		this.context.fillStyle = "rgba("+red+", "+green+", "+blue+", "+alpha+")";
	}
	function funcSetLineColor(red, green, blue){
		red=(red>255)?255:((red<0)?0:Math.floor(red));
		green=(green>255)?255:((green<0)?0:Math.floor(green));
		blue=(blue>255)?255:((blue<0)?0:Math.floor(blue));
		this.context.strokeStyle = "rgb("+red+", "+green+", "+blue+")";
	}
	function funcSetLineColorA(red, green, blue, alpha){
		red=(red>255)?255:((red<0)?0:Math.floor(red));
		green=(green>255)?255:((green<0)?0:Math.floor(green));
		blue=(blue>255)?255:((blue<0)?0:Math.floor(blue));
		alpha=((alpha>255)?255:((alpha<0)?0:Math.floor(alpha)))/255;
		this.context.strokeStyle = "rgba("+red+", "+green+", "+blue+", "+alpha+")";
	}
	function funcSetLineStyle(width, style){
		this.context.lineWidth = (width<1)?1:width;
		if(style==this.BUTT)
			this.context.lineJoin = "butt";
		else if(style==this.ROUND)
			this.context.lineJoin = "round";
		else if(style==this.SQUARE)
			this.context.lineJoin = "square";
	}
	function funcClipCircle(centerx, centery, radius){
		this.context.beginPath();
		this.context.arc(centerx, centery, radius, 0, Math.PI*2, false);
		this.context.clip();
	}
	function funcClipRectangle(x1, y1, x2, y2){
		this.context.beginPath();
		this.context.strokeRect(x1, y1, x2-x1, y2-y1);
		this.context.clip();
	}
	function funcDrawArc(centerx, centery, radius, angle1, angle2, style){
		this.context.beginPath();
		this.context.arc(centerx, centery, radius, angle1*Math.PI/180, angle2*Math.PI/180, false);
		if(style)
			this.context.fill();
		else
			this.context.stroke();
	}
	function funcDrawBezier(contx1, conty1, contx2, conty2, x, y, style){
		this.context.beginPath();
		this.context.moveTo(x, y);
		this.context.bezierCurveTo(contx1, conty1, contx2, conty2, x, y);
		if(style)
			this.context.fill();
		else
			this.context.stroke();
	}
	this.drawCircle = function(centerx, centery, radius, style){
		this.context.beginPath();
		this.context.arc(centerx, centery, radius, 0, Math.PI*2, false);
		if(style)
			this.context.fill();
		else
			this.context.stroke();
	}
	this.drawImage = function(x1, y1, x2, y2, img, angle){
		if(x2<x1) x2=x1+1;
		if(y2<y1) y2=y1+1;
		var centerx = Math.round(x1+x2)>>1;
		var centery = Math.round(y1+y2)>>1;

		this.context.save();
		this.context.translate(centerx, centery);
		if(angle) this.context.rotate(angle*Math.PI/180);
		this.context.drawImage(img, x1-centerx, y1-centery, x2-x1, y2-y1);
		this.context.restore();
	}
	this.drawLine = function(x1, y1, x2, y2){
		this.context.beginPath();
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
		this.context.stroke();
	}
	this.drawQuad = function(x1, y1, x2, y2, x3, y3, x4, y4, style){
		this.context.beginPath();
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
		this.context.lineTo(x3, y3);
		this.context.lineTo(x4, y4);
		this.context.closePath;
		if(style)
			this.context.fill();
		else
			this.context.stroke();
	}
	function funcDrawRectangle(x1, y1, x2, y2, style, angle){
		if(angle){
			var centerx = (x1+x2)>>1;
			var centery = (y1+y2)>>1;

			this.context.save();
			this.context.translate(centerx, centery);
			this.context.rotate(angle*Math.PI/180);
			if(style)
				this.context.fillRect(x1-centerx, y1-centery, x2-x1, y2-y1);
			else
				this.context.strokeRect(x1-centerx, y1-centery, x2-x1, y2-y1);
			this.context.restore();
		}else{
			if(style)
				this.context.fillRect(x1, y1, x2-x1, y2-y1);
			else
				this.context.strokeRect(x1, y1, x2-x1, y2-y1);
		}
	}
	function funcDrawTriangle(x1, y1, x2, y2, x3, y3, style){
		this.context.beginPath();
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
		this.context.lineTo(x3, y3);
		this.context.closePath;
		if(style)
			this.context.fill();
		else
			this.context.stroke();
	}

	function funcDrawFloor(x1, x2, y1, x3, x4, y2, img){
		x1 = x1|0;
		x2 = x2|0;if(x2==x1) x2++;
		y1 = y1|0;
		x3 = x3|0;
		x4 = x4|0;if(x4==x3) x4++;
		y2 = y2|0;if(y2==y1) y2++;
		var dx1 = x2-x1, dx2 = x4-x3, dy = y2-y1;
		var absdy=(dy>0)?dy:(-dy);

		var sourceW = img.width-1, sourceY = (img.height-1)*dx2/dy;
		var destX = (x3-x1)/dy, destW = (dx2-dx1+1)/dy;
		var tempY = 0;
		var destW2 = 0;

		var scalesign = dy<0?-1:1;
		var fullscale = (3*scalesign/2+dy/img.height)|0;
		var absscale = (fullscale>0)?fullscale:(-fullscale);

		while((tempY<0?-tempY:tempY)<=absdy){
			destW2 = dx1+(destW*tempY)|0;
			this.context.drawImage(img, 0, (sourceY*tempY/destW2)|0, sourceW, 1, x1+(destX*tempY)|0, tempY+y1, destW2, absscale);
			tempY+=fullscale;
		}
		
	}
	function funcDrawWall(x1, y1, y2, x2, y3, y4, img){
		x1 = x1|0;
		y1 = y1|0;
		y2 = y2|0;if(y2==y1) y2++;
		x2 = x2|0;if(x2==x1) x2++;
		y3 = y3|0;
		y4 = y4|0;if(y4==y3) y4++;
		var dx = x2-x1, dy1 = y2-y1, dy2 = y4-y3;
		var absdx=(dx>0)?dx:(-dx);

		var sourceH = img.height-1, sourceX = (img.width-1)*dy2/dx;
		var destY = (y3-y1)/dx, destH = (dy2-dy1+1)/dx;
		var tempX = 0;
		var destH2 = 0;

		var scalesign = dx<0?-1:1;
		var fullscale = (3*scalesign/2+dx/img.width)|0;
		var absscale = (fullscale>0)?fullscale:(-fullscale);

		while((tempX<0?-tempX:tempX)<=absdx){
			destH2 = dy1+(destH*tempX)|0;
			this.context.drawImage(img, (sourceX*tempX/destH2)|0, 0, 1, sourceH, tempX+x1, y1+(destY*tempX)|0, absscale, destH2);
			tempX+=fullscale;
		}	
	}

	function funcTextureSphere(x, y, radiusx, radiusy, img, offset, block){
		offset = offset * Math.PI / 180;
		yinc = block/radiusy;
		xscale = img.width / Math.PI / 2;
		yscale = img.height / Math.PI;
		
		for(lat=-Math.PI/2;lat<Math.PI/2;){
			latCos = radiusx * Math.cos(lat);
			newY = Math.round(y + radiusy * Math.sin(lat));
			sourceY = Math.round((lat+Math.PI/2) * yscale);
			xinc = block/(radiusx*Math.cos(lat));

			for(long=0;long<Math.PI;){
				longCos=Math.cos(long)
				this.context.drawImage(img, Math.round((long+offset) * xscale), sourceY, block, block, Math.round(x - latCos * longCos), newY, block, block);
				long = Math.acos(longCos-xinc);
			}
			lat = Math.asin(yinc+Math.sin(lat))
		}
	}

}
Draw = new Drawing();