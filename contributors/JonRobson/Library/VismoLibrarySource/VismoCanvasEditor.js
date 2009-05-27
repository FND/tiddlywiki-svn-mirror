var VismoCanvasEditor = function(vismoCanvas,options){
        //var toolbar = "<div class='VismoCanvasToolbar' style='position:relative;z-index:400;'><div class='selectshape button'>&nbsp;</div><div class='newshape button'>&nbsp;</div><div class='newline button'>&nbsp;</div><div class='newfreeline button'>&nbsp;</div></div>";
        var rightmenu = "<div class='RightMenu' style='position:absolute; z-index:99999;'><div class='content'>node:</div><div class='closer'>close me</div></div>";
        var toolbar = "<div class='VismoCanvasToolbar' style='position: absolute; right:0;z-index:999999;'><div class='togglemode button editor'>EDIT MODE</div></div>";
        var toolsettings = "<div class='VismoToolSettings' style='position:absolute;bottom:0;z-index:999999;'></div>";
        if(!options) options = {};
        if(!options.tools) options.tools = ["selectshape","newcircle","newrectangle","newline","fillshape","save"];
        if(vismoCanvas instanceof jQuery){
            var list = [];
            for(var i=0; i < vismoCanvas.length; i++){
                list.push(new VismoCanvasEditor(vismoCanvas[i],options));
            }
            return list;
            
        }
        else if(typeof(vismoCanvas) == 'string'){ 
            var el = document.getElementById(vismoCanvas);
            vismoCanvas = new VismoCanvas(el,options);
        }
        else if(vismoCanvas instanceof Element){ //assume it's some sort of dom element
            vismoCanvas = new VismoCanvas(vismoCanvas,options);
        }
        else if(vismoCanvas instanceof VismoCanvas){
            //continue..
        }
        else{
            throw "what the heck have you given me?! I can deal with Elements, string ids and jquery objects but not much else!";
        }
        this.VismoCanvas = vismoCanvas;
        this.vismoCanvasMouse = vismoCanvas.mouse();
        this.options = options;
        this.el = vismoCanvas.getDomElement();
        this.el.oncontextmenu=function() {  return false}; 
        jQuery(this.el).prepend(toolbar+rightmenu+toolsettings);
        var that = this;
        var rmenu =jQuery(".RightMenu",this.el);
        rmenu.hide()
        jQuery(".closer",rmenu).click(function(e){
            jQuery(this).parent().hide();
            e.stopPropogation();
        });


        this.vismoCanvas = vismoCanvas;

        
        var f = function(s){    
            if(options.onmovecomplete) options.onmovecomplete(s);
            that._recalculateEdge(s);

            that.vismoCanvas.render();
        }
        this.manipulator = new VismoShapeManipulator(vismoCanvas,{onmovecomplete:f});
        
        
        var nextID = 0;
        
        if(options.panzoom)new VismoController(vismoCanvas,vismoCanvas.getDomElement());
    
        this.init();
        this.init_toolsettings();
        
        if(!options.startdisabled) editOn = true;
        else editOn = false;
        this.setEditMode(editOn);


};

VismoCanvasEditor.prototype = {
init_toolsettings: function(){
    var that = this;
    
    /*color wheel */
    if(this.options.tools.indexOf("fillshape")> -1){
        var applyTo = "fill";
        var colorpicker = "<div class='VismoCanvasColor'><div>color:<input type='text' name='color' value='#ffffff' class='VismoToolFillColor'>opacity:<input type='text' value='1.0' class='VismoToolFillOpacity'/></div><div class='VismoToolFillPicker'></div><span class='hider'>hide</span></div>";
        var buttons  ="<div><div class='VismoToolFill'>fill<div class='previewcolor VismoToolFillPreview'></div></div><div class='VismoToolStroke'>stroke<input class='lineWidth' type='text' value='1.0'/>px <div class='previewcolor VismoToolStrokePreview' style='background-color:black;'></div></div>";
        jQuery(".VismoToolSettings",this.el).append(colorpicker+buttons);
    
        jQuery(".VismoToolFillPicker",this.el).farbtastic(function(hex){   
            jQuery(".VismoToolFillColor",that.el).val(hex);
        
            var color = jQuery(".VismoToolFillColor",that.el);
            var opacity = jQuery(".VismoToolFillOpacity",that.el);               
            if(applyTo == 'fill'){                    
                var fill =that.fill(color.val(),opacity.val());
                var rgbCode = VismoShapeUtils.toRgb(fill);
            
                jQuery(".VismoToolFillPreview",that.el).css({'background-color':rgbCode.rgb,'opacity':rgbCode.opacity});    
                that.tempShape.setProperty("fill",fill);
            
                var s= that.manipulator.getSelectedShape();
                if(s) {
                    s.setProperty("fill",fill);
                    if(this.options.onshapechange)this.options.onshapechange(s,"fill");
                }
            }
            else{
            
                var stroke =that.stroke(color.val(),opacity.val());
                var rgbCode = VismoShapeUtils.toRgb(stroke);
            
                jQuery(".VismoToolStrokePreview",that.el).css({'background-color':rgbCode.rgb,'opacity':rgbCode.opacity});      
                that.tempShape.setProperty("stroke",stroke);
                that.tempLine.setProperty("stroke",stroke);
                var s= that.manipulator.getSelectedShape();
                if(s) s.setProperty("stroke",stroke);
            }
        });
    
        jQuery(".hider",jQuery(".VismoCanvasColor",that.el)).click(function(e){
            jQuery(this).parent().hide();
        });
        jQuery(".VismoCanvasColor",that.el).hide();
        jQuery(".lineWidth",that.el).change(function(e){
            var strokew = parseFloat(this.value);
            if(!strokew) return;
            that.tempShape.setProperty("lineWidth",strokew);
            that.tempLine.setProperty("lineWidth",strokew);
            var s= that.manipulator.getSelectedShape();
            if(s) s.setProperty("lineWidth",strokew);
            that.vismoCanvas.render();
        });

        var farb = jQuery(".VismoToolFillPicker",this.el)[0];
        jQuery(".VismoToolStroke",this.el).click(function(e){
            jQuery(".VismoCanvasColor").show();
           if(applyTo== 'stroke'){

               e.stopPropagation();
           }
           else{
               applyTo = "stroke"; 
                       
             //  jQuery(this).parent().siblings().show();
           } 
           var opacity = jQuery(".VismoToolFillOpacity",that.el);
           opacity.val(VismoShapeUtils.opacityFrom(that.stroke()));
       
           var hexcode = VismoShapeUtils.toHex(that.stroke());
           if(hexcode)farb.farbtastic.setColor(hexcode);


        });
        jQuery(".VismoToolFill",that.el).click(function(e){
             jQuery(".VismoCanvasColor",that.el).show();
            if(applyTo== 'fill'){

                e.stopPropagation();

            }else{
               applyTo = "fill"; 
          
                //jQuery(this).parent().siblings().show();
            }
            var opacity = jQuery(".VismoToolFillOpacity",that.el);
            opacity.val(VismoShapeUtils.opacityFrom(that.fill()));
        
            var hexcode = VismoShapeUtils.toHex(that.fill());
             if(hexcode)farb.farbtastic.setColor(hexcode);

        });
        this.fillColor = "rgb(255,0,0)";
        this.strokeColor = "#000000";
        farb.farbtastic.setColor("#ff0000");
    }
    
    


    
    
}
,_recalculateEdge: function(movedShape){
    if(!movedShape)return;

    var movedID = movedShape.getProperty("id");
    var memory = this.vismoCanvas.getMemory();
    for(var i=0; i < memory.length; i++){
        var edgeShape = memory[i];
            var from =edgeShape.getProperty("from");
            var to = edgeShape.getProperty("to");
        if(from && to){
            if(movedID == from  || movedID == to){
                var fromShape = this.vismoCanvas.getShapeWithID(from);
                var toShape = this.vismoCanvas.getShapeWithID(to);
                if(fromShape && toShape){
                    var bb1 = fromShape.getBoundingBox();
                    var bb2 = toShape.getBoundingBox();
                    
                    edgeShape.setCoordinates([bb1.center.x,bb1.center.y, bb2.center.x,bb2.center.y]);
                }
            } 
            
        }
    }      
}
,setEditMode: function(editOn,el){
  if(!el) el=jQuery(".togglemode",this.el);
  else{
        el = jQuery(el);
      
  }
               
  if(editOn){
      this.enabled = true;
      if(el){
          el.addClass("editor");
          el.removeClass("viewer");
          el.text("EDIT MODE");
          el.siblings().show();
          
      }
      
      if(this._vismoController){
          this._vismoController.disable();

          
      }
      
  }
  else{
          this.getManipulator().selectShape(false);      
      
      if(el){
         el.removeClass("editor");
         el.addClass("viewer");
         el.text("VIEW MODE");
         el.siblings().hide();
      }
      
      
      if(this._vismoController){
          this._vismoController.enable();                  
      }
      this.enabled = false;
  }

}
,toggleMode: function(el){
  if(this.enabled) {
      this.setEditMode(false,el);
  }
  else {
      this.setEditMode(true,el);
  }
}
,init: function(){
          
              var that = this;
              if(!that._vismoController && that.el.vismoController) {
                      that._vismoController = that.el.vismoController;
                }
              this.clear();
              
              var mm = this.el.onmousemove;
              var mu = this.el.onmouseup;
              var md = this.el.onmousedown;
              var ready;
              var donowt =  function(e){};

              
              var vceMove = function(e,s){   
                    if(that.enabled){         
                     
                      var tool = that.getSelectedTool();
                      
                        
                      if(tool == "newline"){
                            that.manipulator.showCenter(s)
                             that.doLineDrawing(e);
                        }
                      else if(tool == "newfreeline")that.doFreeLineDrawing(e);
                      else if(tool == "newcircle" || tool =='newrectangle')that.doShapeDrawing(e);

                      that.vismoCanvas.render();
                     }
                     else{
                         that.vismoCanvasMouse.move(e,s);
                     }

                     // if(mm) mm(e);
              };
              var vceDown = function(e,s){
                  
                  if(that.enabled){
                      
                      var tool = that.getSelectedTool();
                      if(tool =='newfreeline')that._startCompleteLineDrawing(e);   
                      else if(tool == "newcircle" || tool == "newrectangle")that.startCompleteShapeDrawing(e);
                      var r = Math.random(), g= Math.random(),b = Math.random(), a= Math.random();
                      var color = that.fill();
                      var s = that.vismoCanvas.getShapeAtClick(e);
                      if(s && tool == 'fillshape') s.setProperty("fill",color);
                   }   //if(md)md(e);
                   else{
                       that.vismoCanvasMouse.down(e,s);
                   }
              };
              var vceDblclick = function(e,s){
                  if(that.enabled){
                      var tool = that.getSelectedTool();
                      if(tool =='newline')that._startCompleteLineDrawing(e,true);   
                  }
                  else{
                      that.vismoCanvasMouse.dblclick(e,s);
                  }
                  return false;
                  
              };
              
              var vceUp = function(e,s){
                  
                  if(that.enabled){
                      var tool = that.getSelectedTool();
                    
                      if(!jQuery(e.target).hasClass("button")){

                              //if(!s && e.button == 2)that.manipulator.selectShape(false);
                              if(tool == "selectshape"){
              
                                    if(s){
                                      var rmenu =jQuery(".RightMenu",that.el);
                                      if(e.button == 2){
                                          
                                          rmenu.show();
                                          var p = that.vismoCanvas.getXYWindow(e);
                                          rmenu.css({top:p.y,left:p.x});
                                          
                                          var sProps  = jQuery(".content",rmenu);
                                          sProps.html("");
                                          var props = s.getProperties();
                                          var i;
                                          for(i in props){
                                              if(typeof(props[i]) =='string' && i !='shape'){
                                                  sProps.append("<br>"+i + ": ");
                                                  var input = jQuery("<input type='text' name='"+i+"' value='"+props[i]+"'/>");
                                                  //console.log(input);
                                                  input.change(function(e){
                                                      var oldvalue= s.getProperty(this.name);
                                                      s.setProperty(this.name,this.value);
                                                      if(that.options.onshapechange)that.options.onshapechange(s,this.name,oldvalue);
                                                      });
                                                  sProps.append(input);
                                              }
                                          }
                                      }
                                      else{
                             
                                          rmenu.hide();
                                      }
          
                                      that.manipulator.selectShape(s);
                                      
                                     }
                                    else{
                                        if(e.target == that.el || e.target.tagName == "CANVAS"){
                                            that.manipulator.selectShape(false);
                                        }
                                    }
                              }
                              else if(tool == "newline" || tool == 'newfreeline')that._startCompleteLineDrawing(e);
       
                              that.vismoCanvas.render();
                      }
                     }
                     else{
                         that.vismoCanvasMouse.up(e,s);
                     }
                      //if(mu)mu(e);
              };
              //this.vismoCanvas.mouse({dblclick:vceDblclick});
              this.vismoCanvas.mouse({move:vceMove,up:vceUp,down:vceDown,dblclick:vceDblclick});  //reset
              var toolbar =jQuery(".VismoCanvasToolbar",this.el);
              
              var toggler =jQuery(".togglemode",toolbar);
              toggler.click(function(e){
                  that.toggleMode(this);
              });

              for(var i=0; i < this.options.tools.length; i++){
                  var toolname = this.options.tools[i];
                  toolbar.append("<div class='"+toolname + " button'>"+toolname+"</div>");
                  
                  var button = jQuery("."+toolname,this.el);
                  button.attr("_vismotoolname",toolname);
                  button.click(function(e){
                      e.stopPropagation();
                      that.setSelectedTool(jQuery(this).attr("_vismotoolname"));
                      jQuery(".button",that.el).removeClass("selected");
                      jQuery(this).addClass("selected");
                  });
              }
              jQuery("."+this.options.tools[0],that.el).click();
}
,stroke: function(rgborhex,opacity){   
            var color;
            if(!rgborhex) return this.strokeColor;       
            if(rgborhex.indexOf("rgb") == -1){ //its hex

                color = VismoShapeUtils.toRgba(rgborhex,opacity);
            }
            else if(rgborhex.indexOf("rgba") == -1){
                color = rgborhex;
            }
            else if(rgborhex.indexOf("rgb") == -1){
                //do something with opacity its rgb
                color = rgborhex;

            }
            else{
                color = false;
            }
            this.strokeColor = color;
            return color;            
}
        
,fill: function(rgborhex,opacity){
   var color; 
   if(!rgborhex) return this.fillColor;
   if(rgborhex.indexOf("rgb") == -1){ //its hex
   
       color = VismoShapeUtils.toRgba(rgborhex,opacity);
   }
   else if(rgborhex.indexOf("rgba") == -1){
       color = rgborhex;
   }
   else if(rgborhex.indexOf("rgb") == -1){
       //do something with opacity its rgb
       color = rgborhex;
   
   }
   else{
       color = false;
   }
   this.fillColor = color;
   return color;
}

,startCompleteShapeDrawing: function(e){
    var that = this;
    var shapetype = this.tempShape.getShape();
    if(!that.startXY){
        this.tempShape.setProperty("hidden",false);
        this.startXY = this.vismoCanvas.getXY(e);     
        
        if(shapetype =='circle')that.tempShape.setCoordinates([this.startXY.x,this.startXY.y,1,1]);  
        else if(shapetype == 'polygon'){
            var rx = 1;
            var ry = 1;
            that.tempShape.setCoordinates([this.startXY.x,this.startXY.y,this.startXY.x+rx,this.startXY.y,this.startXY.x+rx,this.startXY.y+ry,this.startXY.x,this.startXY.y+ry]);
        } 
    }
    else{ //complete it

        if(!that.tempShape.getProperty("hidden")){
                that.tempShape.setProperty("hidden",true);
            
                var clone = that.tempShape.clone();
                clone.setProperty("z-index",false);
                clone.setProperty("onmousedown",false);
                clone.setProperty("unclickable",false);
                clone.setProperty("id",that.nextID);
                clone.setProperty("hidden",false);

                that.vismoCanvas.add(clone);
                that.vismoCanvas.render();
                if(this.options.onshapecomplete) this.options.onshapecomplete(clone);                
                that.nextID +=1;
          }
        that.startXY = false;
      }
}
,doShapeDrawing: function(e){
    if(!this.startXY) return;
      var xy = this.vismoCanvas.getXY(e);
      var spans ={};

      

      
      var shapetype = this.tempShape.getShape();
      if(shapetype =='circle'){
          spans.x = parseInt(xy.y - this.startXY.x);
          spans.y = parseInt(xy.y - this.startXY.y);
          spans.x /= 2;
          spans.y /=2;
          this.tempShape.setCoordinates([this.startXY.x+spans.y,this.startXY.y + spans.y,spans.y,spans.y]);
      }
      else if(shapetype =='polygon'){
          spans.x = parseInt(xy.x - this.startXY.x);
          spans.y = parseInt(xy.y - this.startXY.y);
          var rx = spans.x;
          var ry = spans.y;
          this.tempShape.setCoordinates([this.startXY.x,this.startXY.y,this.startXY.x+rx,this.startXY.y,this.startXY.x+rx,this.startXY.y+ry,this.startXY.x,this.startXY.y+ry]);
          
      }
}
,doFreeLineDrawing: function(e){
      //if(this._vismoController)this._vismoController.disable();
      if(!this._startAt) return;
      var that = this;

      var xy = that.vismoCanvas.getXY(e);
      var c= that.tempLine.getCoordinates();
      
      c.push(xy.x);
      c.push(xy.y);
      that.tempLine.setCoordinates(c);      
      
}
,doLineDrawing: function(e){
      if(!this._startAt) return;
                      
      var that = this;
      var xy = that.vismoCanvas.getXY(e);
      var c= this.tempLine.getCoordinates();
      this._addToLine(xy,c.length-2);
}
,_addToLine: function(xy,where){
      var c= this.tempLine.getCoordinates();
      if(where){
      c[where] = xy.x;
      c[where+1] = xy.y;
      }
      else{
              c.push(xy.x);
              c.push(xy.y);
      }
      this.tempLine.setCoordinates(c);
      
}
,_resetLine: function(){
      this._startAt = false;
      this.tempLine.setCoordinates([0,0,0,0]); 
      this.tempLine.setProperty("edge",false);
      this.tempLine.setProperty("start",false);
      this.tempLine.setProperty("end",false);
}
,_setupLine: function(){
      var xy = this._startAt;
      this.tempLine.setCoordinates([xy.x,xy.y,xy.x,xy.y]);
}
,_startCompleteLineDrawing: function(e,terminate){
           
      var xy = VismoClickingUtils.getRealXYFromMouse(e,this.vismoCanvas.getTransformation());
      var tool = this.getSelectedTool();
      var cancelButton;
      if(tool == 'newline') {
              cancelButton = 2;
      }
      if(tool == 'newfreeline') { //cancel with the left
              if(VismoUtils.browser.isIE) cancelButton =1;
              else cancelButton = 0; 
             
      }
      var hoveringOver =this.getManipulator().overCenter(e);
      if(hoveringOver){
              var current =hoveringOver.getProperty("id");
              
              if(!this.tempLine.getProperty("from"))this.tempLine.setProperty("from",current);
              else if(this.tempLine.getProperty("from") != current){
                this.tempLine.setProperty("to",current);
                this._addToLine(xy);
                terminate = true;      
              } 
              this.tempLine.setProperty("edge",true);
      }
      else{
              if(this.tempLine.getProperty("edge") && !terminate && !cancelButton == e.button){
                      return; //not connected to owt
              }
      }

      if(!this.tempLine.getProperty("edge") && this.options.graphmode) return; //return in the case that we are not drawing an edge and graphmode is on
      
      if(this._startAt && e.button == cancelButton || terminate){ //right mouse  
              //if(this._vismoController)this._vismoController.enable();
                        if(tool == 'newline'){
                                var c = this.tempLine.getCoordinates();   
                                this.tempLine.setCoordinates(c.slice(0,c.length-2));       
                        } 
                    var clone = this.tempLine.clone();
      
                      this.vismoCanvas.add(clone);
                    if(this.options.onlinecomplete) this.options.onlinecomplete(clone);
                      this.tempLine.setProperty("from",false);
                      this.tempLine.setProperty("to",false);
                      this.tempLine.setProperty("edge",false);
                      
                      this._startAt = false;
                      this._resetLine();
                      ///this.tempLine.setProperty("hidden",true);
              
      }
      else{ //left mouse
        
              if(!this._startAt){
                   this._startAt =xy;
                   this._setupLine();
                   this.tempLine.setProperty("hidden",false);   
                }
                else{
                        this._addToLine(xy);
                        
                }
      }
      


}
,getSelectedTool: function(){
      return this.selectedTool;
}
,setSelectedTool: function(id){
      this.tempShape.setProperty("hidden",true);
      this.tempLine.setProperty("hidden",true);
      
      this.getManipulator().selectShape(false);
      this.el.style.cursor = "";
      if(id == 'newcircle'){
          this.tempShape.setProperty("shape","circle");
          this.tempShape.setCoordinates([0,0,5]);
          this.el.style.cursor = "crosshair";
      }
      else if(id == 'newrectangle'){
          this.tempShape.setProperty("shape","polygon");
          this.tempShape.setCoordinates([0,0,1,0,1,1,0,1]);
          this.el.style.cursor = "crosshair";
      }
      else if(id == 'newline'){
              this.tempLine.setProperty("hidden",false);
              this.el.style.cursor = "crosshair";
        }     
    else if(id == 'save'){
        this.options.save(this.burn());
    }         
      this.selectedTool = id;
}
,getManipulator: function(){
  return this.manipulator;
}

,clear: function(){
  this.vismoCanvas.clear(true);
  var that = this;
  this.tempLine = new VismoShape({shape:"path","z-index":999999,fill:this.options.defaultfill,hidden:true,coordinates:[0,0,0,0]});
  this.tempShape = new VismoShape({shape:"circle","z-index":999999,fill:this.options.defaultfill,hidden:true,coordinates:[0,0,40]});
                
               
  this.vismoCanvas.add(this.tempShape);
  this.vismoCanvas.add(this.tempLine);
  this.vismoCanvas.render();
}
,load: function(textContent){
  try{
      var list = eval(textContent);
  }
  catch(e){
      alert("bad data provided (" + e +") should be a list of properties eg. [{},...,{}]");
  }
  
  this.clear();
  if(list){
  for(var i=0; i < list.length; i++){
      var props = list[i];
      var s =new VismoShape(props);
      this.vismoCanvas.add(s);
  }
  }
  this.vismoCanvas.render();
}
,burn: function(){
  var shapes = this.vismoCanvas.getMemory();
  var buffer = ["["];
  var added = 0;
  for(var i=0; i < shapes.length; i++){
      var shape = shapes[i];
      
      if(shape != this.tempShape && shape != this.tempLine){
          if(added > 0) buffer.push(",");
          buffer.push("{");
          var properties = shapes[i].getProperties();
          var coords = shapes[i].getCoordinates();
          buffer.push(["coordinates: ["+ coords.toString()+"]"]);
          var j;
          for(j in properties){
                
                var type = typeof(properties[j]);
                if(type != 'object' && type != "function" && type != "boolean") {
                    if(properties[j]){
                        buffer.push(",")
                        buffer.push(["'"+j+"':'"+properties[j] +"'"]);
                    }
                }
                else{
                    if(j == 'transformation'){
                        var t = properties[j];
                        buffer.push([",transformation:"+"{translate:{x:"+t.translate.x+",y:"+t.translate.y+"},scale:{x:"+t.scale.x+",y:"+t.scale.y+"}}"]);
                    }
                }
          }
           buffer.push("}");
           added +=1;
      }
      
    
      
      
  }
  buffer.push("]");
res = buffer.join("");
  return res;
}
};

var VismoShapeManipulator = function(vismoCanvas,options){
        if(!options) options = {};
        this.options = options;
        var element  = vismoCanvas.getDomElement();
        this.vismoCanvas = vismoCanvas;
        jQuery(element).append("<div class='VismoShapeManipulator' style='position:absolute;border:solid 1px black;z-index:400;'></div><div class='brResizer' style='display:none;position:absolute;z-index:1000;'></div>");
        this.el = jQuery(".VismoShapeManipulator",element);
        this.parentCanvas = element;
        this.brResizer =jQuery(".brResizer",element);
        var that = this;

        this.brResizer.mousedown(function(e){that.toggleResizing();});
        this.brResizer.mouseup(function(e){});
        var centerMark = document.createElement("div");
        centerMark.className = "centerMark";
        centerMark.style.position ="absolute";
        centerMark.style.display = "none"; 
        
        element.appendChild(centerMark);
        this.centerMark = centerMark;        
        this.elementCenters = {};
        jQuery(document).mousemove(function(e){
        
                if(!that.vismoController && that.parentCanvas.vismoController) that.vismoController = that.parentCanvas.vismoController;
                if(that.isResizing){
                        that._resizeFromBottomRight(e);
                }
      
               if(that._moveshape){
                       var pos = that.vismoCanvas.getXY(e);
                       
                       var t = that._moveshape.getTransformation();
                       if(!t) t = {};
                       var bb = that._moveshape.getBoundingBox();
                       var center = bb.center;
                       
                       var change_x = t.translate.x +(pos.x-center.x);
                       var change_y = t.translate.y +(pos.y - center.y);
                       t.translate = {x: change_x,y:change_y};
                       that._moveshape.setTransformation(t);
                       //if(that.vismoController)that.vismoController.disable();
                       
                 }
                 else{
                     var vismoShape = that.vismoCanvas.getShapeAtClick(e);
                     if(vismoShape){
                         var bb = vismoShape.getBoundingBox();
                         var x = bb.center.x;
                         var y = bb.center.y;
                         var pos = VismoTransformations.applyTransformation(bb.center.x,bb.center.y,that.vismoCanvas.getTransformation());
                         that.centerMark.node = vismoShape;
                         var w = jQuery(that.centerMark).width();
                         var h = jQuery(that.centerMark).height();
                         jQuery(that.centerMark).css({left: pos.x - w/2,top:pos.y - h/2});
                    }

                }
                 
                 
            });

            jQuery(document).keypress(function(e){
                if(e.target == 'INPUT') return;
                var keycode = (e.keyCode ? e.keyCode : e.which);
                
                var backspaceKey = 8;
                var deleteKey = -1;
                if(keycode == backspaceKey && e.shiftKey || keycode == deleteKey){
                    var s = that.getSelectedShape();
                    if(s){
                        alert("delete");
                        that.vismoCanvas.remove(s);
                        that.vismoCanvas.render();
                    }
                    
                    
                }

            });
};
VismoShapeManipulator.prototype = {
        getSelectedShape: function(){
            return this.lastSelected;
         }
         ,showCenter: function(shape){
             
             if(shape)
               {
                   jQuery(this.centerMark).css({display:""});}
              else{
                  jQuery(this.centerMark).css({display:"none"});
              }
         }   
        ,overCenter: function(e){
               if(jQuery(e.target).hasClass("centerMark")) return this.vismoCanvas.getShapeAtClick(e);
               else return false;
        }
        ,toggleResizing: function(){
                var that = this;
                

               if(this.isResizing) {

                       
                       this.isResizing = false;
                       
               }
               else{
                       this.isResizing = true;
        
               }
        }
        ,_resizeFromBottomRight: function(e){
              var br = this.vismoCanvas.getXYWindow(e);
              var br_canvas = this.vismoCanvas.getXY(e);
              
              if(this.lastSelected){
                      var bb = this.lastSelected.getBoundingBox();
                      
                      var newscale = (br_canvas.x - bb.center.x) / this.lastSelected.getRadius();
                      var t=  this.lastSelected.getTransformation();
                      var oldvalue = t;
                      if(!t) t = {};
                      if(!t.scale) t.scale = {};
                      t.scale.x = newscale;
                      t.scale.y = newscale;
                      this.lastSelected.setTransformation(t);
                      if(this.options.onshapechange)this.options.onshapechange(this.lastSelected,"transformation",oldvalue);
                      
              }
              this.brResizer.css({display:"",top:br.y-5,left:br.x-5});       
        }
        
        ,stopmoving: function(vismoShape){
                if(this.options.onmovecomplete)this.options.onmovecomplete(vismoShape);
                this._moveshape = false;
        }
        ,startmoving: function(vismoShape){
                this._moveshape = vismoShape;
        }
        ,selectShape: function(vismoShape){


                if(!vismoShape){
                        this.el.css({display:"none"});
                        this.brResizer.css({display:"none"});
                        
                        this.stopmoving(this.lastSelected);
                        this.lastSelected = false;
                       
                        return;
                }
                else{
                    var st=vismoShape.getShape();
                    //if(st != "circle" &&  st != 'point') return;
                    this.lastSelected =vismoShape;
                    var hasController = false;
                }
                var that = this;
                
                

                var t = this.vismoCanvas.getTransformation();
                var bb = vismoShape.getBoundingBox();
                vismoShape.setProperty("onmousedown",function(e){if(that.lastSelected)that.startmoving(vismoShape);});
                vismoShape.setProperty("onmouseup",function(e){if(that.lastSelected)that.stopmoving(vismoShape);});
              
                var tl = VismoTransformations.applyTransformation(bb.x1,bb.y1,t);
                var br = VismoTransformations.applyTransformation(bb.x2,bb.y2,t);
                this.brResizer.css({display:"",top:br.y,left:br.x});
                this.el.css({display:"",width:bb.width * t.scale.x,height:bb.height * t.scale.y,left:tl.x,top:tl.y});
        
        }
};