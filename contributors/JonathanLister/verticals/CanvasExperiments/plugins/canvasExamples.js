function degToRad(deg) {
	return deg * Math.PI / 180;
}

function drawArrowBox(width,angle,offset) {
	var rad = angle ? degToRad(angle) : 0;
	var w = width || 100;
	var r = w/2;
	offset = {
		x: offset.x || 0,
		y: offset.y || 0
	};
	ctx.save();
	ctx.lineWidth = "10";
	ctx.fillStyle = "rgba(50,50,50,0.8)";
	ctx.beginPath();
	ctx.translate(offset.x+r,offset.y+r);
	ctx.rotate(rad);
	ctx.moveTo(-r,r);
	ctx.lineTo(r,r);
	ctx.lineTo(r,-r);
	ctx.lineTo(-r,-r);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(0,-r);
	ctx.lineTo(0,r);
	ctx.moveTo(0,r);
	ctx.lineTo(-r,0);
	ctx.moveTo(0,r);
	ctx.lineTo(r,0);
	ctx.stroke();
	ctx.restore();
}

drawArrowBox(100,0,{x:20,y:20});
/*ctx.fillStyle="rgba(250,250,250,0.8)";
ctx.stroke();*/