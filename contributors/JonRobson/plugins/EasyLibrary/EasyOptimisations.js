var EasyOptimisations = {
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
			var splice1 = EasyOptimisations.douglasPeucker(coords,tolerance,start+1,ref);
			var splice2 = EasyOptimisations.douglasPeucker(coords,tolerance,ref,end);
			results = results.concat(splice1);
			results = results.concat(splice2);
			results.push(coords[end]);
			return results;
		}
		
	}
   
};