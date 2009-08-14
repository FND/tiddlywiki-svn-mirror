var VismoOptimisations = {
    minradius:5,
	packCoordinates: function(coordlist){
		var res = [];
		for(var i=0; i < coordlist.length-1; i+=2){
			res.push([coordlist[i],coordlist[i+1]]);
		}
		
		return res;
	}
	,unpackCoordinates: function(coordlist){
		var res = [];
		for(var i=0; i < coordlist.length; i+=1){
			res.push(coordlist[i][0]);
			res.push(coordlist[i][1]);
		}
		return res;	
	}
	//coords in form [[x1,y1],[x2,y2]]
	,douglasPeucker: function(coords,tolerance, start,end){
		var results = [];

		if(!start) start = 0;
		if(!end) end = coords.length - 1;
		if(start >= coords.length || end >= coords.length || start == end -1){
			return [];
		}	
		var midpoint = {};
	
	
		midpoint.x = (coords[end][0] + coords[start][0]) /2;
		midpoint.y = (coords[end][1] + coords[start][1]) /2;
		
		var bestPoint = {distance:-1, index:-1};
		for(var i=start+1; i < end; i++){
			var x = coords[i][0];
			var y = coords[i][1];
			var deltax = midpoint.x - x;
			var deltay= midpoint.y - y;
			
			var perpendicular_d = Math.sqrt((deltax * deltax ) + (deltay *deltay)); //this is not perpendicular distancd.. i think!
			if(perpendicular_d > bestPoint.distance){
				bestPoint.index = i;
				bestPoint.distance = perpendicular_d;
			}
		}
	
		if(bestPoint.index ==-1 || bestPoint.distance<tolerance){
			var res = [];
			res.push(coords[start]);
			//res.push(coords[end])
			return res; //none of these points are interesting except last
		}
		else{
			results.push(coords[start]);
			var ref = bestPoint.index;
			var splice1 = VismoOptimisations.douglasPeucker(coords,tolerance,start+1,ref);
			var splice2 = VismoOptimisations.douglasPeucker(coords,tolerance,ref,end);
			results = results.concat(splice1);
			results = results.concat(splice2);
			results.push(coords[end]);
			return results;
		}
		
	}
  
	,vismoShapeIsInVisibleArea: function(vismoShape,canvas,transformation){
	    var t1= new Date();
		var left = 0,top = 0;
		var right =  parseInt(canvas.width) + left; 
		var bottom = parseInt(canvas.height) + top;
		var topleft =  VismoClickingUtils.undotransformation(left,top,transformation);
		var bottomright =  VismoClickingUtils.undotransformation(right,bottom,transformation);				
		var frame = {};
		frame.top = topleft.y;
		frame.bottom = bottomright.y;
		frame.right = bottomright.x;
		frame.left = topleft.x;
		var g = vismoShape.getBoundingBox();
		var t2 = new Date();
        VismoTimer["shape_visiblearea"] += (t2-t1);
           
		if(g.x2 < frame.left) {
			return false;}
		if(g.y2 < frame.top) {
			return false;}
		if(g.x1 > frame.right){
			return false;
		}
		if(g.y1 > frame.bottom){
			return false;	
		}
		
		return true;
	}
	
	,vismoShapeIsTooSmall: function(vismoShape,transformation){
	    VismoTimer.start("VismoOptimisations.vismoShapeIsTooSmall");

		if(!transformation ||!transformation.scale) {
		    VismoTimer.end("VismoOptimisations.vismoShapeIsTooSmall");
		    return false;
		}
		var g = vismoShape.getBoundingBox();
		var s = transformation.scale;
		var t1 = (g.width) * s.x;
		var t2 =(g.height) * s.y;

       
		if(t2 < this.minradius&& t1 < this.minradius) 
			{
			  VismoTimer.end("VismoOptimisations.vismoShapeIsTooSmall");
                    return true;}//too small
		else{
		   VismoTimer.end("VismoOptimisations.vismoShapeIsTooSmall");
			return false;
		}
		VismoTimer.end("VismoOptimisations.vismoShapeIsTooSmall");
	}

};