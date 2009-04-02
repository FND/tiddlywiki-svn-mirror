var EasyTransformations= {
	clone: function(transformation){
	
		var t = {};
		t.translate = {x:0,y:0};
		t.scale = {x:1,y:1};

		if(transformation.translate && transformation.translate.x){
			t.translate.x = transformation.translate.x;
			t.translate.y = transformation.translate.y;
		}
		
		if(transformation.scale && transformation.scale.x){
			t.scale.x = transformation.scale.x;
			t.scale.y = transformation.scale.y;		
		}
		
		return t;
	}
	,applyTransformation: function(x,y,t){

		var res= {};
		res.x = x;
		res.y = y;



		if(t.translate){
			res.x +=  t.translate.x;
			res.y += t.translate.y;
		}
		if(t.scale){
			res.x *= t.scale.x;
			res.y *= t.scale.y;
		}

		if(t.origin){
			res.x += t.origin.x;
			res.y += t.origin.y;
		}
		return res;
		
	}
	,mergeTransformations: function(a,b){
		if(!b) return a;
		if(!a) return b;
		
		var result = {};
		var i;
		for(i in a){
			result[i] = a[i];
		}
		
		for(i in b){
			if(result[i]){
				var oldt = result[i];
				var newt = b[i];
				
				result[i].x = oldt.x + newt.x;
				result[i].y = oldt.y + newt.y;
			}
			else{
				result[i] = b[i];
			}
		}
		return result;
	}
	,undoTransformation: function(x,y,transformation){
		var pos = {};
		var t =transformation;
		var tr =t.translate;
		var s = t.scale;
		var o = t.origin;
		if(!s || !o || !tr) return false;
		
		if(!x || !y) 
			return false;
		pos.x = x;
		pos.y = y;
		pos.x -= o.x;
		pos.y -= o.y;
		
		if(pos.x != 0)
			pos.x /= s.x;
		
		if(pos.y != 0)
			pos.y /= s.y;
			
		pos.x -= tr.x;
		pos.y -= tr.y;			
		return pos;	
	}
	,getXY: function(e,t){
		var pos =EasyClickingUtils.getMouseFromEvent(e);
		return this.undoTransformation(pos.x,pos.y,t);
	}
};