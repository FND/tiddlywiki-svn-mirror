function draw() {
	var ctx = $('#canvas')[0].getContext('2d');
	eval('var drawFunc = function() {'+$('#drawingBoard').val()+'};');
	eval('drawFunc();');
	//$('#canvas').html($('#drawingBoard').val());
}

function reset() {
	var canvas = $('#canvas')[0];
	canvas.width = canvas.width;
}

function example(ctx) {
	// Create gradients
	var radgrad = ctx.createRadialGradient(45,45,10,52,50,30);
	radgrad.addColorStop(0, '#A7D30C');
	radgrad.addColorStop(0.9, '#019F62');
	radgrad.addColorStop(1, 'rgba(1,159,98,0)');
	
	var radgrad2 = ctx.createRadialGradient(105,105,20,112,120,50);
	radgrad2.addColorStop(0, '#FF5F98');
	radgrad2.addColorStop(0.75, '#FF0188');
	radgrad2.addColorStop(1, 'rgba(255,1,136,0)');
	
	var radgrad3 = ctx.createRadialGradient(95,15,15,102,20,40);
	radgrad3.addColorStop(0, '#00C9FF');
	radgrad3.addColorStop(0.8, '#00B5E2');
	radgrad3.addColorStop(1, 'rgba(0,201,255,0)');
	
	var radgrad4 = ctx.createRadialGradient(0,150,50,0,140,90);
	radgrad4.addColorStop(0, '#F4F201');
	radgrad4.addColorStop(0.8, '#E4C700');
	radgrad4.addColorStop(1, 'rgba(228,199,0,0)');
	
	// draw shapes
	ctx.fillStyle = radgrad4;
	ctx.fillRect(0,0,150,150);
	ctx.fillStyle = radgrad3;
	ctx.fillRect(0,0,150,150);
	ctx.fillStyle = radgrad2;
	ctx.fillRect(0,0,150,150);
	ctx.fillStyle = radgrad;
	ctx.fillRect(0,0,150,150);
}

$('document').ready(function() {
	var funcString = example.toString();
	var s = funcString.substring(funcString.indexOf('{')+1,funcString.lastIndexOf('}'));
	s = s.replace(/^\n+/,"").replace(/\n+$/,"");
	var $drawingBoard = $('#drawingBoard');
	var exampleText = "// example from https://developer.mozilla.org/en/Canvas_tutorial/Applying_styles_and_colors\n\n";
	$drawingBoard.val(exampleText+s);
	$('#drawButton').click(function() {
		draw();
	});
	$('#reset').click(function() {
		reset();
	});
})

