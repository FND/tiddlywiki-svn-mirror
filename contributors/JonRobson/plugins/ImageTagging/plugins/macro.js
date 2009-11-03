config.macros.TagImage = {
		renamedTiddlers:{}
		,properties: {
			'src':{}
		}
		,loadedImages:{}
		,addNewComment: function(properties){

			var src= properties.src;
			var title = properties.tiddler;
			var id = properties.id;
			var image = properties.image;
			var pos = properties.position;
			var cc = properties.canvas;
			if(!properties.fill&& config.macros.TagImage.properties[src]) properties.fill = config.macros.TagImage.properties[src].fill; 
			if(!properties.radius && config.macros.TagImage.properties[src]) properties.radius = config.macros.TagImage.properties[src].radius/cc.getTransformation().scale.x; 
			var radius = properties.radius;
			if(!properties.fill) properties.fill = 'rgba(100,100,100,0.2)';
			if(!properties.text) properties.text = "";
			if(properties.event){
				pos = cc.getXY(properties.event);
				properties.position = pos;
			}
			if(!id){
				var tags = store.getValue(store.getTiddler(title),"imagecomments");	
				if(!tags) tags = 0;
				var tiddler = store.getTiddler(title);
				
				tiddler.fields["imagecomments"]= tags+1;	
				id = src+"_tag_"+tags;
			}
			var x= pos.x;
			var y = pos.y;
			var dim = cc.getDimensions();
			
			if(x && y){
				//currently have position from center, want position from top left,radius is also effected by dimensions of image
				x /= image.width;
				y /= image.height;
				radius /= image.width;
				xyr = x +","+y+","+radius;
				var fields = merge({imagexyr: xyr,fill:properties.fill, parentimage: src},config.defaultCustomFields);
				try{
					store.saveTiddler(id,id,properties.text,false,new Date(),"imagetag",fields);
					autoSaveChanges();
				}catch(e){};
				story.displayTiddler(resolveTarget(properties.event),id,DEFAULT_EDIT_TEMPLATE);
				
				properties.radius = radius;
				properties.position = {x:x,y:y};
			}
			properties.id = id;
			//console.log("3");
			this.addComment(properties);
			
			
		}
		,addComment: function(properties){
			var pos = properties.position;
			var cc = properties.canvas;
			var image = properties.image;
			var id = properties.id;	
			var radius = properties.radius;
			//console.log(properties.position,properties.id,properties.canvas,properties.radius);
			if(!pos || !id ||!cc ||!radius) {throw "I'm not happy - you haven't given me enough to work with";return;  }
			var move = function(e,s){
					if(s)cc.title = id;
			};
			var w,h;
			var dim = cc.getDimensions();
			if(image) w =image.width; else w = dim.width;
			if(image) h = image.height; else h = dim.height;
	
			var x = parseFloat(pos.x *w);
			var y = parseFloat(pos.y * h);
			radius *= w;
			
			var props = {'shape':'circle', 'id':id,'lineWidth':'2'};
			if(properties.fill) props.fill = properties.fill;
			var point = new VismoShape(props,[x,y,radius]);
			
			cc.add(point);
			cc.render();
			
		}
		
		,loadTiddlers: function(canvas,tiddler,src,image){
		
			var tids = store.getTiddlers();
			var dim = canvas.getDimensions();
			var offsetleft = (dim.width * 0.5);
			var offsettop = (dim.height * 0.5);
			for(var i=0; i < tids.length; i++){
				var c =tids[i];
				if(!c.fields.parentimage||src == c.fields.parentimage){
				    var imagexyr,x,y,r;
				    if(c.fields["imagexyr"]){
				        imagexyr= c.fields["imagexyr"].split(",");
				        x = imagexyr[0];
				        y = imagexyr[0];
				        r = imagexyr[0];
				    }
				    else{
    					x = (Math.random() * offsetleft) /dim.width;
    					y =  (Math.random() * offsettop) /dim.height;
    				    r= 12.5 / dim.width;					
			        }
					if(!c.fields.fill) c.fields.fill = config.macros.TagImage.properties[src].fill;
					var args = {position:{x:x,y:y},fill:c.fields.fill,radius:r,image:image,canvas:canvas,id:c.title}
				
					this.addComment(args);
				
				}
			}
			
		}
		,loadComments: function(canvas,tiddler,src,image){
			var tid = store.getTiddler(tiddler);
			var comments = store.getTiddlers();
			for(var i=0; i < comments.length; i++){
				var c =comments[i];
				if(c.fields.parentimage && c.fields.parentimage == src){
				    var imagexyr = c.fields.imagexyr.split(",");
					var args = {position:{x: imagexyr[0],y:imagexyr[1]},fill:c.fields.fill,radius:imagexyr[2],image:image,canvas:canvas,id:c.title};

					this.addComment(args);
					
				}
			}
		}
		,setupMouse: function(clickablecanvas,src,title,img){
			var cc = clickablecanvas;
			var el = clickablecanvas.getDomElement();
			var radius = config.macros.TagImage.properties[src].radius;	
		    var controller = cc.vismoController;
			var lookuptiddler = function(id){
				var tiddler =store.getTiddler(id);
				if(tiddler)return tiddler;
				var newname = config.macros.TagImage.renamedTiddlers[id];
				if(!newname) return false;
				else return lookuptiddler(newname);
			}
			var dblclick = function(e,s){
				if(s){
					var tiddler = lookuptiddler(s.getProperty("id"));
					if(tiddler){story.displayTiddler(resolveTarget(e),tiddler.title);return false;}
				}
				if(s && s.getShape() != 'circle') config.macros.TagImage.addNewComment({event: e, canvas:cc,tiddler:title,src:src,image:img});

				
			};
			var box = document.createElement("span");
			jQuery(box).css({border:'solid 1px black',position:"absolute",width:radius*2,height:radius*2,'z-index': 2});
			
			


			var key = function(e){
 
				var code;
				if(e.which)code = e.which;
				if(e.keyCode) code = e.keyCode;
								
				if(code === 45){//zoom out
				if(config.macros.TagImage.properties[src].radius <= 5) return;
				config.macros.TagImage.properties[src].radius -=5;
				}
				
				if(code == 61){//zoom in
				config.macros.TagImage.properties[src].radius +=5;
				
				}
				var diameter = config.macros.TagImage.properties[src].radius * 2;
				jQuery(box).css({width: diameter, height: diameter});
			};


			var selectedshape = false;
			var beginmoving = false;
			var checkformouseup= function(){
				if(!selectedshape) return;
				if(selectedshape.getShape() == 'image') return;
				beginmoving = true;
				el.style.cursor = 'move';
				box.style.display = "none";
				controller.disable();
			};
			
			var cancel = function(){
				controller.enable();
				box.style.display = "";
				autoSaveChanges();
				beginmoving = false;selectedshape = false;
			};
			var oldclick = el.onclick;
			el.onclick = function(e){cancel();if(oldclick)oldclick(e);};
			var curpos;
			var moveit = function(){
				var pos = curpos;
				if(selectedshape){
					s = selectedshape;
					var coordinates = s.getCoordinates("normal");
					pos.r = coordinates[2];
					//console.log(s,r);
					s.moveTo(pos.x,pos.y);
					//console.log(s); 
					clickablecanvas.render();
				
					var x = pos.x/ img.width;
					var y = pos.y / img.height;
					var r = pos.r/ img.width; 
					var tid = store.getTiddler(s.getProperty("id"));
					tid.fields["imagexyr"] = x+","+y+","+r;
					
				}
			};
			var movethoseshapes = function(e,s,pos){
				if(!beginmoving) {return true;}
				curpos = VismoTransformations.undoTransformation(pos.x,pos.y,clickablecanvas.getTransformation());
				window.setTimeout(moveit,100);
				return false;
			};
			
			
			var move = function(e,s){
				var pos = VismoClickingUtils.getMouseFromEvent(e);
				var cont = movethoseshapes(e,s,pos);
				if(!cont) return;
				var radius = config.macros.TagImage.properties[src].radius;

				jQuery(box).css({top:pos.y-(radius),left:pos.x -(radius)});
				if(s && s.getProperty("id")){
					var tiddler = lookuptiddler(s.getProperty("id"));
					if(tiddler) box.title = tiddler.title;
					box.style.cursor = "pointer";
				}else {
				box.style.cursor = "";
				box.title = "";
				}
			};
			
			
			jQuery(box).mousedown(function(e){e.preventDefault();return false;});
			jQuery(box).mouseup(function(e){e.preventDefault();return false;});
			jQuery(box).mousemove(function(e){e.preventDefault();return false;});
			jQuery(box).mouseout(function(e){e.preventDefault();return false;});
			jQuery(box).mouseover(function(e){e.preventDefault();return false;});
			
			jQuery(".vismoControls",".TagImage").mouseover(function(e){
			    jQuery(box).css({display:"none"});
			});
			
			jQuery(".vismoControls",".TagImage").mouseout(function(e){
			    jQuery(box).css({display:""});
			});
		
			var onmousedown = function(e,s){ beginmoving = false;selectedshape = s; window.setTimeout(checkformouseup,100);};
			var onmouseup = function(e,s){cancel(); window.setTimeout(cancel,200);};
			el.appendChild(box);
			clickablecanvas.mouse({down:onmousedown,up:onmouseup,move:move,dblclick:dblclick,keypress:key});

		}
		,handler: function(place,macroName,paramlist,wikifier,paramString,tiddler){
			var tiddlerDom = story.findContainingTiddler(place);

			
			var src,requestedwidth,requestedheight, maxwidth,maxheight;
			var params = paramString.parseParams("anon",null,true,false,false);
			if(getParam(params,"src")) {
				src= getParam(params,"src");
			}else{
				src = paramlist[0];
			}

			requestedwidth= getParam(params,"width");
			requestedheight= getParam(params,"height");
			maxwidth= parseInt(getParam(params,"maxwidth"));
			maxheight= parseInt(getParam(params,"maxheight"));
			filter = getParam(params,"filter");

			
			var id= parseInt(getParam(params,"id"));
			var title = tiddlerDom.getAttribute("tiddler");
			var newel = document.createElement("div");
			//newel.style.overflow = "hidden";
			newel.className = "TagImage";
			
			var w = 100,h = 100;
			if(requestedwidth) w = parseInt(requestedwidth);
			if(requestedheight)h = parseInt(requestedheight);
			if(maxwidth)w =maxwidth;
		
			jQuery(newel).css({width: w, height: h,overflow:"hidden"});
			


			if(id)newel.id = id;
			var img = new Image();
			if(src)img.src = src;
			
	        place.appendChild(newel);
			jQuery(newel).css({position:"relative"});
			var cc = new VismoCanvas(newel,{vismoController:{controls:["pan","zoom"]}});
			var tags = 0;
			var numcomments = store.getValue(store.getTiddler(title),"imagecomments");	
			if(numcomments) tags = numcomments;
			
			
			var setup = function(filter){
			  
				config.macros.TagImage.loadedImages[src] = true;
				var width,height;
				var ratio;
				var radius = getParam(params,"radius");
				if(!radius) radius = 12.5;

				if(img.width > 0 && img.height > 0){
					if(requestedwidth && requestedheight){
							img.width = requestedwidth;
							img.height = requestedheight;
					}
					else if(requestedwidth && !requestedheight) {
						var original = img.width;
						ratio = original /  requestedwidth;
						img.width = requestedwidth;
						img.height = img.height / ratio;
					}
					else if(requestedheight && !requestedwidth) {
						var original = img.height;
						ratio = original /  requestedheight;
						img.height = requestedheight;
						img.width = img.width / ratio;
					}
					height = img.height;
					width = img.width;
					
					var ewidth = width;
					var eheight = height;
					if(maxwidth && maxwidth < width) {
						ewidth = maxwidth;
					}
					if(maxheight && maxheight < height) {
						eheight = maxheight;
					}
					cc.resize(ewidth,eheight);

					var imgproperties = {shape:'image',src:src,width:width,height:height};
					cc.add(new VismoShape(imgproperties,[0,0]));					
				}
				else{
					src= "false";

				}


				config.macros.TagImage.properties[src] = {};
				config.macros.TagImage.properties[src].fill = getParam(params,"fill");
				config.macros.TagImage.properties[src].radius =radius;				
	
			 
				cc.render();



				config.macros.TagImage.setupMouse(cc,src,title,img);
				
				
				if(!filter)config.macros.TagImage.loadComments(cc,title,src,img);
				else config.macros.TagImage.loadTiddlers(cc,title,src,img);
			};

			if(img.complete){
					setup(filter);
			}
			else{
					img.onload = function(){	
						setup(filter);
					}
				
			}
		}
};


store.oldSaveTiddler = store.saveTiddler;
store.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created){
	if(newTitle && title != newTitle)config.macros.TagImage.renamedTiddlers[title] = newTitle;
	this.oldSaveTiddler(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created);

};
