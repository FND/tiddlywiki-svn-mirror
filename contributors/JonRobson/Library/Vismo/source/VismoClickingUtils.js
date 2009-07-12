var VismoClickingUtils = {
        //to be implemented..
        inVisibleArea: function(vismoCanvas,vismoShape){
                var bb = vismoShape.getBoundingBox();
                return true;
        }
        ,scrollXY: function(){
          var scrOfX = 0, scrOfY = 0;
          if( typeof( window.pageYOffset ) == 'number' ) {
            //Netscape compliant
            scrOfY = window.pageYOffset;
            scrOfX = window.pageXOffset;
          } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
            //DOM compliant
            scrOfY = document.body.scrollTop;
            scrOfX = document.body.scrollLeft;
          } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
            //IE6 standards compliant mode
            scrOfY = document.documentElement.scrollTop;
            scrOfX = document.documentElement.scrollLeft;
          }
          return {x: scrOfX,y: scrOfY};
        }
	,getRealXYFromMouse: function(e,t){
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
		
		if(e && e.srcElement)
			obj = e.srcElement;
	        else if(e.target)
        	        obj = e.target;
        	else{
	                obj = false;
	        }
	        try{
                        var x = obj.parentNode;
                }catch(e){return false;}
                /*
		if(obj && obj.nodeType && obj.nodeType == 3) // defeat Safari bug
			obj = obj.parentNode;
			*/
			
			/*try{
                                var x = obj.parentNode;
                        }
                        catch(e){return false;};*/
	        return obj;

		//return obj;
	}
	
	
	,getMouseFromEvent : function(e,target){
			if(!e) e = window.event;
			
			if(!target){
			       
			        var target = this.resolveTargetWithVismo(e);
			        if(!target)return false;
                        }
                        
			var offset = jQuery(target).offset();
               
                        var i;
          
			if(typeof(offset.left) != 'number') return false;
		
		        var scroll = this.scrollXY(e);
			x = e.clientX + scroll.x;
			y = e.clientY + scroll.y;
			//alert(x +"/"+y);
			x -= offset.left;
			y-=  offset.top;
			
			return {'x':x, 'y':y};		
			
	}
	,getMouseFromEventRelativeToTarget : function(e,target){
			if(!e) e = window.event;
			if(!target)return false;

			var offset = jQuery(target).offset();

			
			if(!offset.left) return false;
			var scroll = this.scrollXY();
			x = e.clientX + scroll.x - offset.left;
			y = e.clientY + scroll.y - offset.top;
			return {'x':x, 'y':y};		
			
	}

	,resolveTargetWithVismo: function(e)
	{
		var node = VismoClickingUtils.resolveTarget(e);
                

                
		if(!node)return false;
		var hasVismo = false;
     
                
		while(!hasVismo && node != document && node.parentNode && node.parentNode != document){
		        
		        if(node.vismoCanvas || node.vismoController){
		                hasVismo = true;
			}
			else{
			        node= node.parentNode;
			}
		}
		
		if(!node) return false;
		return node;
	}
	,getMouseFromEventRelativeToElement: function (e,x,y,target){
		if(!e) e = window.event;

		var offset = jQuery(target).offset();
		if(!offset.left) return false;
		
		var scroll = this.scrollXY();
		oldx = e.clientX + scroll.x - offset.left;
		oldy = e.clientY + scroll.y - offset.top;
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
		var target = this.resolveTargetWithVismo(e);
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

