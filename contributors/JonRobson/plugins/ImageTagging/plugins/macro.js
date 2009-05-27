config.renamedTiddlers = {};
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
			else if(properties.vismoShape){
			    var coords = properties.vismoShape.getCoordinates();
			    pos = coords;
			    properties.position = coords;
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
			
			if(x && y && radius){
				//currently have position from center, want position from top left,radius is also effected by dimensions of image
				//x /= image.width;
				//y /= image.height;
				//radius /= image.width;
				var xyr =x+","+y+","+radius+","+parseInt(image.width)+","+parseInt(image.height);
				var fields = merge({imagexyr:xyr, parentimage: src,fill:properties.fill},config.defaultCustomFields);
				try{
					store.saveTiddler(id,id,"","vismo",new Date(),["imagetag"],fields,true,new Date());
                                }catch(e){};

				story.displayTiddler(resolveTarget(properties.event),id,DEFAULT_EDIT_TEMPLATE);
				x /= image.width;
				y /= image.height;
				radius /= image.width;
				properties.radius = radius;
				properties.position = {x:x,y:y};
			}
			properties.id = id;
			this.addComment(properties);
			
			
		}
		,addComment: function(properties){/* x,y  and radius must be normalised */
			var pos = properties.position;
			var cc = properties.canvas;
			var image = properties.image;
			var id = properties.id;	
			var radius = properties.radius;
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
			var coords = [x,y,radius];
			if(properties.fill) props.fill = properties.fill;
			if(properties.shape == 'square') {
			        props.shape = "polygon";
			        coords = [x-radius,y-radius,x+radius,y-radius,x+radius,y+radius,x-radius,y+radius];
			}
			if(properties.shape && properties.shape != "square" && properties.shape != "circle") throw "Bad shape given! (" + properties.shape +") Use square or circle!"
			var point = new VismoShape(props,coords);
			
			cc.add(point);
			cc.render();
			
		}
		
	    ,updateField: function(shape,fieldname,oldvalue){
	        var mergefields = {},newtitle,oldtitle;
	        if(fieldname == 'id'){
                oldtitle = oldvalue;
                newtitle = shape.getProperty("id");
            }
            else{
                oldtitle = shape.getProperty("id");
                newtitle = title;
                mergefields[fieldname] =shape.getProperty(fieldname);
            }

	        var tiddler =store.getTiddler(oldtitle);
            var fields = tiddler.fields;
            var i;
            for(i in mergefields){
                fields[i] = mergefields[i];
            }
            console.log("here",oldtitle,fields,newtitle);
            try{
                store.saveTiddler(oldtitle,newtitle,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,fields,true,tiddler.created);
            }
            catch(e){
             console.log("exc",e);   
            }
                console.log("done?");
            
	    }
		,loadTiddlers: function(canvas,tiddler,src,image,tids,tagshape){
		
			var dim = canvas.getDimensions();
			var offsetleft = (dim.width * 0.5);
			var offsettop = (dim.height * 0.5);
			for(var i=0; i < tids.length; i++){
				var c =tids[i];
				if(!c.fields.parentimage||src == c.fields.parentimage){
				        var data = [];
				        var x,y,radius;
				        if(c.fields.imagexyr){
				                data = c.fields.imagexyr.split(",");
				                for(var j=0; j< data.length; j++){data[j] = parseFloat(data[j]);};
        				        x = data[0];
					        y = data[1];
					        radius = data[2];
					        if(data[3]) {
					                x/= data[3];
					                radius /=data[3];
					        }
					        if(data[4])y/= data[4];
					 }
                                        else{
                                                if(!c.fields.tagx) x =  (offsetleft - (Math.random() * 300)) / dim.width;
        					if(!c.fields.tagy)y =   (offsettop - (Math.random() * 100))/dim.height;
					        if(!c.fields.radius) radius = 12.5 / dim.width;
                                        }
                                        

                                        var fill =c.fields.fill;
					var args = {shape: tagshape,position:{x: x,y:y},fill:fill,radius:radius,image:image,canvas:canvas,id:c.title};
                                        this.addComment(args);				
				}
			}
			
		}
		,loadComments: function(canvas,tiddler,src,image,tagshape){
			var tid = store.getTiddler(tiddler);
			var comments = store.getTiddlers();
			for(var i=0; i < comments.length; i++){
				var c =comments[i];
				if(c.fields.parentimage && c.fields.parentimage == src){
				        if(c.fields.imagexyr){
				                var data = c.fields.imagexyr.split(",");
				                for(var j=0; j< data.length; j++){data[j] = parseFloat(data[j]);};
					        var x = data[0];
					        var y = data[1];
					        var radius = data[2];
					        if(data[3]) {
					                x/= data[3];
					                radius /=data[3];
					        }
					        if(data[4])y/= data[4];
			
					        var args = {position:{x: x,y:y},fill:c.fields.fill,radius:radius,image:image,canvas:canvas,id:c.title};
					        this.addComment(args);
					}
				}
			}
		}
		,savePosition: function(shape,image,src){
		        if(!shape)return;
                        var id =shape.getProperty("id");
		        if(!id)return;
                        var radius = shape.getRadius();
                        var pos = shape.getCoordinates();
                        var transformation = shape.getTransformation();
                        var translate = transformation.translate;
                        if(!translate) translate = {x:0,y:0};
                        var x = pos[0] + translate.x;
                        var y = pos[1] + translate.y;

			
                        var xyradius = x + ","+y+","+radius + ","+parseInt(image.width)+","+parseInt(image.height);
                        var tiddler =store.getTiddler(id);
                        
            var mergefields = {imagexyr: xyradius,fill:shape.getProperty("fill")};
            if(src)mergefields.parentimage = src;
            
            if(tiddler){
                var i;
                var fields = tiddler.fields;
                    for(i in mergefields){
                      fields[i] = mergefields[i];  
                    }
        			try{
        			        store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,fields,true,tiddler.created);

        			}catch(e){};
			}
			else{
			        var fields = merge(mergefields, config.defaultCustomFields);
			        store.saveTiddler(id,id,"","imagetag",new Date(),[],fields,new Date())
			}
  
                }
		,setupMouse: function(clickablecanvas,src,title,img,editable,tagshape){
			var cc = clickablecanvas;

			var el = clickablecanvas.getDomElement();
			var radius = config.macros.TagImage.properties[src].radius;		



		}
		,handler: function(place,macroName,paramlist,wikifier,paramString,tiddler){
			var tiddlerDom = story.findContainingTiddler(place);
			var title;
			if(tiddlerDom){
			        title  = tiddlerDom.getAttribute("tiddler");
			}
			else{
			        title = "PageTemplate";
			} 
			
			var src,requestedwidth,requestedheight, maxwidth,maxheight,source;
			var params = paramString.parseParams("anon",null,true,false,false);
			if(getParam(params,"src")) {
				src= getParam(params,"src");
			}else{
				src = paramlist[0];
			}

			requestedwidth= getParam(params,"width");
			requestedheight= getParam(params,"height");
			editable = eval(getParam(params,"editable"));
			maxwidth= parseInt(getParam(params,"maxwidth"));
			maxheight= parseInt(getParam(params,"maxheight"));
			source = getParam(params,"tiddlers");
			
			var id= parseInt(getParam(params,"id"));

			var newel = document.createElement("div");
			//newel.style.overflow = "hidden";
			newel.className = "TagImage";
			
			var w = 100,h = 100;
			if(requestedwidth) w = parseInt(requestedwidth);
			if(requestedheight)h = parseInt(requestedheight);
			jQuery(newel).css({width: w, height: h,overflow:"hidden"});
			
			var that = this;
	

			if(id)newel.id = id;
			var img = new Image();
			if(src)img.src = src;

			var tags = 0;
			var numcomments = store.getValue(store.getTiddler(title),"imagecomments");	
			if(numcomments) tags = numcomments;
            var fill =getParam(params,"fill");
            if(!fill) fill ='rgba(255,0,0,0.2)';
            
			config.macros.TagImage.properties[src] = {};
			config.macros.TagImage.properties[src].fill = fill;			
			
			var setup = function(filter){
	    		var savenew = function(shape){
    			    that.savePosition(shape,img,src);

    			};
    			var doupdate = function(shape,name,oldval){
    			    that.updateField(shape,name,oldval);
    			};
    			

    			var finishedmove = function(shape){
    			        that.savePosition(shape,img);
    			};

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
    					story.displayTiddler(null,tiddler);
    				}				
    			};

            			
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
					
					jQuery(newel).css({width:ewidth,height:eheight});
					var cceditor = new VismoCanvasEditor(newel,{onshapechange: doupdate,dblclick:dblclick,onshapecomplete:savenew,onmovecomplete:finishedmove,tools:['selectshape','newcircle'],defaultfill:config.macros.TagImage.properties[src].fill,panzoom:true,startdisabled:true});
        			var cc = cceditor.VismoCanvas;
        			cc.addTooltip(function(tooltip,shape){tooltip.innerHTML = shape.getProperty("id");})
        			

					var imgproperties = {unclickable: "true",shape:'image',src:src,width:width,height:height};
					cc.add(new VismoShape(imgproperties,[0,0]));					
				}
				else{
					src= "false";

				}



				
				config.macros.TagImage.properties[src].radius =radius;				
	
			
				cc.render();

                config.macros.TagImage.cc = cc;
				var tagshape = getParam(params,"shape");
				if(!tagshape) tagshape == "circle";
			        
				config.macros.TagImage.setupMouse(cc,src,title,img,editable,tagshape);
				
				
				if(!filter)config.macros.TagImage.loadComments(cc,title,src,img);
				else config.macros.TagImage.loadTiddlers(cc,title,src,img,filter,tagshape);
				
				
				/*if(editable){
    			    var cceditor = new VismoCanvasEditor(cc);
    			}
    			*/
			};
	                place.appendChild(newel);
			if(img.complete){
					setup(source);
			}
			else{
					img.onload = function(){	
						setup(source);
					}
				
			}
		}
};


/*
store.oldSaveTiddler = store.saveTiddler;
store.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created){
	if(newTitle && title != newTitle)config.renamedTiddlers[title] = newTitle;
	this.oldSaveTiddler(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created);
};
*/


