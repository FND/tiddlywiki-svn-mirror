
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
			
			if(x && y){
				var fields = merge({radius:radius+"",fill:properties.fill, tagx: ""+x, tagy: ""+y, parentimage: src},config.defaultCustomFields);
				store.saveTiddler(id,id,properties.text,false,new Date(),"comment",fields);
				autoSaveChanges();
			}
			properties.id = id;
			this.addComment(properties);
			story.displayTiddler(null,id,DEFAULT_EDIT_TEMPLATE);
			
		}
		,addComment: function(properties){
			var pos = properties.position;
			var cc = properties.canvas;
			var id = properties.id;	
			var radius = properties.radius;
			if(!pos || !id ||!cc |!radius) {throw "I'm not happy - you haven't given me enough to work with";return;  }
			var move = function(e,s){
					if(s)cc.title = id;
			};
			var x = parseFloat(pos.x);
			var y = parseFloat(pos.y);
			var point = new EasyShape({lineWidth:'2',shape:'circle', 'id':id,fill:properties.fill},[x,y,radius]);
			cc.add(point);
			cc.render();	
		}
		,loadComments: function(canvas,tiddler,src){
			var tid = store.getTiddler(tiddler);
			var comments = store.getTaggedTiddlers("comment");
			for(var i=0; i < comments.length; i++){
				var c =comments[i];
				if(c.fields.parentimage && c.fields.parentimage == src){
					var args = {position:{x: c.fields.tagx,y:c.fields.tagy},fill:c.fields.fill,radius:c.fields.radius,canvas:canvas,id:c.title};
					this.addComment(args);
					
				}
			}
		}	
		,handler: function(place,macroName,paramlist,wikifier,paramString,tiddler){
			var tiddlerDom = story.findContainingTiddler(place);

			
			var src,requestedwidth,requestedheight, maxwidth,maxheight;
			var params = paramString.parseParams("anon",null,true,false,false);
			if(!getParam(params,"src")) {
				src = paramlist[0];
			}else{
				src= getParam(params,"src");
			}
			
			requestedwidth= getParam(params,"width");
			requestedheight= getParam(params,"height");
			maxwidth= parseInt(getParam(params,"maxwidth"));
			maxheight= parseInt(getParam(params,"maxheight"));
			config.macros.TagImage.properties[src] = {};
			config.macros.TagImage.properties[src].fill = getParam(params,"fill");
			
			var radius = getParam(params,"radius");
			if(!radius) radius = 12.5;
			config.macros.TagImage.properties[src].radius =radius;

			var id= parseInt(getParam(params,"id"));
			var title = tiddlerDom.getAttribute("tiddler");
			var newel = document.createElement("div");
			//newel.style.overflow = "hidden";
			newel.className = "TagImage";
			if(id)newel.id = id;
			var img = new Image();
			img.src = src;

			var tags = 0;
			var numcomments = store.getValue(store.getTiddler(title),"imagecomments");	
			if(numcomments) tags = numcomments;
			
			
			var setup = function(){
				config.macros.TagImage.loadedImages[src] = true;
				var width,height;
				var ratio;
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
	
	
				jQuery(newel).css({width: ewidth, height: eheight,overflow:"hidden"});
				var imgproperties = {shape:'image',src:src,width:width,height:height};
				var cc = new EasyClickableCanvas(newel,[new EasyShape(imgproperties,[0,0])]);
				
				
				var dblclick = function(e,s){
					if(!e) e= window.event;
					config.macros.TagImage.addNewComment({event: e, canvas:cc,tiddler:title,src:src});
				};
				
				var box = document.createElement("span");
				jQuery(box).css({border:'solid 1px black',position:"absolute",width:radius*2,height:radius*2,'z-index': 2});
				
				
				var lookuptiddler = function(id){
					var tiddler =store.getTiddler(id);
					if(tiddler)return tiddler;
					var newname = config.macros.TagImage.renamedTiddlers[id];
					if(!newname) return false;
					else return lookuptiddler(newname);
				}
				var move = function(e,s){
					var pos = EasyClickingUtils.getMouseFromEvent(e);
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
				}
				var up = function(e,s){
					if(s && s.getProperty("id")){
						var tiddler = lookuptiddler(s.getProperty("id"));
						if(tiddler)story.displayTiddler(null,tiddler.title);
					}
				};
				
			
				cc.render();


				box.onmousedown= function(e){box.style.display = "none";newel.onmousedown(e); box.style.display = "";}
				box.ondblclick = function(e){box.style.display = "none";newel.ondblclick(e); box.style.display = "";}
				
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
				}
				cc.setOnMouse(false,up,move,dblclick,key);	
							
				var control = new EasyController(cc,newel);	
				newel.appendChild(box);
				place.appendChild(newel);	
				config.macros.TagImage.loadComments(cc,title,src);
			};
			if(img.complete){
				setup();
			}
			else{
				img.onload = function(){	
					setup();
				}
			
			}
		}
};


store.oldSaveTiddler = store.saveTiddler;
store.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created){
	if(newTitle && title != newTitle)config.macros.TagImage.renamedTiddlers[title] = newTitle;
	this.oldSaveTiddler(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created);

};



