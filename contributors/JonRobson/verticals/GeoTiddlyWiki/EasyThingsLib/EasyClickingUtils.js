
var EasyClickingUtils = {
	undotransformation: function(x,y,transformation){
	
		var pos = {};
		var t =transformation;
		var tr =t.translate;
		var s = t.scale;
		var o = t.origin;
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
	,resolveTarget:function(e)
	{
		if(!e) e = window.event;
		var obj;
		if(e.target)
			obj = e.target;
		else if(e.srcElement)
			obj = e.srcElement;
		if(obj.nodeType == 3) // defeat Safari bug
			obj = obj.parentNode;
		return obj;
	}
	
	
	,getMouseFromEvent : function(e){
			if(!e) e = window.event;
			var target = this.resolveTargetWithEasyClicking(e);
			if(!target)return false;

			var offset = jQuery(target).offset();

			
			if(!offset.left) return false;
			x = e.clientX + window.findScrollX() - offset.left;
			y = e.clientY + window.findScrollY() - offset.top;
			return {'x':x, 'y':y};		
			
	}


	,resolveTargetWithEasyClicking: function(e)
	{
		var node = EasyClickingUtils.resolveTarget(e);
		var first = node;
		while(node && !node.easyClicking){
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
	,getMouseFromEventRelativeToCenter: function(e){
		var w,h;
		var target = this.resolveTargetWithEasyClicking(e);
		if(!target)return;
		if(target.style.width)
			w = parseInt(target.style.width);
		else if(target.width)
			w =parseInt(target.width);

		if(target.style.height)
			h = parseInt(target.style.height);
		else if(target.height)
			h = parseInt(target.height);
	
		if(!w || !h) throw "target has no width or height (easymaputils)";
	
		return this.getMouseFromEventRelativeTo(e,w/2,h/2);
	}	
	

};

