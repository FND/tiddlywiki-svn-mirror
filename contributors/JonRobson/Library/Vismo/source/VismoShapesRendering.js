
var VismoCanvasRenderer = {
	renderShape: function(canvas,vismoShape){
	    var ctx = canvas.getContext('2d');
		var shapetype =vismoShape.properties.shape;
		if(vismoShape.properties["lineWidth"]){
			ctx.lineWidth = vismoShape.getProperty("lineWidth");
		}
		
		ctx.save();
                
		ctx.beginPath();
		if(shapetype == 'point' || shapetype =='circle'){
			this.renderPoint(ctx,vismoShape);
		}
		else if(shapetype =='image'){
			this.renderImage(ctx,vismoShape);
		}
		else if(shapetype == "path"){
            this.renderPath(ctx,vismoShape);
		}
		else{	
			this.renderPath(ctx,vismoShape,true);	
			ctx.closePath();
		        
		}
		
		ctx.strokeStyle = vismoShape.getProperty("stroke")
		if(typeof vismoShape.getProperty("fill") == 'string') 
			fill = vismoShape.getProperty("fill");
		else
			fill = "#ffffff";


		ctx.stroke();
		if(shapetype != 'path') {
			ctx.fillStyle = fill;
			ctx.fill();
		}
	        ctx.restore();
                
                
	        
	}
	,renderPath: function(ctx,vismoShape,join){
		var move = true,quadraticCurve = false,bezierCurve = false;
		var c = vismoShape.getCoordinates();
		var t =vismoShape.getProperty("transformation");
		if(!t) t= {};
		//ctx.save(); //issue with this in safari..
		if(!t.translate)t.translate = {x:0,y:0};
		if(!t.scale) t.scale = {x:1,y:1};
		    

		//ctx.scale(t.scale.x,t.scale.y);
		if(!t.translate.y) t.translate.y = 0;
		if(!t.translate.x) t.translate.x = 0;
		if(!t.scale.x) t.scale.x = 1;
		if(!t.scale.y) t.scale.y = 1;

		var bb = vismoShape.grid;
		if(bb.center){
		    ctx.translate(bb.center.x-(bb.center.x*t.scale.x),bb.center.y-(bb.center.y*t.scale.y));
            ctx.scale(t.scale.x,t.scale.y);	
            ctx.translate(t.translate.x,t.translate.y);
        }
		var bb = vismoShape.grid;
		for(var i=0; i < c.length-1; i+=2){
            var isCoord =VismoShapeUtils._isCoordinate(c[i]);
			if(!isCoord){

				if(c[i] == "M"){
				    move=true;
			    }
			    else if(c[i] == "q"){
			        quadraticCurve = true;
			    }
			    else if(c[i] == "c"){
			        bezierCurve = true;
			    }
			    i+=1;
			}
			var x = parseFloat(c[i]);
			var y = parseFloat(c[i+1]);	
			
			if(move){ 
				ctx.moveTo(x,y);
			
				move = false;
			}
			else if(quadraticCurve){
			    var x2 = parseFloat(c[i+2]);
			    var y2 = parseFloat(c[i+3]);

			    i+= 2;
			    ctx.quadraticCurveTo(x,y,x2,y2);
			}
			else if(bezierCurve){
			    var x2 = parseFloat(c[i+2]);
			    var y2 = parseFloat(c[i+3]);
                var x3 = parseFloat(c[i+4]);
                var y3 = parseFloat(c[i+5]);
			    i+= 4;
			    ctx.bezierCurveTo(x,y,x2,y2,x3,y3);			    
			}
			else{
			       
				ctx.lineTo(x,y);
			}			
				
				
		}
	
		//ctx.restore(); //issue with this in safari..
	}
	,renderPoint: function(ctx,vismoShape){
	        //ctx.restore();
		//ctx.save();
		var bb =vismoShape.getBoundingBox();
		var dim =vismoShape.getDimensions();
		var radiusx = dim.width / 2;
		var radiusy = dim.height/2;
		
		var transform = vismoShape.getTransformation();
		if(transform && transform.scale) radiusx*= transform.scale.x;
		//ctx.save();
		if(radiusx > radiusy) {
		    //ctx.scale(radiusx/radiusy,1)
		}
		else if(radiusy > radiusx){
		    //
		    //ctx.scale(1,radiusy/radiusx)
		    //ctx.restore();
		}
		ctx.arc(bb.center.x, bb.center.y, radiusx, 0, Math.PI*2,true);
	    
	}
	,renderImage: function(ctx,vismoShape){
		var c = vismoShape.getCoordinates();
		var bb = vismoShape.getBoundingBox();
		var draw = function(){
		        if(vismoShape.ready)ctx.drawImage(vismoShape.image,bb.x1,bb.y1,bb.width,bb.height);
		        else window.setTimeout(draw,100);
		};
                draw();

	}
};


