var VismoCanvasEditor = function(vismoCanvas){
        var toolbar = "<div class='VismoCanvasToolbar' style='position:relative;z-index:400;'><div class='selectshape button'>&nbsp;</div><div class='newshape button'>&nbsp;</div><div class='newline button'>&nbsp;</div><div class='newfreeline button'>&nbsp;</div></div>";
        this.el = vismoCanvas.getDomElement();
        jQuery(this.el).prepend(toolbar);
        this.vismoCanvas = vismoCanvas;
        
        this.init();
        this.manipulator = new VismoShapeManipulator(vismoCanvas);
        
};

VismoCanvasEditor.prototype = {
      init: function(){
              var that = this;
              var createNewShape = function(e){
                      if(!that.tempShape.getProperty("hidden")){
                              that.tempShape.setProperty("hidden",true);
                              
                              var clone = that.tempShape.clone();
                              clone.setProperty("onmousedown",false);
                              clone.setProperty("unclickable",false);
                              clone.setProperty("hidden",false);
                              that.vismoCanvas.add(clone);
                              that.vismoCanvas.render();
                        }
              };

              this.tempLine = new VismoShape({shape:"path",hidden:true},[0,0,0,0]);
              //this.tempShape = new VismoShape({shape:"circle",hidden:"true",fill:"rgb(200,0,0)",onmousedown:createNewShape},[0,0,40]);
              this.tempShape = new VismoShape({shape:"circle",hidden:"true",fill:"rgb(200,0,0)",onmousedown:createNewShape},[0,0,40]);
              //this.vismoCanvas.makeMoveable(false,[this.tempLine,this.tempShape]);
                            
              this.vismoCanvas.add(this.tempShape);
              this.vismoCanvas.add(this.tempLine);
              this.vismoCanvas.render();
              
              var mm = this.el.onmousemove;
              var mu = this.el.onmouseup;
              var ready;
              that.el.onmousemove = function(e){
                      
                      var tool = that.getSelectedTool();
                      if(!that._vismoController && that.el.vismoController) that._vismoController = that.el.vismoController;
                    
                        
                      if(tool == "line")that.doLineDrawing(e);
                      else if(tool == "freeline")that.doFreeLineDrawing(e);
                      else if(tool == "shape")that.doShapeDrawing(e);
                      that.vismoCanvas.render();


                      if(mm) mm(e);
              };
              jQuery(that.el).mousedown(function(e){
                      var tool = that.getSelectedTool();
                      if(tool =='freeline')that._startCompleteLineDrawing(e);   
              });
              
              jQuery(that.el).mouseup(function(e){
                      var tool = that.getSelectedTool();
                  
                      if(!jQuery(e.target).hasClass("button")){
                               var s = that.vismoCanvas.getShapeAtClick(e);

                              //if(!s && e.button == 2)that.manipulator.selectShape(false);
                              if(tool == "select" && s){
                                      that.manipulator.selectShape(s);
                              }
                              else if(tool == "line" || tool == 'freeline')that._startCompleteLineDrawing(e);   
                              that.vismoCanvas.render();
                      }
                      if(mu)mu(e);
              });
              
              jQuery(".newshape",this.el).click(function(e){
                      that.setSelectedTool("shape");
                      jQuery(".button").removeClass("selected");
                      jQuery(this).addClass("selected");
                      that.vismoCanvas.render();
              });
              jQuery(".newline",this.el).click(function(e){
                      jQuery(".button").removeClass("selected");
                      jQuery(this).addClass("selected");
                      that.setSelectedTool("line");
              });
              jQuery(".newfreeline",this.el).click(function(e){
                      jQuery(".button").removeClass("selected");
                      jQuery(this).addClass("selected");
                      that.setSelectedTool("freeline");
              });
              
              jQuery(".selectshape",this.el).click(function(e){
                      jQuery(".button").removeClass("selected");
                      jQuery(this).addClass("selected");
                      that.setSelectedTool("select");
              });
              this.setSelectedTool("select");
      }
      ,doShapeDrawing: function(e){
              var xy = this.vismoCanvas.getXY(e);
              this.tempShape.setCoordinates([xy.x,xy.y,40]);
              
      }
      ,doFreeLineDrawing: function(e){
              if(this._vismoController)this._vismoController.disable();
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
      }
      ,_setupLine: function(){
              var xy = this._startAt;
              this.tempLine.setCoordinates([xy.x,xy.y,xy.x,xy.y]);
      }
      ,_startCompleteLineDrawing: function(e){
              var xy = VismoClickingUtils.getRealXYFromMouse(e,this.vismoCanvas.getTransformation());
              
              var tool = this.getSelectedTool();
              var cancelButton;
              if(tool == 'line') {
                      cancelButton = 2;
              }
              if(tool == 'freeline') { //cancel with the left
                      if(VismoUtils.browser.isIE) cancelButton =1;
                      else cancelButton = 0; 
                     
              }
              
              if(this._startAt && e.button == cancelButton){ //right mouse  
                      if(this._vismoController)this._vismoController.enable();
                                if(tool == 'line'){
                                        var c = this.tempLine.getCoordinates();   
                                        this.tempLine.setCoordinates(c.slice(0,c.length-2));       
                                } 
                              this.vismoCanvas.add(this.tempLine.clone());
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
              
              if(id == 'shape')this.tempShape.setProperty("hidden",false);
              if(id == 'line')this.tempLine.setProperty("hidden",false);              
              this.selectedTool = id;
      }
};

var VismoShapeManipulator = function(vismoCanvas){
        var element  = vismoCanvas.getDomElement();
        this.vismoCanvas = vismoCanvas;
        jQuery(element).append("<div class='VismoShapeManipulator' style='position:absolute; z-index:1000;border:solid 1px black;'></div><div class='brResizer' style='display:none;position:absolute;z-index:1000;'></div>");
        this.el = jQuery(".VismoShapeManipulator",element);
        this.parentCanvas = element;
        this.brResizer =jQuery(".brResizer",element);
        var that = this;

        this.brResizer.mousedown(function(e){that.toggleResizing();});
        this.brResizer.mouseup(function(e){that.toggleResizing();});
        
        
        window.onmousemove = function(e){
                if(!that.vismoController && that.parentCanvas.vismoController) that.vismoController = that.parentCanvas.vismoController;
                if(that.isResizing){
                        that._resizeFromBottomRight(e);
                }
                
               if(that._moveshape){
                       var pos = that.vismoCanvas.getXY(e);
                       var t = that._moveshape.getTransformation();
                       if(!t) t = {};
                       t.translate = {x: pos.x,y:pos.y};
                       that._moveshape.setTransformation(t);
                       if(that.vismoController)that.vismoController.disable();
                 }
            };
};
VismoShapeManipulator.prototype = {
        toggleResizing: function(){
                var that = this;
                

               if(this.isResizing) {
                       if(this.vismoController) {
                               this.vismoController.enable();
                       }
                       
                       this.isResizing = false;
                       
               }
               else{
                       if(this.vismoController) {
                               this.vismoController.disable();
                       }
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
                      if(!t) t = {};
                      if(!t.scale) t.scale = {};
                      t.scale.x = newscale;
                      t.scale.y = newscale;
                      this.lastSelected.setTransformation(t);
              }
              this.brResizer.css({display:"",top:br.y-5,left:br.x-5});       
        }
        
        ,stopmoving: function(vismoShape){
                this._moveshape = false;
        }
        ,startmoving: function(vismoShape){
                this._moveshape = vismoShape;
        }
        ,selectShape: function(vismoShape){
                var st=vismoShape.getShape();
                if(st != "circle" &&  st != 'point') return;
                this.lastSelected =vismoShape;
                var hasController = false;

                if(!vismoShape){
                        this.el.css({display:"none"});
                        this.brResizer.css({display:"none"});
                        return;
                }
                var that = this;
                
                

                var t = this.vismoCanvas.getTransformation();
                var bb = vismoShape.getBoundingBox();
                vismoShape.setProperty("onmousedown",function(e){that.startmoving(vismoShape,e);});
                vismoShape.setProperty("onmouseup",function(e){that.stopmoving(vismoShape,e);});
                var tl = VismoTransformations.applyTransformation(bb.x1,bb.y1,t);
                var br = VismoTransformations.applyTransformation(bb.x2,bb.y2,t);
                this.brResizer.css({display:"",top:br.y,left:br.x});
                this.el.css({display:"",width:bb.width * t.scale.x,height:bb.height * t.scale.y,left:tl.x,top:tl.y});
        
        }
        
};