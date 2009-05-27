config.renamedTiddlers = {};
config.macros.VismoGraph = {
        instances: []
        ,handler: function(place,macroName,params,wikifier,paramString,tiddler,graphjson){
                
                var prms = paramString.parseParams(null, null, true);
                var w = parseInt(getParam(prms,"width"));
                var h = parseInt(getParam(prms,"height"));
                var exclude = getParam(prms,"exclude");
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
                
                var positionCalculationFunction = function(graph,node){ ///user-defined layout
                
                                var tiddler = store.getTiddler(node.getID());
                                var x,y,radius;
                                if(tiddler){
                                        if(tiddler.fields.vismoxy){
                                                var xy = tiddler.fields.vismoxy.split(",");
                                                x = parseFloat(xy[0]);
                                                y = parseFloat(xy[1]);
                                                radius = parseFloat(xy[2]);
                                                node.setProperty("width", radius*2);
                                                return {x:x,y:y,radius:radius};
                                        }
                                }
                                var oldpos = node.getPosition();
                		if(oldpos) return oldpos;
        		
                		x = Math.random() *(w/2);
                	        y = Math.random()*(h/2);
                	        x -=(w/2);
                	        y -= (h/2);
                	        var id =node.getID();
        	                savePosition(id,x,y);
                	        return {x:x,y:y};		
                	
               };


                
                var g =new VismoGraph(positionCalculationFunction);
                if(graphjson){
                        g.loadfromjson(graphjson);
                }
                else{
                        this.addNodes(g,exclude);
                }
                var labelwikify = function(place,node){
                        var name =node.getProperty("name");
                        
                                   
                        var tiddler =store.getTiddler(name);
                        if(tiddler && tiddler.fields.nodeprefix){
                                wikify(tiddler.fields.nodeprefix,place);
                        }

                        var label = node.getProperty("nodelabel");
                        if(label) wikify(label,place);
                        if(tiddler && tiddler.fields.nodelabel){
                                wikify(tiddler.fields.nodelabel,place);
                        }          
                        else{
                                place.appendChild(document.createTextNode(name));
                        }
                        if(tiddler){
                                
                                if(tiddler.fields.nodesuffix)wikify(tiddler.fields.nodesuffix,place);
                        }
                        
                        
                };
                var afterRender = function(renderer){

                }
                
                
                config.macros.VismoGraph.instances.push(r);
                var finishmove = function(shape){
                        if(!shape) return;
                        var coords = shape.getCoordinates();
                        var node = r.getNodeFromShape(shape);
                        if(node && coords){
                                var newx =coords[0];
                                var newy = coords[1];
                                 var trans = shape.getProperty("transformation");
                                if(trans && trans.translate){
                                    newx += trans.translate.x;
                                    newy += trans.translate.y;
                                }
                                node.setPosition(newx,newy);
                                var id=node.getID();
                                 savePosition(id,[newx,newy]);
                                  
                        }
                        r.render();
  
                };

                var dblclick = function(e,s){
               
                        if(s)story.normalDisplayTiddler(null,s.getProperty("id"));
                        else{
                            //wont work yet as r defined later..
                                var xy = r.getVismoCanvas().getXY(e);
                                r.getVismoController().panTo(xy.x,xy.y);
                                return;                       
                        }
                };
                var singleclick = function(e,s){
                        var name =s.getProperty("name");
                        g.setRootNode(name);
                        var b = s.getBoundingBox();
                        var tid = store.getTiddler(name);
                        var change = false;
                        if(tid){
                                if(tid.fields.parentcolor){
                                        var parents = g.getNodeParents(name);
                                        for(var i=0; i < parents.length; i++){
                                                var node = g.getNode(parents[i]);
                                                //node.setProperty("fill",tid.fields.parentcolor)
                                                
                                        }
                                        change = true
                                }
                                
                                if(tid.fields.childrencolor){
                                        var children = g.getNodeChildren(name);
                                        for(var i=0; i < children.length; i++){
                                                var child = g.getNode(children[i]);
                                                //child.setProperty("fill",tid.fields.childrencolor)
                                                
                                        }
                                        change = true;
                                }
                                
                        }
                        r.render();
                };
                            
                var saveEdge = function(s){
    
                    var from = s.getProperty("from");
                    var to = s.getProperty("to");
                    
                    var tiddler = store.getTiddler(to);
                    if(tiddler){
                        var newtags = tiddler.tags;
                        newtags.push(from);
                        store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,newtags,tiddler.fields,true,tiddler.created);
                    }
                    else{
                        throw "error tiddler with title "+ to+ " doesnt exist?!";
                    }
                }
                var saveNode = function(s){
                    var title = "Thought #"+s.getProperty("id");
                    s.setProperty("id",title);
                    var coords = s.getCoordinates("normal");
                    var xyr = coords[0]+","+coords[1]+","+coords[2];
                    
                    var fields = merge({vismoxy: xyr}, config.defaultCustomFields);

                    store.saveTiddler(title,title,"created by vismograph","VismoGraph",new Date(),[],fields,true,new Date());

                    
                }

                var adjustNode = function(s,propertyname,oldvalue){
                  if(propertyname == 'id'){
                      var tiddler = store.getTiddler(oldvalue);
                      var newtitle = s.getProperty("id");
                      try{
                          store.saveTiddler(tiddler.title,newtitle,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
                        }catch(e){
                            console.log("owch",e);
                        }
                  }
                  else{
                      console.log(propertyname,"changed");
                      var tiddler = store.getTiddler(oldvalue);
                      var newfields = tiddler.fields;
                      newfields[propertyname] = s.getProperty(propertyname);
                      store.saveTiddler(tiddler.title,newtitle,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,newfields,true,tiddler.created);
                      
                  }
                };
     
                var r= new VismoGraphRenderer(el,{onlinecomplete:saveEdge, onshapechange: adjustNode, onshapecomplete: saveNode,graph:g,startdisabled: true,onmovecomplete: finishmove,mouseup: singleclick,dblclick:dblclick,panzoom:true,renderLabel: labelwikify,afterRender: afterRender});
                
                var layout =getParam(prms,"layout");
                if(layout == "tree"){
                        
                        g.setLayoutAlgorithm("tree");
                }
                r.canvas.addTooltip(function(el,s){el.appendChild(document.createTextNode(s.getProperty("id")));});

                r.render();
        }
        ,getPropertiesFromTiddler: function(tiddler){
                if(!tiddler)return {};
                return {name:tiddler.title,fill:tiddler.fields.nodecolor,labelprefix:tiddler.fields.nodelabelprefix,labelsuffix: tiddler.fields.nodelabelsuffix};
                
        }
        ,addNode: function(vismoGraph,tiddler){
                var props;
                if(typeof tiddler == 'string'){
                        props = {name: tiddler};
                }
                else{
                        props = this.getPropertiesFromTiddler(tiddler);
                                }
                var title = props.name;
                return vismoGraph.addNode({id:title,properties:props});
                
        }      
        ,addNodes: function(vismoGraph,exclude){
                var g = vismoGraph;
                var tiddlers = store.getTiddlers();
                for(var i=0; i < tiddlers.length; i++){

                        var tid = tiddlers[i];
                        if(!exclude || exclude.indexOf(tid.title) == -1){
                                var child = this.addNode(vismoGraph,tid);
                                for(var j=0; j < tid.tags.length; j++)   {
                                        var tag = tid.tags[j];
                                        var tagtiddler = store.getTiddler(tag);
                                        if(!tagtiddler){
                                                tagtiddler = tag;
                                        }
                                        else{
                                                if(tagtiddler.fields.childrencolor){
                                                        child.setProperty("fill",tagtiddler.fields.childrencolor);
                                                }

                                        
                                        }
                                        var parent = this.addNode(vismoGraph,tagtiddler);
                                        if(tid.fields.parentcolor){
                                                parent.setProperty("fill",tid.fields.parentcolor);
                                        }
                                
                                        g.addEdge(tag,tid.title);
                                
                                }                     
                        }
                }

        }
};

story.normalDisplayTiddler = story.displayTiddler;
story.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle){

        for(var i=0; i < config.macros.VismoGraph.instances.length; i++){
                var renderer = config.macros.VismoGraph.instances[i];
                if(renderer){
                renderer.setRootNode(tiddler);
                var node = renderer.getRootNode();
                //console.log(node);
                if(node){
                        var controller =renderer.getVismoController();
                        var t = node.getPosition();
                        controller.translate(-t.x,-t.y);
                }
                renderer.render();
                }
               
        }
        
        return story.normalDisplayTiddler(srcElement,tiddler,template,animate,unused,customFields,toggle);
        
};

story.normalSaveTiddler = story.saveTiddler;



story.saveTiddler = function(title,minorUpdate){
      
        
        for(var i=0; i < config.macros.VismoGraph.instances.length; i++){
                var renderer = config.macros.VismoGraph.instances[i];         
                var graph = renderer.getVismoGraph();
                var node = graph.getNode(title);
                
                if(node){
                        var tiddler =store.getTiddler(title);
                        var properties = config.macros.VismoGraph.getPropertiesFromTiddler(tiddler);
               

                        node.setProperties(properties);

                        renderer.render();
                }
        }
                
        
        return this.normalSaveTiddler(title,minorUpdate);
};