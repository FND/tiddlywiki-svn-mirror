
var VismoClickingUtils = {
	getRealXYFromMouse: function(e,t){
		var newpos =VismoClickingUtils.getMouseFromEvent(e);
		newpos = VismoClickingUtils.undotransformation(newpos.x,newpos.y,t);
		return newpos;
	}
	
	,undotransformation: function(x,y,transformation){ //porting to VismoTransformations?
		return VismoTransformations.undoTransformation(x,y,transformation);
	}	
	,resolveTarget:function(e)
	{
		if(!e) e = window.event;
		var obj;
		if(e.target)
			obj = e.target;
		else if(e.srcElement)
			obj = e.srcElement;
	        else{
	                return false;
	        }
		/*if(obj && obj.nodeType && obj.nodeType == 3) // defeat Safari bug
			obj = obj.parentNode;*/
		return obj;
	}
	
	
	,getMouseFromEvent : function(e,target){
			if(!e) e = window.event;
			
			if(!target){
			        var target = this.resolveTargetWithVismoClicking(e);
			        if(!target)return false;
                        }
                        
			var offset = jQuery(target).offset();
               
                        var i;
          
			if(typeof(offset.left) != 'number') return false;
		
			x = e.clientX + window.findScrollX() - offset.left;
			y = e.clientY + window.findScrollY() - offset.top;
			return {'x':x, 'y':y};		
			
	}
	,getMouseFromEventRelativeToTarget : function(e,target){
			if(!e) e = window.event;
			if(!target)return false;

			var offset = jQuery(target).offset();

			
			if(!offset.left) return false;
			x = e.clientX + window.findScrollX() - offset.left;
			y = e.clientY + window.findScrollY() - offset.top;
			return {'x':x, 'y':y};		
			
	}

	,resolveTargetWithVismoClicking: function(e)
	{
		var node = VismoClickingUtils.resolveTarget(e);
		var first = node;
		while(node && node.parentNode && !node.vismoClicking){
			node = node.parentNode;
		}
		if(!node) node = first;
		return node;
	}
	,getMouseFromEventRelativeToElement: function (e,x,y,target){
		if(!e) e = window.event;

		var offset = jQuery(target).offset();
		if(!offset.left) return false;
		
		oldx = e.clientX + window.findScrollX() - offset.left;
		oldy = e.clientY + window.findScrollY() - offset.top;
		var pos = {'x':oldx, 'y':oldy};

		if(!pos) return false;
		pos.x -= x;
		pos.y -= y;
		

		return pos;
		
	}

	,getMouseFromEventRelativeTo: function (e,x,y){
	
		var pos = this.getMouseFromEvent(e);
		if(!pos) return false;
		pos.x -= x;
		pos.y -= y;

		return pos;
	
	}
	,getMouseFromEventRelativeToElementCenter: function(e){ /*redundant?? */
		var w,h;
		var target = this.resolveTargetWithVismoClicking(e);
		if(!target)return;
		if(target.style.width)
			w = parseInt(target.style.width);
		else if(target.width)
			w =parseInt(target.width);

		if(target.style.height)
			h = parseInt(target.style.height);
		else if(target.height)
			h = parseInt(target.height);
	
		if(!w || !h) throw "target has no width or height (vismomaputils)";
	
		return this.getMouseFromEventRelativeTo(e,w/2,h/2);
	}	
	

};

