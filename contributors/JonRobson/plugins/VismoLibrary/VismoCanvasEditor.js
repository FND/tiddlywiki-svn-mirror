var VismoCanvasEditor = function(vismoCanvas,options){
        //var toolbar = "<div class='VismoCanvasToolbar' style='position:relative;z-index:400;'><div class='selectshape button'>&nbsp;</div><div class='newshape button'>&nbsp;</div><div class='newline button'>&nbsp;</div><div class='newfreeline button'>&nbsp;</div></div>";
        var toolbar = "<div class='VismoCanvasToolbar' style='position:relative;z-index:400;'><div class='selectshape button'>&nbsp;</div><div class='newcircle button'>&nbsp;</div><div class='newline button'>&nbsp;</div></div>";
        if(!options) options = {};
        if(!options.toolbar) options.toolbar = ["selectshape","newcircle","newline"];
        
        this.options = options;
        this.el = vismoCanvas.getDomElement();
        jQuery(this.el).prepend(toolbar);
        this.vismoCanvas = vismoCanvas;
        var that = this;
        var f = function(s){    
            that._recalculateEdge(s);
            that.vismoCanvas.render();
        }
        this.manipulator = new VismoShapeManipulator(vismoCanvas,{movecomplete:f});
        
        this.init();



        var nextID = 0;
};

VismoCanvasEditor.prototype = {
        _recalculateEdge: function(movedShape){
            if(!movedShape)return;
            var movedID = movedShape.getProperty("id");
            var memory = this.vismoCanvas.getMemory();
            for(var i=0; i < memory.length; i++){
                var edgeShape = memory[i];
                if(edgeShape.getProperty("edge")){
                    var from =edgeShape.getProperty("from");
                    var to = edgeShape.getProperty("to");
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
      ,init: function(){
              var that = this;
              var createNewShape = function(e){
                  if(e.button == 2) return;
                      if(!that.tempShape.getProperty("hidden")){
                              that.tempShape.setProperty("hidden",true);
                              
                              var clone = that.tempShape.clone();
                              clone.setProperty("onmousedown",false);
                              clone.setProperty("unclickable",false);
                              clone.setProperty("id",that.nextID);
                              clone.setProperty("hidden",false);
                              that.vismoCanvas.add(clone);
                              that.vismoCanvas.render();
                              that.nextID +=1;
                        }
              };

              this.tempLine = new VismoShape({shape:"path",hidden:true},[0,0,0,0]);
              this.tempShape = new VismoShape({shape:"circle",hidden:"true",fill:"rgb(200,0,0)",onmousedown:createNewShape},[0,0,40]);
                            
              this.vismoCanvas.add(this.tempShape);
              this.vismoCanvas.add(this.tempLine);
              this.vismoCanvas.render();
              
              var mm = this.el.onmousemove;
              var mu = this.el.onmouseup;
              var ready;
              that.el.onmousemove = function(e){                     
                      var tool = that.getSelectedTool();
                      if(!that._vismoController && that.el.vismoController) {
                              that._vismoController = that.el.vismoController;
                        }
                        
                      if(tool == "newline"){
                              that.doLineDrawing(e);
                        }
                      else if(tool == "newfreeline")that.doFreeLineDrawing(e);
                      else if(tool == "newcircle")that.doShapeDrawing(e);
                              
                      
                      that.vismoCanvas.render();


                      if(mm) mm(e);
              };
              jQuery(that.el).mousedown(function(e){
                      var tool = that.getSelectedTool();
                      if(tool =='newfreeline')that._startCompleteLineDrawing(e);   
              });
              jQuery(that.el).dblclick(function(e){
                      var tool = that.getSelectedTool();
                      if(tool =='newline')that._startCompleteLineDrawing(e,true);   
              });
              
              jQuery(that.el).mouseup(function(e){
                      var tool = that.getSelectedTool();
                  
                      if(!jQuery(e.target).hasClass("button")){
                               var s = that.vismoCanvas.getShapeAtClick(e);

                              //if(!s && e.button == 2)that.manipulator.selectShape(false);
                              if(tool == "selectshape"){
                                    if(s)
                                      that.manipulator.selectShape(s);
                                    else
                                        that.manipulator.selectShape(false);
                              }
                              else if(tool == "newline" || tool == 'newfreeline')that._startCompleteLineDrawing(e);   
                              that.vismoCanvas.render();
                      }
                      if(mu)mu(e);
              });
              
              for(var i=0; i < this.options.toolbar.length; i++){
                  var toolname = this.options.toolbar[i];
                  var button = jQuery("."+toolname,this.el);
                  button.attr("_vismotoolname",toolname);
                  button.click(function(e){
                      e.stopPropagation();
                      that.setSelectedTool(jQuery(this).attr("_vismotoolname"));
                      jQuery(".button").removeClass("selected");
                      jQuery(this).addClass("selected");
                  });
              }
              jQuery("."+this.options.toolbar[0]).click();
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

              
              if(this._startAt && e.button == cancelButton || terminate){ //right mouse  
                      if(this._vismoController)this._vismoController.enable();
                                if(tool == 'newline'){
                                        var c = this.tempLine.getCoordinates();   
                                        this.tempLine.setCoordinates(c.slice(0,c.length-2));       
                                } 
                              this.vismoCanvas.add(this.tempLine.clone());
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
                      this.tempShape.setProperty("hidden",false);
                        this.el.style.cursor = "crosshair";
              }
              if(id == 'newline'){
                      this.tempLine.setProperty("hidden",false);
                this.el.style.cursor = "crosshair";
                }              
              this.selectedTool = id;
      }
      ,getManipulator: function(){
          return this.manipulator;
      }
};

var VismoShapeManipulator = function(vismoCanvas,options){
        if(!options) options = {};
        this.options = options;
        var element  = vismoCanvas.getDomElement();
        this.vismoCanvas = vismoCanvas;
        jQuery(element).append("<div class='VismoShapeManipulator' style='position:absolute;border:solid 1px black;'></div><div class='brResizer' style='display:none;position:absolute;z-index:1000;'></div>");
        this.el = jQuery(".VismoShapeManipulator",element);
        this.parentCanvas = element;
        this.brResizer =jQuery(".brResizer",element);
        var that = this;

        this.brResizer.mousedown(function(e){that.toggleResizing();});
        this.brResizer.mouseup(function(e){that.toggleResizing();});
        var centerMark = document.createElement("div");
        centerMark.className = "centerMark";
        centerMark.style.position ="absolute";
        
        element.appendChild(centerMark);
        this.centerMark = centerMark;        
        this.elementCenters = {};
        jQuery(document).mousemove(function(e){
                if(!that.vismoController && that.parentCanvas.vismoController) that.vismoController = that.parentCanvas.vismoController;
                if(that.isResizing){
                        that._resizeFromBottomRight(e);
                }
                jQuery(that.centerMark).css({display:"none"});
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
                       if(that.vismoController)that.vismoController.disable();
                       
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
                         jQuery(that.centerMark).css({left: pos.x - w/2,display:"",top:pos.y - h/2});
                    }
                    else{
                        jQuery(that.centerMark).css({display:"none"});
                    }

                }
                 
                 
            });

            jQuery(document).keypress(function(e){
                e.preventDefault();
                var keycode = (e.keyCode ? e.keyCode : e.which);
                var backspaceKey = 8;
                var dKey = 100;
                var deleteKey = -1;
                if(keycode == backspaceKey || keycode ==dKey || keycode == deleteKey){
                    console.log("Delete me!!");
                }

                return false;
            });
};
VismoShapeManipulator.prototype = {
        overCenter: function(e){
               if(jQuery(e.target).hasClass("centerMark")) return this.vismoCanvas.getShapeAtClick(e);
               else return false;
        }
        ,toggleResizing: function(){
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
                if(this.options.movecomplete)this.options.movecomplete(vismoShape);
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
                        if(this.vismoController)this.vismoController.enable();
                        return;
                }
                else{
                    var st=vismoShape.getShape();
                    if(st != "circle" &&  st != 'point') return;
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

        ,openRightMenu: function(){
            
        }
};