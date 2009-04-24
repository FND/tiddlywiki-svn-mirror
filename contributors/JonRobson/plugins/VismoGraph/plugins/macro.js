        story.vismographhijackeddisplaytiddler = story.displayTiddler;

config.macros.VismoGraph = {
        instances: []
        ,handler: function(place,macroName,params,wikifier,paramString,tiddler){
                
                var prms = paramString.parseParams(null, null, true);
                var w = parseInt(getParam(prms,"width"));
                var h = parseInt(getParam(prms,"height"));
                
                var el = document.createElement("div");
                jQuery(el).css({width:w,height:h});
                place.appendChild(el);          
                
                var savePosition = function(id,x,y){
                        var xy = x + ","+y;
    
                        var tiddler =store.getTiddler(id);
                        if(tiddler){
                                var fields = tiddler.fields;
                                fields.vismoxy= xy;
        			try{
        			        store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,fields,true,tiddler.created);
                                
        			}catch(e){};
			}
			else{
			        var fields = merge({vismoxy: xy}, config.defaultCustomFields);
			        store.saveTiddler(id,id,"","vismo",new Date(),[],fields,new Date())
			}
                        
                         
                        //                        saveChanges();                
                };
                var positionCalculationFunction = function(node){
                        var tiddler = store.getTiddler(node.getID());
                        var x,y;
                        if(tiddler){
                                if(tiddler.fields.vismoxy){
                                        var xy = tiddler.fields.vismoxy.split(",");
                                        x = parseFloat(xy[0]);
                                        y = parseFloat(xy[1]);
                       
                                        return {x:x,y:y};
                                }
                        }
                        var oldpos = node.getPosition();
        		if(oldpos.x && oldpos.y) return oldpos;
        		x = Math.random() *w/2;
        	        y = Math.random()* h/2;
        	        var id =node.getID();
	                savePosition(id,x,y);
        	        return {x:x,y:y};		
        	}
               
                 config.macros.VismoGraph.instances.push(new VismoGraph(positionCalculationFunction));
                 var g = config.macros.VismoGraph.instances[config.macros.VismoGraph.instances.length-1];
                this.addNodes(g);

                var r= new VismoGraphRenderer(el,g,{controller:true});
                var finishmove = function(shape){
                        if(!shape) return;
                        var coords = shape.getCoordinates();
                        var node = r.getNodeFromShape(shape);
                        if(node && coords)node.setPosition(coords[0],coords[1]);
                        r.render();
                        var id=node.getID();
                        savePosition(id,coords[0],coords[1]);
                };

                var dbclick = function(e,s){
                        if(s)story.displayTiddler(null,s.getProperty("name"));
                        else{
                                var pos = VismoClickingUtils.getMouseFromEvent(e,r.getVismoController().getTransformation());
                                var title = "Vismo " + Math.random();
                                savePosition(title,0,0);
                                g.addNode({id:title,properties:{name:title}});
                                r.render();
                                
                        }
                };
                var singleclick = function(e,s){
                        g.setFocusedNode(s.getProperty("name"));
                
                };




                r.canvas.setOnMouse(singleclick,false,false,dbclick);
                r.canvas.makeMoveable(finishmove);
                r.canvas.addTooltip(function(el,s){el.appendChild(document.createTextNode(s.getProperty("name")));});

                r.render();
        }      
        ,addNodes: function(vismoGraph){
                var g = vismoGraph;
                var tiddlers = store.getTiddlers();
                for(var i=0; i < tiddlers.length; i++){
                        var tid = tiddlers[i];
                        g.addNode({id:tid.title,properties:{name:tid.title}});
                        for(var j=0; j < tid.tags.length; j++)   {
                                var tag = tid.tags[j];
                                g.addNode({id:tag,properties:{name:tag}});
                                g.addEdge(tag,tid.title);
                        }                     
                }

        }
};

story.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle,visualisationID){
        story.vismographhijackeddisplaytiddler(srcElement,tiddler,template,animate,unused,customFields,toggle,visualisationID);
        for(var i=0; i< config.macros.VismoGraph.instances.length; i++){
                var graph =config.macros.VismoGraph.instances[i];
                graph.setFocusedNode(tiddler);
        }
};
