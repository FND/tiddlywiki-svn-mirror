/***
|''Name:''|Jon Robson's VismoLibrary|
|''Description:''|An opensource library of javascript code designed to create clickable graphics in canvas with VML alternative for Internet Explorer browsers. The purpose of this is to provide hackable, extendable graphics based plugins without being locked in to consumer products such as Flash.|
|''Author:''|JonRobson (http://www.jonrobson.me.uk/Vismo)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/Library/Vismo/|
|''Version:''|0.95 |
|''Dependencies:''| Requires jQuery|
|''Comments:''|Please raise questions and make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Contributors:''"|
Graph algorithms for VismoGraphs come from uses code from ECO Tree http://www.codeproject.com/KB/scripting/graphic_javascript_tree.aspx#quick|
and Nicolas Belmonte's JIT library (http://thejit.org/)
|
"|''Usage:''|
Not much good on it's own - it provides some nice functions to create graphicsy plugins.
Currently provides horsepower to the following plugins amongst others:
GeoTiddlyWiki (http://www.jonrobson.me.uk/workspaces/tiddlers/GeoTiddlyWiki/), ImageTaggingPlugin, TiddlyTagMindMap (http://tiddlytagmindmap.tiddlyspot.com)
!Wouldn't have been possible without..
http://spatialreference.org/ref/sr-org/google-projection/ for help with google projection hack
***/
String.prototype.toJSON = function(){var namedprms = this.parseParams(null, null, true);var options ={};for(var i=0; i < namedprms.length;i++){var nameval = namedprms[i];if(nameval.name)options[nameval.name] = nameval.value;}return options;};
var Vismo = {store:{Canvas:{}}};
var VismoCanvas = function(element,options){

    if(!VismoUtils.browser.isIE6) this._renderSpeed = 5;
    this._referenceid = Math.random();
    Vismo.store.Canvas[this._referenceid] = this;
    this._lastTransformation = {scale:{}};
    //jQuery(element).parent()
    if(element.length){ //for jquery
        var result = [];
        for(var i=0; i < element.length; i++){
            var x = new VismoCanvas(element[i],options);
            result.push(x);
        }
        return x;
    }
    this.className = "VismoCanvas";
    this._idtoshapemap = {};
    if(!options) options = {};
  if(typeof element == 'string') element= document.getElementById(element);
  if(!element) throw "Element doesn't exist!";
  
  var canvaswidth = jQuery(element).width();
  var canvasheight = jQuery(element).height();
  if(canvaswidth !== 0 && canvasheight !== 0) {	
		element.style.width = canvaswidth;
  	element.style.height = canvasheight;
	}
  if(element.vismoClicking) {
    var update = element.vismoClicking;
    return update;
  }
  if(!options.pointsize){
        options.pointsize = 5;
    } 
  
  this.id = element.id
  this.options = options;
  
  var wrapper = element;
  this.settings = {};
  this.settings.browser = !VismoUtils.browser.isIE ? 'good' : 'ie'
  this.settings.globalAlpha = 1;
  var canvas;
  var hideoverflow;
  if(this.settings.browser =='good'){
      canvas = document.createElement('canvas');
      canvas.className = "VismoCanvasRenderer";
      //hideoverflow = canvas;
      hideoverflow = document.createElement("div");
      hideoverflow.appendChild(canvas);
  }    
  else
  {
      var existing = jQuery(".VismoIECanvas",wrapper);
      if(existing.length > 0){
        canvas = existing[0];
        jQuery(canvas).addClass("VismoCanvasRenderer");
        hideoverflow = canvas.parentNode;
        this._flag_load_existing_vml = true;
      }
      else{
         hideoverflow = document.createElement("div");
        canvas = document.createElement('div');
        canvas.className = "VismoIECanvas VismoCanvasRenderer";        

        hideoverflow.appendChild(canvas);   
      }
      canvas.style.setAttribute('cssText', 'position:absolute;left:0px;top:0px;', 0);
     
      
  }
  
  
  //.VismoIECanvas
  var width =parseInt(wrapper.style.width);
  var height =parseInt(wrapper.style.height);
  canvas.width = width;
  canvas.height = height;
  this.dimensions = {width:parseInt(width),height:parseInt(height)};
  
  var vc = this;
  this.wrapper = wrapper;
  if(options.vismoController){
      if(!options.vismoController.handler){
          options.vismoController.handler = function(t){
              if(vc.memory.length > 0)vc.transform(t);
          }
      }
      this.vismoController = new VismoController(this.getDomElement(),options.vismoController);
   
  }
  else{
    this.setTransformation({translate:{x:0,y:0},scale:{x:1,y:1},origin:{x:canvaswidth/2, y:canvasheight/2}});
  }
  this.cleanGrid();
  if(!element.className)element.className = "VismoCanvas";
  jQuery(canvas).css({width:width, height:height,'z-index':1,position:'absolute'});        
  element.appendChild(hideoverflow);
  
  jQuery(hideoverflow).css({width:width, height:height,position:"absolute",overflow:"hidden",left:"0px",top:"0px"});
  var labels =  document.createElement("div");
    jQuery(labels).css({position:"absolute",width:"100%",height:"100%","z-index":9});      
    labels.className = "VismoLabels";
    hideoverflow.appendChild(labels);
    this.labelHolder = labels;
    this.labels = [];
  this.canvas = canvas;

  this.memory = [];
  
  element.vismoClicking = true;//this;//true;//this
    jQuery(this.canvas).mousedown(function(e){
    if(e.button !=2)e.preventDefault();
    });

  
   
  this._setupMouse();



  this.mouse({down:options.mousedown,up:options.mouseup,move:options.move,dblclick:options.dblclick,keypress:options.keypress});
  var tooltipfunction;
  if(options.tooltipfunction){
      if(typeof options.tooltipfunction == 'boolean'){
          tooltipfunction = function(el,s){
              if(s){
                  el.innerHTML = "cool"+s.getProperty("id");}
              }
      }
      else{
          tooltipfunction = options.tooltipfunction;
      }
      this.addTooltip(tooltipfunction)
  }

  if(options.shapes) {
    for(var i=0; i < options.shapes.length; i++){    
      this.add(options.shapes[i]);
    }
    this.render();
  }
  var that = this;
  jQuery(window).unload(function(){
    that.labelHolder = null;
    that.canvas = null;
    that.tooltip = null;
    that.wrapper = null;
    hideoverflow = null;
  });  
};

VismoCanvas.prototype = {
    _renderSpeed: 100,
    teardown: function(){
      VismoUtils.scrubNode(this.canvas);
      VismoUtils.scrubNode(this.labelHolder); 
      jQuery(this.canvas).unbind("mousedown");
      this.wrapper.onmouseout = null;
      this.wrapper.onmouseover = null;        
    }
  ,getDomElement: function(args){
    return this.wrapper;
  }
  ,addTooltip: function(args){
      var addContent = arguments[0];
      var wrapper = this.wrapper;
          if(addContent) this.tooltipAddContent = addContent;
          if(!this.tooltip){
                  var tooltip =  document.createElement("div");
                        jQuery(tooltip).css({position:"absolute","z-index":1000,display:"none"});      
                        tooltip.className = "VismoTooltip";
                        
                        jQuery(tooltip).mousedown(function(e){e.preventDefault();if(wrapper && wrapper.onmousedown)wrapper.onmousedown(e);});
                        jQuery(tooltip).mousemove(function(e){e.preventDefault();});
                        jQuery(this.wrapper).parent().append(tooltip);
                        this.tooltip = tooltip;
                         jQuery(window).unload(function(){that.tooltip = false;});
                                   
                }
                if(!this.tooltipAdded){
                        var move= this.onmousemove;
                        var that = this;
                        var lastshape;
            var newmove = function(e,shape){
                    if(!e) e = window.event;
                    if(!that.tooltip) return;     
                                jQuery(that.tooltip).html("");
                        
                        if(shape && lastshape != shape){
                                var bb = shape.getBoundingBox();
                                 //var pos = VismoClickingUtils.getMouseFromEvent(e);
                            if(that.tooltipAddContent)that.tooltipAddContent(that.tooltip,shape);
                            var pos = VismoTransformations.applyTransformation(bb.x2,bb.y1,that.getTransformation())
                            //var pos= {x: bb.center.x, y:bb.center.y};
                            var w = jQuery(that.wrapper).width();
                            var h = jQuery(that.wrapper).height();
                            var off = jQuery(that.wrapper).offset();
                            if(pos.x > off.left + w) pos.x = off.left + w;
                            
                            //jQuery(that.tooltip).css({top:0, right:0});             
                                }
                    if(that.tooltipAddContent && shape){
                            that.tooltipAddContent(that.tooltip,shape);
                            lastshape = shape;
                            jQuery(that.tooltip).css({display:""});
                    }
                    else{
                           jQuery(that.tooltip).css({display:"none"});
                    }     
                    if(move)move(e,shape);
                    
            };
            this.onmousemove = newmove;
                        this.tooltipAdded = true;
                }
  }
  ,getXYWindow: function(args){
      var e = arguments[0];
         var t = this.getTransformation();
         var pos = this.getXY(e);
         return  VismoTransformations.applyTransformation(pos.x,pos.y,t);
  }
  ,getXY: function(args){
      var e = arguments[0];
    return VismoTransformations.getXY(e,this.getTransformation());
  }
  ,mouse: function(args){
      
      if(!args){
          return {up: this.onmouseup, down: this.onmousedown, move: this.onmousemove, dblclick: this.ondblclick,keypress:this.onkeypress};
      }
      else{
          var args = arguments[0];
          //console.log(args.up,args.down);
          if(args.down)this.onmousedown = args.down;
        if(args.up)this.onmouseup = args.up;
        if(args.move)this.onmousemove=  args.move;
        if(args.dblclick) this.ondblclick = args.dblclick;
        if(args.keypress) this.onkeypress = args.keypress;

        //if(this.madeMoveable) this.makeMoveable();
        //if(this.tooltipAdded) this.addTooltip();          
      }
  }

  ,_setupMouse: function(args){
    var that = this;
    this.onmousedown = function(e,s,pos){};
    this.onmouseup = function(e,s,pos){};
    this.onmousemove = function(e,s,pos){};
    this.ondblclick = function(e,s,pos){};
    this.onkeypress = function(e){};
  

    this._applyMouseBehaviours(this.wrapper);
    for(var i =0; i < this.wrapper.childNodes.length; i++){
      var child = this.wrapper.childNodes[i];
      //this._applyMouseBehaviours(child);
    }
  
  }
  ,_applyMouseBehaviours: function(args){
      var el = arguments[0];
      var that = this;
          
    var newbehaviour = function(e){
        //var t = VismoClickingUtils.resolveTargetWithVismo(e);              
        //if(t && t.getAttribute("class") == 'vismoControl') return false;
        var shape = that.getShapeAtClick(e,el);
        return shape;
      
    };
      var applymice = function(el){
          var down = el.onmousedown;
        var up = el.onmouseup;
        var mv = el.onmousemove;
        var dblclick =el.ondblclick;
        this.initialKeyPress = window.onkeypress;
        //el.oncontextmenu=function(args) {  return false};     
        el.onmouseover = function(e){

            if(!that.keypressactive) {

              that.keypressactive =  true;
              window.onkeypress =function(e){
                  that.onkeypress(e);
                  if(that.initialKeyPress)that.initialKeyPress(e);
              }
              document.onkeypress = function(e){if(!e) e= window.event;if(that.initialKeyPress)that.initialKeyPress(e);if(!e) e= window.event;var s = newbehaviour(e); 
                      if(that.onkeypress)that.onkeypress(e,s)
                     
              };
            }
        };
        el.onmouseout = function(e){if(!e) e= window.event;that.keypressactive = false;};
      
      
        jQuery(el).mousedown(function(e){
            //console.log("md",el);
          var s = newbehaviour(e); 
          if(s){
            if(s.getProperty("onmousedown")){
                    s.getProperty("onmousedown")(e,s);  
                    if(that.onmousedown)that.onmousedown(e,s);

            }
            else{
                if(that.onmousedown)that.onmousedown(e,s);
            }
          }
          else {
              //console.log("ic");
                  if(that.onmousedown)that.onmousedown(e,s);
                  if(down)down(e,s);
          }

        });

            jQuery(el).dblclick(function(e){
          if(!e) e= window.event;
          var s = newbehaviour(e);         
          if(s) {

            if(s.getProperty("ondblclick")){
                    s.getProperty("ondblclick")(e,s);
            }
            else if(that.ondblclick){
                          that.ondblclick(e,s);
                  }
                  else{


                  }
          }
          else {
            if(that.ondblclick){
                          that.ondblclick(e,s);
                  }
            if(dblclick){
                    dblclick(e,s);
                                    }
          }
        });
            jQuery(el).mouseup(function(e){ 
                //console.log("mu",el);
                    var s = newbehaviour(e);
                    if(s){
                        if(s.getProperty("onmouseup")){
                                s.getProperty("onmouseup")(e,s);
                                if(that.onmouseup)that.onmouseup(e,s);

                        }
                        else{
                            if(that.onmouseup)that.onmouseup(e,s);
                        }


                }
                else{
                        if(that.onmouseup)that.onmouseup(e,s);
                        if(up)up(e,s);
                }
        });
        var defaultCursor;
        jQuery(el).mousemove(function(e){ if(!e) e= window.event;var s = newbehaviour(e);

                if(!VismoUtils.browser.isIE){
                        if(jQuery(el).hasClass("overVismoShape")) jQuery(el).removeClass("overVismoShape");
                }
                if(!VismoUtils.browser.isIE){

                        if(jQuery(el).hasClass("overVismoPoint"))jQuery(el).removeClass("overVismoPoint");
                }

                if(s && !s.getProperty("unclickable")){


                        if(that.ondblclick || that.onmousedown || that.onmouseup) {
                                var sh;
                                if(s){
                                       sh  = s.getShape();
                                       if(!VismoUtils.browser.isIE  &&sh == "point") jQuery(el).addClass("overVismoPoint");
                                }
                                if(!VismoUtils.browser.isIE && !jQuery(el).hasClass("panning") && !jQuery(el).hasClass("zooming"))jQuery(el).addClass("overVismoShape");
                              }

                        if(s.getProperty("onmousemove"))s.getProperty("onmousemove")(e,s);
                }
                else{
                        //el.style.cursor = defaultCursor;
                }
                if(that.onmousemove)that.onmousemove(e,s); 
                if(mv)mv(e,s);
        });         

        };
        applymice(el);
    


  }
  ,getDimensions: function(args){
    return {width: this.width() , height: this.height()};
  }
  ,height: function(){
      return this.dimensions.height;

  },
  width: function(){
      return this.dimensions.width;
  }
  ,resize: function(args){
    var width = arguments[0]; var height=arguments[1];
    if(!height) height = jQuery(this.wrapper).height();
    if(!width) width = jQuery(this.wrapper).width();
  
    if(this.canvas.getAttribute("width")){
      this.canvas.width = width;
      this.canvas.height = height;
    }
    jQuery(this.hideoverflow).css({height:height,width:width});
    jQuery(this.wrapper).css({height:height,width:width});
    jQuery(this.canvas).css({height:height,width:width});
    if(this.vismoController){
        var t = this.vismoController.getTransformation();
        t.origin.x= width/2;
        t.origin.h = height/2;
        this.vismoController.setTransformation(t);
    }
  }
  ,setTransparency: function(args){  
      var alpha = arguments[0];
    this.settings.globalAlpha = alpha
  }
  ,_setupCanvasEnvironment: function(args){
    if(VismoUtils.browser.isIE) return;
    var ctx = this.canvas.getContext('2d');
    var s =this.getTransformation().scale;
    if(s && s.x)ctx.lineWidth = (0.5 / s.x);
    ctx.globalAlpha = this.settings.globalAlpha;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.lineJoin = 'round'; //miter or bevel or round  
  }
  ,clear: function(args){
      var deleteMemory = arguments[0];
    if(deleteMemory){
      this.clearMemory();
    }
    this._maxX = 0;
    this._maxY = 0;
        
    
    if(this.canvas && !this.canvas.getContext) {
      return;
    }
    jQuery(".VismoLabels",this.wrapper).html("");
    this.setTransformation(this.getTransformation());
    var ctx = this.canvas.getContext('2d');
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);    
    
  }  
  ,markGrid: function(ref){
    if(ref[0] === false || ref[1] === false)return;
    if(!this.pointsGrid[ref[0]]) this.pointsGrid[ref[0]]= {};
    this.pointsGrid[ref[0]][ref[1]] = true;
  }
  ,cleanGrid: function(){
    this.pointsGrid = {};
    this._cachedLookupGridReference = {"x":{},"y":{}};
    var ow = this.width()/2;
    var oh = this.height()/2;
    //var ow = this.width()/2;
    //var oh = this.height()/2;
    //this.topLeftGrid = VismoTransformations.undoTransformation(-ow,-oh,this.transformation);
  }
  ,isMarkedGrid: function(ref){
    if(!this.pointsGrid[ref[0]])return false;
    else if(this.pointsGrid[ref[0]][ref[1]]) return true;
    else return false;
  }
  ,getGridReference: function(vismoShape){
    if(!this.topLeftGrid)return [false,false];
    VismoTimer.start("VismoCanvas.getGridReference");
    var bb = vismoShape.getBoundingBox();
    var center = bb.center;
    var w = this.width();
    var h =this.height();
    var ps = this.options.pointsize;

    var transformation= this.transformation;
    var t = transformation.translate,s=transformation.scale;
    if(!t) t = {x:0,y:0};
    if(!s)s = {x:1,y:1};
    
    var refx,refy;
    ps /= s.x;
    
    var horizontal_chunks = Math.floor(w/ps);
    var vertical_chunks = Math.floor(h/ps);
    refx = this._cachedLookupGridReference["x"][center.x];
    refy = this._cachedLookupGridReference["y"][center.y];
    if(!refx){
      refx = ((center.x - this.topLeftGrid.x+ ps-(ps/10)));
      refx /= ps;
      refx = parseInt(refx);
    }
    if(!refy){
      refy = ((center.y - this.topLeftGrid.y+ ps-(ps/10)));
      refy/= ps;
      refy =parseInt(refy);
    }
    this._cachedLookupGridReference["x"][center.x] = refx;
    this._cachedLookupGridReference["y"][center.y] = refy;
    
		if(refx < 1 || refx > horizontal_chunks)refx = false;
		if(refy < 1 || refy > vertical_chunks)refy = false;
    VismoTimer.end("VismoCanvas.getGridReference");
    return [refx,refy];    
  }
  
  ,ie_render: function(args){
    var projection= arguments[0];
    VismoTimer.start("VismoCanvas.ie_render");
    //this.render = this.ie_render;
    var that = this;
    var transformation = this.getTransformation();
    if(this.options.beforeRender) this.options.beforeRender(this);
    if(transformation.scale.x) sc = transformation.scale.x; else sc = 1;
    //determine point size
    var ps = this.options.pointsize / parseFloat(sc);
    
    tran = transformation;
    var o = tran.origin,t = tran.translate, s = tran.scale;
    jQuery(this.canvas).css({left:o.x+(t.x*s.x),top:o.y +(s.y*t.y),zoom:s.x});    
    var mem =that.memory;
    var firstTime = false;
    var appendTo;
    if(that.canvas.childNodes.length == 0){
        firstTime = true;
        appendTo  = document.createElement("div");
    }
    else{
        appendTo = that.canvas;
    }
    var lastT = this._lastTransformation.scale;
    var shapes = this._lastTransformation.shapes;
    var mlen = mem.length;
    if(lastT.x  ===s.x && lastT.y === s.y && mlen == shapes){
        tran = false; //stop a transformation from being applied we've covered it here
    }
    var globalAlpha =that.settings.globalAlpha; 
    var start = 0;
    var dimensions = this.dimensions;
    var run_it = function(){
      var inc = 20;
      for(var i=start; i < start+inc; i++){
        var vs =mem[i];
        if(!vs)break;
        var st = vs.properties.shape 
        if(st == 'domElement')tran = transformation;
        vs.setDimensions(ps,ps);
        vs.properties.strokeWidth /= s.x;
        vs.render(that.canvas,tran,projection,true,null,dimensions);        
        if(vs.vmlfill && !vs.vmlfill.opacity && globalAlpha){
          vs.vmlfill.opacity =globalAlpha;
        }
      }    
      that._lastTransformation = {scale:{x:s.x,y:s.y},shapes:mlen};
      if(firstTime){
          that.canvas.appendChild(appendTo.cloneNode(true));
      }
      start += inc;
      if(start < mlen){
        window.setTimeout(run_it,that._renderSpeed);
      }
    };
    (function(){run_it();})();
    VismoTimer.end("VismoCanvas.ie_render");
      
        
  }
  ,canvas_render: function(args){
    VismoTimer.start("VismoCanvas.canvas_render");
    this.cleanGrid();
    var paintedXPixels = {}, paintedYPixels = {};
    var projection = arguments[0];
    this.render = this.canvas_render;
    var that = this;
    var transformation = this.getTransformation();
    if(this.options.beforeRender) this.options.beforeRender(this);  
    var sc;
    if(transformation.scale.x) sc = transformation.scale.x; else sc = 1;
    //determine point size
    var ps = this.options.pointsize / parseFloat(sc);
    if(ps > this.options.pointsize){
      ps = this.options.pointsize;
    }
    var appendTo;
    var mem =that.getMemory();
    this._setupCanvasEnvironment();
    var ctx = that.canvas.getContext('2d');
    ctx.save();
    tran = false;
    if(transformation){
      var o = transformation.origin;
      var tr = transformation.translate;
      var s = transformation.scale;
      var r = transformation.rotate;

      if(o && s && tr){
        if(typeof(o.x) == 'number')ctx.translate(o.x,o.y);
        if(typeof(s.x) == 'number')ctx.scale(s.x,s.y);
        if(typeof(tr.x) == 'number')ctx.translate(tr.x,tr.y);
      }
      if(r && r.x)ctx.rotate(r.x);
    }
    var browser = that.settings.browser;
    appendTo = that.canvas;
    VismoTimer.start("VismoCanvas.canvas_render.loop");
    for(var i=0; i < mem.length; i++){
      var vs = mem[i];
      var st = vs.properties.shape;
      var marked = false;
      if(st == 'point'){
        vs.setDimensions(ps,ps);
        var ref = this.getGridReference(vs);
        marked = this.isMarkedGrid(ref);
        this.markGrid(ref);
        
      }
      if(vs.optimise(that.canvas,transformation,projection)){
        if(st == 'domElement')tran = transformation;
      //else if(st == 'point')vismoShape.setDimensions(ps,ps);
        if(!marked)vs.render(appendTo,tran,projection,true,browser);
      }
    }
    VismoTimer.end("VismoCanvas.canvas_render.loop");
    if(ctx)ctx.restore();
    VismoTimer.end("VismoCanvas.canvas_render");
  }
  ,render: function(args){
    var projection = arguments[0];
    if(this.settings.browser == 'good'){
            this.canvas_render(projection);
    }
    else{
      this.ie_render(projection);
    }
  }
  ,getTransformation: function(args){
    if(!this.transformation) {
    var ox = parseInt(this.canvas.style.width);
    var oy = parseInt(this.canvas.style.height);
    this.transformation = {scale:{x:1,y:1},translate:{x:0,y:0},origin:{x: ox/2, y: oy/2}};
    //this.transformation = VismoTransformation.getBlankTransformation(this.canvas);
    }
    return this.transformation;
  }
  
  ,setTransformation: function(args){
      var transformation = arguments[0];
      var w =this.width();
      var h = this.height();
      this._transformLabels(transformation);
        //console.log(transformation.origin.x,transformation.translate.x,transformation.translate.y);
        if(!transformation.origin){
                transformation.origin = {};
                transformation.origin.x = w / 2;
                transformation.origin.y = h / 2;
        }
      
    if(transformation) this.transformation = transformation;
    var t = transformation.translate, s = transformation.scale;  
    transformation.cache = {id1:[s.x,",",s.y].join(""),id2:[t.x,",",t.y].join("")};
    this.topLeftGrid= VismoTransformations.undoTransformation(0,0,transformation);
   
  }
    ,_transformLabels: function(transformation){
        //console.log("in transformLabels");
        
        var translate = transformation.translate;
        var scale = transformation.scale;
        var o = {x:this.width()/2,y:this.height()/2};
         jQuery(this.labelHolder).css({top:parseInt(translate.y*scale.y),left:parseInt(translate.x *scale.x)});
        
        //console.log("labels",translate.x,translate.y,scale.x,scale.y);
        this._eachLabel(function(label){
            
            var jql = jQuery(label);
            
            var x = jql.attr("v_x");
            var y = jql.attr("v_y");
            if(!x || !y){
                return;
            }
            else{
                x =parseInt(x);
                y =parseInt(y);
            }
            var w = parseFloat(jql.attr("v_w")) * scale.x;
            var h = parseFloat(jql.attr("v_h")) * scale.y;
          
          var l =o.x + (x * scale.x);
          var t = o.y+(y*scale.y);
          
            var cssStr = {top:t,left: l};
            
            jql.css(cssStr);
            
        });
    }
    ,_eachLabel: function(f){
        var labels = jQuery("*",this.labelHolder);
        for(var i=0 ; i < labels.length; i++){
            f(labels[i]);
        }
    }
    ,centerOn: function(x,y,animate){
       
        var t=  this.getTransformation();
        
        
        t.translate.x = -x;
        t.translate.y = -y;

        if(this.vismoController){
            this.vismoController.setTransformation(t);
        }
        else{
            this.setTransformation(t);
        }
        this.render();
    }
  ,remove: function(args){
        var vismoShape = arguments[0];
       var shapes = this.getMemory();
       
     
       for(var i=0; i < shapes.length; i++){
            if(shapes[i] == vismoShape){
                this.memory.splice(i,1);
            }
       }
       if(vismoShape.vml)vismoShape.vml.scrub();
       
      var id = vismoShape.properties.id;
         delete this._idtoshapemap[id]
         
  }
  ,add: function(args){
      var vismoShape = arguments[0];
      this.needsSort = true;

      if(!vismoShape._isVismoShape){

          vismoShape = new VismoShape(vismoShape);
      
      }
      if(vismoShape.properties.shape =='point'){
          
            vismoShape.setDimensions(this.options.pointsize,this.options.pointsize);
        }
    if(!this.memory) this.memory = [];
    
    vismoShape.vismoCanvas = this;

    if(!vismoShape.getProperty("id")){
        var newid  = this.memory.length +"_" + Math.random();
        vismoShape.setProperty("id",newid);
    }
    if(this.options.lineWidth) vismoShape.setProperty("lineWidth",this.options.lineWidth);    
    vismoShape._canvasref = this._referenceid;
    var id = vismoShape.properties.id;
    this.memory.push(vismoShape);
    
    this._idtoshapemap[id] = vismoShape;
    vismoShape._vismoClickingID = id;


    return vismoShape;
  }
    ,clearLabels: function(){
        jQuery(this.labelHolder).html("");
    }
  ,addLabel:function(args){
      var domElement = arguments[0];
      var x=  arguments[1];
      var y = arguments[2];
      var shape = arguments[3]
      jQuery(domElement).addClass("canvasLabel");
      this.labelHolder.appendChild(domElement);
      var h = jQuery(domElement).height();
      var w= jQuery(domElement).width();      
      var top, left;
      left = x+ (this.width() /2) + w/2;
      top = (this.height()/2) + y + h/2 ;
      jQuery(domElement).attr("v_x",x);
      jQuery(domElement).attr("v_y",y);

      jQuery(domElement).attr("v_w",w);
      jQuery(domElement).attr("v_h",h);
      jQuery(domElement).css({position:"absolute",top:top,left:left});
      var that = this;
  
      
      jQuery(domElement).dblclick(function(e){that.ondblclick(e,shape);});
      jQuery(domElement).mouseup(function(e){that.onmouseup(e,shape);});
      jQuery(domElement).mousedown(function(e){that.onmousedown(e,shape);});
  }
  ,transform: function(args){
      var t = arguments[0];
      this.setTransformation(t);
      this.render();
  }
  ,clearMemory: function(args){
    for(var i=0; i < this.memory.length; i++){
      if(this.memory[i].vml){
        this.memory[i].vml.scrub();
      }
    }
    this._idtoshapemap = {};
    this.memory = [];
    this.clearLabels();

  },
  getMemory: function(args){
        if(this.needsSort){
          
          this.memory =this.memory.sort(function(a,b){
              var z1 = a.getProperty("z-index");
              var z2 =b.getProperty("z-index");
              if(z1 < z2) return -1;
              else if(z1 == z2){
                  var bba = a.getBoundingBox();
                  var bbb = b.getBoundingBox();
      
                  return (bbb.width * bbb.height) > (bba.width * bba.height);
              }
              else{
                  return 1;
              }
              });
          this.needsSort = false;
      }
          
      return this.memory;
  }
  ,getMemoryID: function(args){
      var vismoShape = arguments[0];
    if(vismoShape && vismoShape._vismoClickingID)
      return vismoShape._vismoClickingID;
    else{
      return false;
    }
  }
  ,getShapeWithID: function(args){
      var id = arguments[0];
      var mem = this.getMemory();
      if(this._idtoshapemap[id]) return this._idtoshapemap[id];
      else return false;
  }
  ,getShapeAtClick: function(args){
      var e = arguments[0];
      var el = arguments[1]; //the dom element the behaviour occurred o
    if(!e) {
      e = window.event;
    }
  
    var node = VismoClickingUtils.resolveTarget(e);
    //alert(node.tagName);
    if(node && node.tagName) { //vml vismoShape
        if(node.tagName.toUpperCase() == 'SHAPE'){
            if(node._vismoClickingID){
                
                var shape = this.getShapeWithID(node._vismoClickingID);
                if(shape) return shape;
            }
            
      }
      
    }
        
    var target = VismoClickingUtils.resolveTargetWithVismo(e);
      if(el)target =el;
      //console.log(target);
    if(!target) return;
    
    var offset = jQuery(target).offset();

    var xy= VismoClickingUtils.scrollXY();
    x = e.clientX + xy.x - offset.left;
    y = e.clientY + xy.y - offset.top;

    if(this.memory.length > 0){
      var shape = false;
      
      if(target.vismoClicking){
          var pos =  VismoTransformations.undoTransformation(x,y,this.transformation);
          x = pos.x;
          y = pos.y;
          //console.log(x,y);
          shape = this.getShapeAtPosition(x,y);
      }
      else{
          //shape = false;
      }
      return shape;
    } else{
      return false;
    }
  },
  getShapeAtPosition: function(args) {
      /* x and y should be in VismoShape coordinate world*/
      var x= arguments[0];
      var y=  arguments[1];
    var shapes = this.memory;

    var hitShapes = [];
    for(var i=0; i < shapes.length; i++){
      var shape = shapes[i];
      if(!shape.getProperty("unclickable"))
                  {    
                          var st = shape.getShape();
        var g = shape.getBoundingBox();
      
        if(x >= g.x1 && x <= g.x2 && y >=  g.y1 && y <=g.y2){
          hitShapes.push(shapes[i]);
        }
      }

    }
    
    if(hitShapes.length > 0){
        
            var res = this._findNeedleInHaystack(x,y,hitShapes);
      return res;
    
    }
          else return false;
  
    // var shapesInsideBox = _findShapesInsideBoundingBox(shapes, ..) TODO RENAME
    // var points = _findPointsInsideShapes(..)
    

  },
  _findNeedleInHaystack: function(args){
    var x= arguments[0];
      var y=  arguments[1];
      var shapes = arguments[2];
      var hits = [];
    
    for(var i=0; i < shapes.length; i++){
      var st = shapes[i].getShape();
      var itsahit = false;
      if(st == 'polygon'){
        itsahit = this._inPoly(x,y,shapes[i]);
      }
      else if(st == 'path'){
          //itsahit = this._onPath(x,y,shapes[i]);
          itsahit = false; 
      }
      else if(st == 'image'){
        itsahit = true;
      }
      else if(st == 'point' || st == 'circle'){
        itsahit = this._inCircle(x,y,shapes[i]);
      }
      if(itsahit) {
        hits.push(shapes[i]);
      }
      
    }

    if(hits.length == 0){
      return false;
    }
    else if(hits.length == 1) 
      return hits[0];
    else {//the click is in a polygon which is inside another polygon
        var bestZindex = {s:[],z:0};
        for(var i=0; i < hits.length; i++){
            var zin = hits[i].getProperty("z-index"); 
            if(zin > bestZindex.z){
                bestZindex.s = [hits[i]];
                bestZindex.z = zin;
            }  
            else if(zin == bestZindex.z){
                bestZindex.s.push(hits[i]);
            }
          }
          if(bestZindex.s.length == 1) return bestZindex.s[0];
        
      var g = bestZindex.s[0].getBoundingBox();
      var mindist = Math.min(g.x2 - x,x - g.x1,g.y2 - y,y - g.y1);
      var closerEdge = {id:0, closeness:mindist};
      for(var i=1; i < bestZindex.s.length; i++){
        var g = bestZindex.s[i].getBoundingBox();
        var mindist = Math.min(g.x2 - x,x - g.x1,g.y2 - y,y - g.y1);
      
        if(closerEdge.closeness > mindist) {
          closerEdge.id = i; closerEdge.closeness = mindist;
        }
        
      }
      return bestZindex.s[closerEdge.id];
    
    }

  }
  ,_inCircle: function(args){
      var x= arguments[0];
      var y=  arguments[1];
      var vismoShape = arguments[2];
      var bb = vismoShape.getBoundingBox();
        var transform = vismoShape.getTransformation();

    if(transform){
            var newpos = VismoTransformations.applyTransformation(x,y,transform);
            x= newpos.x;
            y = newpos.y;
      }
      
    var a =((x - bb.center.x)*(x - bb.center.x)) + ((y - bb.center.y)*(y - bb.center.y));
    var dim = vismoShape.getDimensions();
    
    var w = dim.width /2;
    var h = dim.height/2;
    
    var inCircleOne;
    var inCircleTwo;
    
    if(transform && transform.scale) {
        w *= transform.scale.x;
        h *= transform.scale.y;
    }
    w *= w;
    h *=h;
    
    if (a <= w) inCircleOne= true;
    else inCircleOne = false;
    
    if (a <= h) inCircleTwo= true;    
    else inCircleTwo = false;
    

        //console.log(bb.center.x,bb.center.y,x,y,vismoShape.properties.id,a,w,h,inCircleOne,inCircleTwo);
        
    if(inCircleOne && inCircleTwo) return true;
    else return false;
  
  }
  ,_onPath: function(args){
      var x= arguments[0];
      var y=  arguments[1];
      var vismoShape = arguments[2];
      return false;
  }
  ,_inPoly: function(args) {
      var x= arguments[0];
      var y=  arguments[1];
      var vismoShape = arguments[2];
    /* _inPoly adapted from inpoly.c
    Copyright (c) 1995-1996 Galacticomm, Inc.  Freeware source code.
    http://www.visibone.com/inpoly/inpoly.c.txt */
    var coords;
    coords = vismoShape.getCoordinates();
    var transform = vismoShape.getTransformation();
    
    if(transform){
            var newpos = VismoTransformations.applyTransformation(x,y,transform);
            x = newpos.x;
            y = newpos.y;
    }
    
    var npoints = coords.length;
    if (npoints/2 < 3) {
      //points don't describe a polygon
      return false;
    }
    var inside = false;
    var xold = coords[npoints-2];
    var yold = coords[npoints-1];
    var x1,x2,y1,y2,xnew,ynew;
    for (var i=0; i<npoints; i+=2) {
      xnew=coords[i];
      ynew=coords[i+1];
      if (xnew > xold) {
        x1=xold;
        x2=xnew;
        y1=yold;
        y2=ynew;
      } else {
        x1=xnew;
        x2=xold;
        y1=ynew;
        y2=yold;
      }
      if ((xnew < x) == (x <= xold)
        && (y-y1)*(x2-x1) < (y2-y1)*(x-x1)) {
           inside=!inside;
        }
      xold=xnew;
      yold=ynew;
     }
     return inside;
  }

    ,isOverlap: function(shape1,shape2){
        return false;
    }


};var VismoClickingUtils = {
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
		
		if(e && e.srcElement){
			obj = e.srcElement;
		}
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
		        
		        if(node.vismoCanvas || node.vismoController || node.vismoClicking){
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

		if(offset.left === false) return false;
		
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

/*requires VismoShapes
Adds controls such as panning and zooming to a given dom element.

Mousewheel zooming currently not working as should - should center on location where mousewheel occurs
Will be changed to take a handler parameter rather then a targetjs
 */


var VismoController = function(elem,options){ //elem must have style.width and style.height etM  
    if(elem.length){ //for jquery
      var result = [];
      for(var i=0; i < elem.length; i++){
          var x = new VismoController(elem[i],options);
          result.push(x);
      }
      return x;
    }
    if(!options)options = {};
    if(!options.zoomfactor)options.zoomfactor=2;
    if(elem.vismoController) throw "this already has a vismo controller!"
    elem.vismoController = true;// this;              
    this.enabledControls = [];
    if(typeof elem == 'string') elem= document.getElementById(elem);
    this.setLimits({});
    //jQuery(elem).css()
    //if(!elem.style || !elem.style.position) elem.style.position = "relative";
    this.wrapper = elem; //a dom element to detect mouse actions
    this.handler = options.handler; //a js object to run actions on (with pan and zoom functions)	
    this.defaultCursor = "";
    var md = elem.onmousedown;
    var mu = elem.onmouseup;
    var mm = elem.onmousemove;
    for(var i=0; i < elem.childNodes.length; i++){
      var child = elem.childNodes[i];
      try{
        child.onmousedown = function(e){if(md)md(e);}
        child.onmouseup = function(e){if(mu)mu(e);}
        child.onmousemove = function(e){if(mm)mm(e);}
      }
      catch(e){

      }
    }
      
  controlDiv = document.createElement('div');
  controlDiv.style.position = "absolute";
  controlDiv.style.top = "0";
  controlDiv.style.left = "0";
  controlDiv.className = 'vismoControls';
  jQuery(controlDiv).css({'z-index':10000, height:"120px",width:"60px"});
  this.wrapper.appendChild(controlDiv);
  this.controlDiv = controlDiv;

  this.controlCanvas = new VismoCanvas(this.controlDiv);
  jQuery(this.controlDiv).mouseover(function(e){e.stopPropagation();e.preventDefault();});
  //this.controlDiv.vismoController = this;
  var vismoController = this;
  var preventDef = function(e){
    if(e.button == 2) return true;
                if (e && e.stopPropagation) //if stopPropagation method supported
                 e.stopPropagation()
                else
                 e.cancelBubble=true
          return false;      
  };
  var that = this;
  var f = function(e,s){
          var vismoController = that;
          vismoController._panzoomClickHandler(e,s,vismoController);
          return preventDef(e);
  };
  this.controlCanvas.mouse({up:preventDef,down:f,dblclick:preventDef});

  //this.wrapper.vismoController = this;
  var start_transformation = options.transformation;
  if(start_transformation){
    if(!start_transformation.origin) start_transformation.origin = {};
    this.transformation = start_transformation;
  }
  else{
    this.transformation = {'translate':{x:0,y:0}, 'scale': {x:1, y:1},'rotate': {x:0,y:0,z:0},origin:{}};	
  }	
             
             

  this.transformation.origin.x = jQuery(elem).width() / 2;
  this.transformation.origin.y = jQuery(elem).height() / 2;
  var t = this.transformation;

  //looks for specifically named function in targetjs
  if(!this.handler) {
      alert("no transform handler function defined");
  }
  //this.wrapper.vismoController = this;
  this.enabled = true;


  if(!options) options = {};
  if(!options.controls)options.controls =['pan','zoom','mousepanning','mousewheelzooming'];
  this.options = options;
  if(!this.options.controlStroke){
        this.options.controlStroke = "#000000";
    }
    if(!this.options.controlFill){
        this.options.controlFill = "rgba(150,150,150,0.7)";
    }
  
  
  this.addControls(this.options.controls);
  this.limits = {scale:{}};
  if(this.options.maxZoom) {
      this.limits.scale.x =this.options.maxZoom;
      this.limits.scale.y = this.options.maxZoom;
  }
  if(this.options.minZoom){
    
      this.limits.scale.minx =this.options.minZoom;
       this.limits.scale.miny =this.options.minZoom;
  }

  this.pansensitivity =100;
  if(this.options.pansensitivity){
      this.pansensitivity =this.options.pansensitivity;
  }

  jQuery(window).unload(function(){
    that.controlCanvas = null;
    that.controlDiv = null;
  })
};
VismoController.prototype = {
	setLimits: function(transformation){
	        this.limits = transformation;
	}
	,getHandler: function(){
	    return this.handler;
	}
	,setHandler: function(handler){
	    this.handler = handler;
	    handler(this.transformation);
	}
	,getEnabledControls: function(){
	        return this.enabledControls;
	}
	,_addEnabledControl: function(controlName){
	        this.enabledControls.push(controlName);      
	}
	,applyLayer: function(){
	        var that = this;
	        var hidebuttons = function(){
	               var shapes = that.controlCanvas.getMemory();
	                for(var i=0; i < shapes.length; i++){
	                        shapes[i].setProperty("hidden",true);
	                }

	                that.controlCanvas.render();
	        };	        
	        this.controlCanvas.render();
	        if(this.options.hidebuttons){
	                hidebuttons();
	                return;
	        }
	        
	       	       
	        if(VismoUtils.browser.isIE6) return;
	        var enabled = this.getEnabledControls();
	        var pan,zoom;
	        if(enabled.contains("pan")) pan = true;
	        if(enabled.contains("zoom")) zoom = true;
                var callback = function(response){
                        if(!response)return;
                        if(!VismoUtils.svgSupport())return;
                        
                        var shape;
                        if(false == true){
                                //return;
                                shape = document.createElement("div");
                                shape.innerHTML = response;
                        }
                        else{
                                shape = document.createElement('object');
                                
                                shape.setAttribute('codebase', 'http://www.adobe.com/svg/viewer/install/');
                                if(VismoUtils.browser.isIE)shape.setAttribute('classid', '15');
                                shape.setAttribute('style',"overflow:hidden;position:absolute;z-index:0;width:60px;height:120px;");
                                shape.setAttribute('type',"image/svg+xml");
                                var dataString = 'data:image/svg+xml,'+ response;
                                shape.setAttribute('data', dataString); // the "<svg>...</svg>" returned from Ajax call                                      
                                jQuery(shape).css({width:60,height:120})
                        }
                        that.controlDiv.appendChild(shape);
                        jQuery(that.controlDiv).css({"background-image":"none"});
                        hidebuttons();
                };
	        if(pan && zoom) callback(this.panzoomcontrolsSVG);

        	
	}
	,getTransformation: function(){ 
		return this.transformation;
	}
	,translate: function(x,y){
	        var t= this.getTransformation();
	        t.translate.x = x;
	        t.translate.y = y;
	        this.transform();
	},
	addMouseWheelZooming: function(){ /*not supported for internet explorer*/
                var that = this;
	        this._addEnabledControl("mousewheelzooming");
	
		this.crosshair = {lastdelta:false};
		this.crosshair.pos = {x:0,y:0};

		var t = this.getTransformation();

		var mw = this.wrapper.onmousewheel;
		

		var that = this;
		var mm = this.wrapper.onmousemove;
		

        var doingmw = false;
        var mwactive = false;
        
        var cancelMouseZoomCursor = function(){
            if(VismoUtils.browser.isIE6)that.wrapper.style.cursor = "";
            else jQuery(that.wrapper).removeClass("zooming");
        }
        jQuery(this.wrapper).mousedown(function(e){
            mwactive = true;
            if(VismoUtils.browser.isIE6)this.style.cursor = "crosshair";
            else {
                if(!jQuery(that.wrapper).hasClass("panning")){
                jQuery(that.wrapper).addClass("zooming");
                }
            }
            window.setTimeout(cancelMouseZoomCursor,2000);
        });
        jQuery(this.wrapper).mouseout(function(e){
            var newTarget;
            
            if(e.toElement) newTarget = e.toElement;
            else newTarget = e.relatedTarget;
            
            if(jQuery(newTarget,that.wrapper).length == 0){ //if not a child turn off
                mwactive = false;

            }
            cancelMouseZoomCursor();
        });
        var domw = function(e){
            if(!that.enabled) return;
			/* thanks to http://adomas.org/javascript-mouse-wheel */
			var delta = 0;

                        
			if(!that.goodToTransform(e)) {
			    doingmw = false;
			    return false;
			}
			var t = VismoClickingUtils.resolveTargetWithVismo(e);
		        
                
                       if(t != that.wrapper && t.parentNode !=that.wrapper) return false;
	       	 	if (e.wheelDelta) { /* IE/Opera. */
		                delta = e.wheelDelta/120;
		                /** In Opera 9, delta differs in sign as compared to IE.
		                 */
		                if (window.opera)
		                        delta = -delta;
		        } else if (e.detail) { /** Mozilla case. */
		                /** In Mozilla, sign of delta is different than in IE.
		                 * Also, delta is multiple of 3.
		                 */
		                delta = -e.detail/3;
		        }
	
			var sensitivity = 0.4;
			var transform = that.getTransformation();
			var scale =transform.scale;
			var origin = transform.origin;


			var mousepos = VismoClickingUtils.getMouseFromEvent(e);
	
			var w = parseInt(that.wrapper.style.width) / 2;
			var h = parseInt(that.wrapper.style.height) / 2;
			var translation =  VismoTransformations.undoTransformation(mousepos.x,mousepos.y,that.transformation);
			transform.translate= {x: -translation.x, y: -translation.y};
			//{x: -mousepos.x + w,y: -mousepos.y + h};
			transform.origin = {
											x: mousepos.x,
											y: mousepos.y
										};
			



			if(delta > that.crosshair.lastdelta + sensitivity || delta < that.crosshair.lastdelta - sensitivity){	
				var newx,newy;
				if(delta > 0){
					newx = parseFloat(scale.x) * 2;
					newy = parseFloat(scale.y) * 2;					
				}
				else{
					newx = parseFloat(scale.x) / 2;
					newy = parseFloat(scale.y) / 2;
				}

				if(newx > 0 && newy > 0){
					scale.x = newx;
					scale.y = newy;
					that.setTransformation(transform);					
				}

			}
			that.crosshair.lastdelta = delta;	
			

            doingmw = false;
            return false;
        };
		var onmousewheel = function(e){	
		    if(!VismoUtils.browser.isIE){
		        jQuery(that.wrapper).addClass("zooming");	
		    }
		    if(e.preventDefault){e.preventDefault();}
		    if (e && e.stopPropagation) {
                e.stopPropagation();
            }
             e.cancelBubble=true;
            
		    if(!mwactive) return false;
			if(!doingmw) {
			    var f = function(){
			        domw(e);
                    return false;
			    };
			    window.setTimeout(f,50);
			    doingmw = true;
            }


			return false;

		};

		
		var element = this.wrapper;
            if(VismoUtils.browser.isIE) {
		        document.onmousewheel = function(e){
		                if(!e)e = window.event;
		            
		                var el = e.target;
		                
		                //var el =  e.srcElement;
		                if(!el) return;
		                while(el != element){
		                        
		                        if(el == element) {
		                                onmousewheel(e); 
		                                
		                                return false;    
		                        }
		                        el = el.parentNode;
		                }
		                return;
		        };
		        window.onmousewheel = document.onmousewheel;
		        return;
		}
		else if (element.addEventListener){

			element.onmousewheel = onmousewheel; //safari
		    element.addEventListener('DOMMouseScroll', onmousewheel, false);/** DOMMouseScroll is for mozilla. */
		
		}
		else if(element.attachEvent){ 	
			element.attachEvent("onmousewheel", onmousewheel); //safari
		}
		else{ //it's ie.. or something non-standardised. do nowt
		//window.onmousewheel = document.onmousewheel = onmousewheel;	
		}

		
	}
	,disable: function(){
	    //console.log("disabled");
        jQuery(".vismoControls",this.wrapper).css({display:"none"});	    
		this.enabled = false;
	}
	,enable: function(){
	    //console.log("enabled");
		this.enabled = true;
		jQuery(".vismoControls",this.wrapper).css({display:""});
	}
	
	,goodToTransform: function(e){
		var t =  VismoClickingUtils.resolveTarget(e);

		switch(t.tagName){
			case "INPUT":
				return false;
			case "SELECT":
				return false;
			case "OPTION":
				return false;
		}
		
		if(t && t.getAttribute("class") == "vismoControl") return false;
		
		return true;
		
	}
	,addMousePanning: function(){
	       
	    this._addEnabledControl("mousepanning");
		var that = this;
		
		var el = that.wrapper;
		var md = el.onmousedown;
		var mu = el.onmouseup;	
		var mm = el.onmousemove;
		var panning_status = false;	
		//alert('here');
		//jQuery(document).mouseup(function(e){alert("cool");}); //doesn't work?!
		var intervalMS = 100;
		if(VismoUtils.browser.isIE6){
		  intervalMS = 300;
		}
		var interval;
		var cancelPanning = function(e){
		    if(interval)window.clearInterval(interval);
			panning_status = false;
			that.transform();
			if(!VismoUtils.browser.isIE6){jQuery(that.wrapper).removeClass("panning");}
			//style.cursor= that.defaultCursor;
			that.wrapper.onmousemove = mm;
			return false;
		};
		jQuery(that.controlDiv).mousedown(function(e){
        
		    cancelPanning();
		});
		var onmousemove = function(e){
		    if(e && e.shiftKey) {return false;}
			if(mm){mm(e);}
			if(!that.enabled) {return;}
			if(!panning_status) {
				return;
			}
			if(!VismoUtils.browser.isIE && !jQuery(that.wrapper).hasClass("panning")){
			    jQuery(that.wrapper).addClass("panning")
			}
			if(!that.goodToTransform(e)) {return;}
			var pos =  VismoClickingUtils.getMouseFromEventRelativeToElement(e,panning_status.clickpos.x,panning_status.clickpos.y,panning_status.elem);		
			if(!pos){return;}
			
			var t = that.getTransformation();
			//if(this.transformation) t = this.transformation;
			var sc = t.scale;

			/* work out deltas */
			var xd =parseFloat(pos.x /sc.x);
			var yd = parseFloat(pos.y / sc.y);
			t.translate.x = panning_status.translate.x + xd;
			t.translate.y =panning_status.translate.y +yd;
            if(!VismoUtils.browser.isIE6){
                jQuery(that.wrapper).removeClass("zooming");
                //that.transform();
            }
			
			if(pos.x > 5  || pos.y > 5) panning_status.isClick = false;
			if(pos.x < 5|| pos.y < 5) panning_status.isClick = false;
			return false;	
		};
     
		jQuery(this.wrapper).mousedown(function(e){
		    if(e.button != 2)e.preventDefault();
		    
		    var jqw = jQuery(that.wrapper);
			if(panning_status){
				return;
			}
			
			if(md) {md(e);}
			if(!that.enabled) return;
			interval =window.setInterval(function(){that.transform();},intervalMS);
			if(!VismoUtils.browser.isIE6){
			    jqw.addClass("panning");
			}
			var target =  VismoClickingUtils.resolveTarget(e);
			target = el;
			if(!target) return;

			
			var t = that.transformation.translate;
			var sc =that.transformation.scale; 
			
			var realpos = VismoClickingUtils.getMouseFromEvent(e);
			if(!realpos) return;
			//this.vismoController = that;

			var element = VismoClickingUtils.resolveTargetWithVismo(e);
			element = el;
			panning_status =  {clickpos: realpos, translate:{x: t.x,y:t.y},elem: element,isClick:true};
			that.wrapper.onmousemove = onmousemove;
				
		});
			
		jQuery(document).mouseup(function(e){
		    e.preventDefault();
			if(panning_status.isClick && mu){
			    mu(e);
			};
			
			if(panning_status){
			    cancelPanning(e);
            }
		});
		
		jQuery(document).mousemove(function(e){
			if(panning_status){
			        onmousemove(e);
			        var parent= e.target;
			        while(parent.parentNode){
			                parent = parent.parentNode;
			                if(parent == that.wrapper) return;
			        }
				
				//if(parent != that.wrapper)cancelPanning(e); (not a good idea for tooltips)
			}
		});
	    
	},

	setTransformation: function(t){
        if(this.limits){
            if(this.limits.scale){
            if(t.scale.x > this.limits.scale.x){ t.scale.x = this.limits.scale.x;}
            if(t.scale.y > this.limits.scale.y){ t.scale.y = this.limits.scale.y; }
            
            if(t.scale.x < this.limits.scale.minx){ t.scale.x = this.limits.scale.minx;}
            if(t.scale.y < this.limits.scale.miny){ t.scale.y = this.limits.scale.miny;}     
            }    
        }
        if(!t.origin){
            
                var w = jQuery(this.wrapper).width();
                var h = jQuery(this.wrapper).height();
                t.origin = {x: w/2, y: h/2};

        }
		if(this.enabled){
			if(!t.scale && !t.translate && !t.rotate) alert("bad transformation applied - any call to setTransformation must contain translate,scale and rotate");
			this.transformation = t;
			try{this.handler(t);}catch(e){};
		}
		//console.log("transformation set to ",t);
	},
	createButtonLabel: function(r,type,offset){
		var properties=  {'shape':'path', stroke: this.options.controlStroke,lineWidth: '1','z-index':'2'};
		properties.actiontype = type;
		var coords=[];
		if(type == 'E'){
			coords =[r,0,-r,0,'M',r,0,0,-r,"M",r,0,0,r];
		}
		else if(type =='W'){
			coords =[-r,0,r,0,'M',-r,0,0,r,"M",-r,0,0,-r]; 
		}
		else if(type == 'S'){
			coords =[0,-r,0,r,'M',0,r,-r,0,"M",0,r,r,0];	
		}
		else if(type == 'N'){
			coords =[0,-r,0,r,'M',0,-r,r,0,"M",0,-r,-r,0];	
		}
		else if(type == 'in'){
			coords =[-r,0,r,0,"M",0,-r,0,r];
		}
		else if(type == 'out'){
			coords = [-r,0,r,0];
		}
		for(var i=0; i < coords.length; i+=2 ){
		        if(coords[i] == "M") i+=1;
		        coords[i] += offset.x;
		        coords[i+1] += offset.y;
		}
		return new VismoShape(properties,coords);
	},	
	createButton: function(width,direction,offset,properties) {
	        var canvas = this.controlCanvas;
	        if(!canvas) throw "no canvas to create on..";
		if(!width) width = 120;
		var r = width/2;

		offset = {
			x: offset.x || 0,
			y: offset.y || 0
		};
		
		var coords;
		if(this.options.controlShape && this.options.controlShape == 'circle'){
		    	coords = [
        			offset.x , offset.y,
        			width/2
        		];
        		properties.shape = 'circle';  
		}
		else{
		    
    		coords = [
    			offset.x, offset.y,
    			offset.x + width, offset.y,
    			offset.x + width, offset.y + width,
    			offset.x, offset.y + width
    		];
    		properties.shape = 'polygon';
	    }
		properties.fill =this.options.controlFill;
		properties.stroke =this.options.controlStroke;
		var button = new VismoShape(properties,coords);
		var bb = button.getBoundingBox();
		buttoncenter = {x:bb.center.x,y:bb.center.y}; 
		var label = this.createButtonLabel(r-2,properties.actiontype,buttoncenter);
	    canvas.add(label);
		canvas.add(button);
		return button;
	},
	addControls: function(list){
		for(var i= 0; i < list.length; i++){
			this.addControl(list[i]);
		}
	}
	,addControl: function(controlType) {
		switch(controlType) {
			//case "zoom":
			case "pan":
				this.addPanningActions();
				break;
			case "zoom":
				this.addZoomingActions();
				break;
			case "mousepanning":
				this.addMousePanning();
				break;
			case "mousewheelzooming":
				this.addMouseWheelZooming();
				break;
			case "rotation":
		
				this.addRotatingActions();
				break;
			default:
				break;
		}
	
	},
	
	addPanningActions: function(controlDiv){
	        this._addEnabledControl("pan");
		this.createButton(12,180,{x:-6,y:-54},{'actiontype':'N','name':'pan north','buttonType': 'narrow'});
		this.createButton(12,270,{x:10,y:-38},{'actiontype':'E','name':'pan east','buttonType': 'earrow'});
		//this.createButton(10,90,{x:16,y:16},{'actiontype':'O','name':'re-center','buttonType': ''});
		this.createButton(12,90,{x:-22,y:-38},{'actiontype':'W','name':'pan west','buttonType': 'warrow'});
		this.createButton(12,0,{x:-6,y:-20},{'actiontype':'S','name':'pan south','buttonType': 'sarrow'});			
		this.applyLayer();		

	},
	addRotatingActions: function(){
		/*
		var rotateCanvas = this.controlCanvas.getDomElement();
		this.createButton(rotateCanvas,10,180,{x:16,y:2},{'actiontype':'rotatezup','name':'pan north','buttonType': 'narrow'});
		this.createButton(rotateCanvas,10,0,{x:16,y:30},{'actiontype':'rotatezdown','name':'pan south','buttonType': 'sarrow'});			
			
		this.createButton(rotateCanvas,10,270,{x:30,y:16},{'actiontype':'rotatezright','name':'rotate to right','buttonType': 'earrow'});
		this.createButton(rotateCanvas,10,90,{x:2,y:16},{'actiontype':'rotatezleft','name':'rotate to left','buttonType': 'warrow'});
		rotateCanvas.onmouseup = this._panzoomClickHandler;*/

	},	
	addZoomingActions: function(){
	        this._addEnabledControl("zoom");
		this.createButton(12,180,{x:-6,y:12},{'actiontype':'in','name':'zoom in','buttonType': 'plus'});		
		this.createButton(12,180,{x:-6,y:42},{'actiontype':'out','name':'zoom out','buttonType': 'minus'});	
	        this.applyLayer();
	}	
	,zoom: function(x,y){
         var t = this.getTransformation();
         t.scale.x = x;
         if(!y) y=  x;
         t.scale.y = y;
         this.setTransformation(t);
    }
    ,panTo: function(x,y){
            //if(!this.enabled) return;
            var t = this.getTransformation();
            
            var finalX = -x;
            var finalY = -y;
            var thisx,thisy;
            var direction = {};
            var difference = {};
            
            thisx = t.translate.x;
            thisy = t.translate.y;
            
            difference.x=  thisx - finalX;
            difference.y = thisy - finalY;
            
            direction.x = -difference.x / 5;
            direction.y = -difference.y / 5;

            var change = true;
            
            var that = this;
            var f = function(){
               
                    change= {x: false,y:false};
                    if(thisx > finalX && thisx + direction.x > finalX) {thisx += direction.x;change.x=true;}
                    else if(thisx < finalX && thisx + direction.x < finalX) {thisx += direction.x;change.x=true;}
                    else{
                            t.translate.x = finalX;
                    }
            
                    if(thisy > finalY && thisy + direction.y > finalY) {thisy += direction.y;change.y=true;}
                    else if(thisy < finalY && thisy + direction.y < finalY) {thisy += direction.y;change.y=true;}
                    else{
                            change.x = true;
                            t.translate.y =finalY;
                    }
            
                    if(change.x){
                            t.translate.x = thisx;
                    }
                    else{
                            t.translate.x = finalX;
                    }
                    if(change.y){
                            t.translate.y = thisy;
                    }
                    else{
                            t.translate.y = finalY;
                    }

                    if(t.translate.x != finalX && t.translate.y != finalY){
                            that.setTransformation(t); 
                            window.setTimeout(f,5);
                    }
                    else{
                            that.setTransformation(t);
                    }

            };
            
            f();
                                   
           

            //window.setTimeout(pan,200);
    }
  ,transform: function(){
    if(this.enabled){
      var t = this.getTransformation();
      var s = t.scale;
      var tr = t.translate;
      if(s.x <= 0) s.x = 0.1125;
      if(s.y <= 0) s.y = 0.1125;
      var ok = true;
      var lim = this.limits;
      if(lim.scale){
        if(s.y < lim.scale.miny) t.scale.y = lim.scale.miny;
        if(s.x < lim.scale.minx) t.scale.x = lim.scale.minx;

        if(s.y > lim.scale.y) t.scale.y = lim.scale.y;
        if(s.x > lim.scale.x) t.scale.x = lim.scale.x;
      }
      this.handler(this.transformation);

    }
	},
	_panzoomClickHandler: function(e,hit,controller) {
	  if(!hit) return;
	   
		var pan = {};
		var t =controller.getTransformation();
		if(!t.scale) t.scale = {x:1,y:1};
		if(!t.translate) t.translate = {x:0,y:0};
		if(!t.rotate) t.rotate = {x:0,y:0,z:0};
		
		var scale =t.scale;
		
		pan.x = parseFloat(this.pansensitivity / scale.x);
		pan.y = parseFloat(this.pansensitivity / scale.y);
	
		switch(hit.getProperty("actiontype")) {
			case "W":
				t.translate.x += pan.x;
				break;
			case "O":
				t.translate.x = 0;
				t.translate.y = 0;
				break;

			case "E":
				t.translate.x -= pan.x;
				break;
			case "N":
				t.translate.y += pan.y;
				break;
			case "S":
				t.translate.y -= pan.y;
				break;
			case "in":
				scale.x *= this.options.zoomfactor;
				scale.y *= this.options.zoomfactor;
				break;
			case "out":
				scale.x /= this.options.zoomfactor;
				scale.y /= this.options.zoomfactor;			
				break;
			case "rotatezright":
				if(!t.rotate.z) t.rotate.z = 0;
				//console.log("right",t.rotate.z);
				t.rotate.z -= 0.1;
				var left =6.28318531;
				
				if(t.rotate.z <0 )t.rotate.z =left;
				break;
			case "rotatezup":
				if(!t.rotate.y) t.rotate.y = 0;
				t.rotate.y += 0.1;
				break;
			case "rotatezdown":
				if(!t.rotate.y) t.rotate.y = 0;
				t.rotate.y -= 0.1;
				break;
			case "rotatezleft":
				if(!t.rotate.z) t.rotate.z = 0;
				t.rotate.z += 0.1;
				break;
			default:
				break;
		}
		controller.transform();
		return false;
	}
};var VismoClickingUtils = {
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
		
		if(e && e.srcElement){
			obj = e.srcElement;
		}
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
		        
		        if(node.vismoCanvas || node.vismoController || node.vismoClicking){
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

		if(offset.left === false) return false;
		
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

/*some conversion functions that convert to geojson */
var VismoConversion ={
	niaveGeoJsonFlatten: function(geojson,niaveness){
		
		var newdata = geojson;
		var coordsDropped = 0;
		for(var i=0; i < newdata.features.length; i++){
			var g = newdata.features[i].geometry;
		
			if(g.type == 'MultiPolygon'){
				for(var ij =0; ij < g.coordinates.length; ij++){
					for(var j=0; j < g.coordinates[ij].length; j++){
		
						var bettercoords = [];
						var every = 0;
						if(g.coordinates[ij][j].length > 50){
							for(var k=0; k < g.coordinates[ij][j].length; k++){

								var c = g.coordinates[ij][j][k];
							
								if(every == 0){
									var x = parseFloat(c[0]);
									var y = parseFloat(c[1]);
									bettercoords.push([x,y]);
									every= niaveness;
								}
								else{
									every -= 1;
								}	
			
							}
							coordsDropped += (g.coordinates[ij][j].length - bettercoords.length);
							g.coordinates[ij][j] = bettercoords;
						}
					}
				}
			}
		}
		//console.log(coordsDropped,"dropped");
		return newdata;
	}
	,svgToGeoJson: function(svg,canvas){
		var svgxml = VismoFileUtils._getXML(svg);
		var res = VismoMapSVGUtils.convertSVGToMultiPolygonFeatureCollection(svgxml);
		
		
		//res = VismoMapUtils.fitgeojsontocanvas(res,canvas);
		//console.log(res.boundingBox);
		//res
		//work out here where origin should be (half of the maximum width of the svg coordinate space should be 0)
		return res;
	},
	_kmlPolygonToFeature: function(xmlNode,feature){
		var geocoordinates = [];
		var polyChildren =xmlNode.childNodes;
		
		for(var k=0; k < polyChildren.length; k++){
			var fail = true;
			if(polyChildren[k].tagName =='outerBoundaryIs'){
				
				var outerChildren =polyChildren[k].childNodes;
				for(var l=0; l < outerChildren.length; l++){
					if(outerChildren[l].tagName == 'LinearRing'){
						
						var ringChildren =outerChildren[l].childNodes;
						for(var m=0; m < ringChildren.length; m++){
							if(ringChildren[m].tagName == 'coordinates'){
							
								
								var geometry = VismoFileUtils.getChildNodeValue(ringChildren[m]);
								geometry = geometry.trim();
						
								
								var coords = geometry.split(" "); //\n?
								for(var n=0; n < coords.length; n+= 1){
									var values = coords[n].split(",");
									var longitude= parseFloat(values[0]);
									var latitude = parseFloat(values[1]);
									var altitude = parseFloat(values[2]);
									geocoordinates.push([longitude,latitude]);
								
								}
								if(coords.length ==0){
									return false;
								}
								else{
									fail = false;
								}
								feature.geometry.coordinates.push([geocoordinates]);			
								
							}	
						}
					}
				}

                                                
			}
		}
		if(!feature){
			fail  = true;
		}
		else if(feature.geometry.coordinates[0].length == 0){
			fail = true;
		}
		else if(feature.geometry.coordinates[0][0].length == 1){
			fail = true;
		}
	
		if(fail) {
			return false;
		}
		else{
				
			return feature;
		}
	}
	,kmlToGeoJson: function(kml){
		var geojson = {type:"FeatureCollection", features:[]};
		
		var xml =VismoFileUtils._getXML(kml);
		var items = xml.getElementsByTagName("Placemark");
		
		for(var i=0; i < items.length; i++){
	
			var feature = {type:'Feature', geometry:{type:'MultiPolygon', coordinates:[]},properties:{'name':'georss'}};
						
			
			var att = items[i].childNodes;
			
			for(var j=0; j < att.length; j++){
				var fail = false;
				
				if(att[j].tagName == 'name' && att[j].firstChild){
					feature.properties.name =att[j].firstChild.nodeValue;
				}
				
				if(att[j].tagName == 'Polygon'){
					
					var succeeded = this._kmlPolygonToFeature(att[j],feature);

					if(succeeded){
						feature = succeeded;
					}
					else{
						fail = true;
					}
				}
				if(att[j].tagName == 'MultiGeometry'){
					
					var children = att[j].childNodes;
					for(var k=0; k < children.length; k++){
						if(children[k].tagName == 'Polygon'){

							var succeeded = this._kmlPolygonToFeature(children[k],feature);
						
							if(succeeded){
								feature = succeeded;
							}
							else{
								fail = true;
							}
						}	
					}
				}
				
			}
			//console.log("ere",fail);
			//if(!fail)
	//console.log(feature.geometry.coordinates.length);
			if(!fail && feature && feature.geometry.coordinates.length > 0) {
					geojson.features.push(feature);
			}
		}
	
		return geojson;
	}
	
	,geoRssToGeoJson : function (georss){
	
		var geojson = {type:"FeatureCollection", features:[]};
		var xml =VismoFileUtils._getXML(georss);
		var items = xml.getElementsByTagName("item");
		
		for(var i=0; i < items.length; i++){
			
			var feature = {type:'Feature', geometry:{type:'MultiPolygon', coordinates:[]},properties:{'name':'georss'}};
						
			var fail = false;
			var att = items[i].childNodes;
			for(var j=0; j < att.length; j++){

				
				if(att[j].tagName == 'title' && att[j].firstChild){
					feature.properties.name =att[j].firstChild.nodeValue;
				}
				if(att[j].tagName == 'description' && att[j].firstChild){
					feature.properties.description =att[j].firstChild.nodeValue;
				}
				
				if(att[j].tagName == 'georss:polygon'){
					var geocoordinates = [];
					//console.log(att[j].innerHTML,att[j].firstChild,"inner");

					var geometry = VismoFileUtils.getChildNodeValue(att[j]);
					geometry = geometry.trim();
					geometry = geometry.replace(/  +/g, " ");
					geometry = geometry.replace(/\n/g, "");
					var values = geometry.split(" ");
				
					if(values[0] != values[values.length-2] |values[1] != values[values.length-1]){
						values.push(values[0]);
						values.push(values[1]);
					}
					for(var k=0; k < values.length - 1; k+= 2){
						var latitude = parseFloat(values[k]);
						var longitude= parseFloat(values[k+1]);
						geocoordinates.push([longitude,latitude]);
					}
					feature.geometry.coordinates.push([geocoordinates]);
				}
				
			}
			if(!fail){
				geojson.features.push(feature);
			}
			else{
				
				//console.log("Unable to construct feature " +feature.properties.name+". Invalid georss coordinates: first and last coordinates should be same. ");
			}
		}
		
		return geojson;
	}

};Array.prototype.contains = function(item)
{
	return this.indexOf(item) != -1;
};


function mozillaSaveFile(filePath,content)
{
	if(window.Components) {
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(filePath);
			if(!file.exists())
				file.create(0,0664);
			var out = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			out.init(file,0x20|0x02,00004,null);
			out.write(content,content.length);
			out.flush();
			out.close();
			return true;
		} catch(ex) {
			return false;
		}
	}
	return null;
}


var VismoFileUtils= {
	saveFile: function(fileUrl,content)
	{
		mozillaSaveFile(fileUrl,content); return;
		jQuery.file.save({fileUrl:fileUrl,content:content});
	}	
	,convertUriToUTF8:function(uri,charSet)
	{
		if(window.netscape == undefined || charSet == undefined || charSet == "")
			return uri;
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
		} catch(ex) {
			return uri;
		}
		return converter.convertURISpecToUTF8(uri,charSet);
	}
	
	,getLocalPath:function(origPath)
	{
		var originalPath = VismoFileUtils.convertUriToUTF8(origPath,"UTF-8");
		
		// Remove any location or query part of the URL
		var argPos = originalPath.indexOf("?");
		if(argPos != -1)
			originalPath = originalPath.substr(0,argPos);
		var hashPos = originalPath.indexOf("#");
		if(hashPos != -1)
			originalPath = originalPath.substr(0,hashPos);
		// Convert file://localhost/ to file:///
		if(originalPath.indexOf("file://localhost/") == 0)
			originalPath = "file://" + originalPath.substr(16);
		// Convert to a native file format
		var localPath;

		if(originalPath.charAt(9) == ":") // pc local file
			localPath = unescape(originalPath.substr(8)).replace(new RegExp("/","g"),"\\");
		else if(originalPath.indexOf("file://///") == 0) // FireFox pc network file
			localPath = "\\\\" + unescape(originalPath.substr(10)).replace(new RegExp("/","g"),"\\");
		else if(originalPath.indexOf("file:///") == 0) // mac/unix local file
			localPath = unescape(originalPath.substr(7));
		else if(originalPath.indexOf("file:/") == 0) // mac/unix local file
			localPath = unescape(originalPath.substr(5));
		else if(originalPath.indexOf("http") == 0){ //jon hack for online

			var end =originalPath.lastIndexOf("/");
			localPath = unescape(originalPath.substr(0,end+1));
		}
		else // pc network file
			localPath = "\\\\" + unescape(originalPath.substr(7)).replace(new RegExp("/","g"),"\\");
		return localPath;
	}

	,loadRemoteFile: function(url,callback,params,headers,data,contentType,username,password,allowCache)
	{
		//callback parameters: status,params,responseText,url,xhr
		return this._httpReq("GET",url,callback,params,headers,data,contentType,username,password,allowCache);
	}
	/*currently doesnt work with jpg files - ok formats:gifs pngs*/
	,saveImageLocally: function(sourceurl,dest,dothiswhensavedlocally,dothiswhenloadedfromweb) {
		
		var localPath = VismoFileUtils.getLocalPath(document.location.toString());
	
		var savePath;
		if((p = localPath.lastIndexOf("/")) != -1) {
			savePath = localPath.substr(0,p) + "/" + dest;
		} else {
			if((p = localPath.lastIndexOf("\\")) != -1) {
				savePath = localPath.substr(0,p) + "\\" + dest;
			} else {
				savePath = localPath + "/" + dest;
			}
		}
		
		var onloadfromweb = function(status,params,responseText,url,xhr){
			try{
				if(dothiswhenloadedfromweb){
					dothiswhenloadedfromweb(url);
				}
				////console.log("VismoFileUtil.saveFile doesnt work for iamges it might seem",savePath);
				VismoFileUtils.saveFile(savePath,responseText);
		
			}
			catch(e){
				//console.log("error saving locally.."+ e);
			}

		};
		
		var onloadlocally = function(responseText,url,xhr){		
		
				if(dothiswhensavedlocally){
					dothiswhensavedlocally(dest);
				}
			
		};
		

		try{
		    //console.log("do get",dest);
			var r = jQuery.get(dest,null,onloadlocally);
			//console.log("done get",r);
			if(r.status == 404 || r.status ==0) throw "404 error";
		
		}
		catch(e){//couldnt load probably doesn't exist!
			VismoFileUtils.loadRemoteFile(sourceurl,onloadfromweb,null,null,null,null,null,null,true);		
		}

		
		
	}
	,_httpReq: function (type,url,callback,params,headers,data,contentType,username,password,allowCache)
	{
		var x = null;
		try {
			x = new XMLHttpRequest(); //# Modern
		} catch(ex) {
			try {
				x = new ActiveXObject("Msxml2.XMLHTTP"); //# IE 6
			} catch(ex2) {
			}
		}
		if(!x)
			return "Can't create XMLHttpRequest object";
		x.onreadystatechange = function() {
			try {
				var status = x.status;
			} catch(ex) {
				status = false;
			}
			if(x.readyState == 4 && callback && (status !== undefined)) {
				if([0, 200, 201, 204, 207].contains(status))
					callback(true,params,x.responseText,url,x);
				else{
					callback(false,params,null,url,x);
			
				}
				x.onreadystatechange = function(){};
				x = null;
			}
		};
		try {
			if(window.Components && window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
			window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			
			if(!allowCache)
				url = url + (url.indexOf("?") < 0 ? "?" : "&") + "nocache=" + Math.random();
			else{
				url = url + (url.indexOf("?") < 0 ? "?" : "&");
			}
			x.open(type,url,true,username,password);
			if(data)
				x.setRequestHeader("Content-Type", contentType || "application/x-www-form-urlencoded");
			if(x.overrideMimeType)
				x.setRequestHeader("Connection", "close");
			if(headers) {
				for(var n in headers)
					x.setRequestHeader(n,headers[n]);
			}
		//	x.setRequestHeader("X-Requested-With", "TiddlyWiki " + formatVersion());
		x.overrideMimeType('text/plain; charset=x-user-defined');
			x.send(data);
		} catch(ex) {
			////console.log(ex);
			//throw ex;
		}
		return x;
	},
	

	_getXML:function(str) {
		if(!str)
			return null;
		var errorMsg;
		try {
			var doc = new ActiveXObject("Microsoft.XMLDOM");
			doc.async="false";
			doc.loadXML(str);
		}
		catch(e) {
			try {
				var parser=  new DOMParser();
				var doc = parser.parseFromString(str,"text/xml");
			}
			catch(e) {
				return e.message;
			}
		}

		return doc;	
	}

	,getChildNodeValue: function(ofThisNode){
		var value= "";
		if(ofThisNode.childNodes){
			
			for(var k=0; k < ofThisNode.childNodes.length; k++){
			
				if(ofThisNode.childNodes[k].nodeValue){
					value += ofThisNode.childNodes[k].nodeValue;
				}
			}
		}
		return value;
	}
};/*
A package for rendering geojson polygon and point features easily to create maps
added startpos : [lat,lon]
*/
var GeoTag = function(longitude,latitude,properties){
	var geo = {};
	geo.type = "feature";
	geo.geometry = {};
	geo.geometry.type = "point";
	geo.geometry.coordinates = [longitude,latitude];
	geo.properties = properties;
	return geo;	
};
var GeoPath = function(coords,properties){
    var geo = {geometry:{type:"LineString"},type:"feature",properties:properties};
    if(coords && coords[0].length > 1){
        geo.geometry.coordinates = coords;
    }
    else{
        var newcoords = [];
        for(var i=0; i < coords.length; i+=2){
            newcoords.push([coords[i],coords[i+1]]);
        }
        //console.log("built",newcoords,"from",coords);
        geo.geometry.coordinates = newcoords;
    }
    return geo;
}

var VismoMap = function(wrapper,options){  
    
    if(wrapper.length){ //for jquery
        var result = [];
        for(var i=0; i < wrapper.length; i++){
            var x = new VismoMap(wrapper[i],options);
            result.push(x);
        }
        return x;
    }
    
	if(typeof wrapper == 'string') wrapper = document.getElementById(wrapper);
	else wrapper = wrapper;
		
	this.wrapper = wrapper;
	wrapper.vismoMap = this;
	//wrapper.style.position = "relative";
	var that = this;
	this.settings = {};
	var w= jQuery(wrapper).width();
	var h= jQuery(wrapper).height();
	jQuery(wrapper).css({width:w,height:h});
	
	this.feature_reference = {};
	if(!options) options = {};


	var that = this;
	var handler = function(t){
	    that.transform(t);
	}
	if(typeof(options.vismoController) == 'undefined' && options.vismoController !== false) options.vismoController = {};
	
	
	if(options.vismoController){
	  options.vismoController.handler = handler;
	  if(options.zoomfactor) options.vismoController.zoomfactor = options.zoomfactor;
	  if(options.vismoController.transformation) options.fullscreen = false; //can't have both..
	}
	if(options.startpos || options.zoom && !options.vismoController.transformation){

    var tx = options.startpos[0] || 0;
    var ty = options.startpos[1] || 0;
    var sx = options.zoom || 1;
    options.vismoController.transformation = {translate:{x:-tx,y:ty},scale:{x:sx,y:sx}};
	}
  
	this.vismoCanvas = new VismoCanvas(wrapper,options);

	this.controller = this.vismoCanvas.vismoController;
  if(this.controller)this.transform(this.controller.transformation); //set initial transformation	
	//run stuff

	this._fittocanvas = true;
	this.geofeatures = {};
	this.features = [];
	this.clear();
	
	var proj = options.projection;
	var eMap = this;
	this._hijackMouseFunctions();
	if(options.tooltip){
	    this.vismoCanvas.addTooltip(function(el,s){
	        if(s){
	        el.innerHTML = s.getProperty("name");
            }
	    });
	    
	}
		this.mouse({down:options.mousedown,up:options.mouseup,move:options.move,dblclick:options.dblclick,keypress:options.keypress});
	
	var eMap = this;
	if(proj){
		if(proj == 'globe' || proj == 'spinnyglobe'){
			eMap = new VismoGlobe(this);
			if(proj == 'spinnyglobe'){
				eMap.toggleSpin();
			}
		}
		if(proj == 'google'){
			eMap.settings.projection = VismoSlippyMap.prototype.getGoogleMercatorProjection();
		}
		else if(proj == 'slippystaticmap'){
			eMap = new VismoSlippyMap(this);					
		}
		
	}
	
	if(options.geojson){
	    this.drawFromGeojson(options.geojson,options.fullscreen);
	}
	else if(options.georss){
	    this.drawFromGeojson(VismoConversion.geoRssToGeoJson(options.georss),options.fullscreen);
	}
	else if(options.kml){
	    this.drawFromGeojson(VismoConversion.kmlToGeoJson(options.kml),options.fullscreen);
	}
	
  
	return eMap;
};  
VismoMap.prototype = {
	setTransparency: function(args){
	    var alpha = arguments[0];
		this.vismoCanvas.setTransparency(alpha);
	}
	,getVismoShapes: function(args){
		return this.vismoCanvas.getMemory();
	}
	,resize: function(args){
	    var width = arguments[0];
	    var height = arguments[1];
		this.wrapper.style.width = width+"px";
		this.wrapper.style.height = height +"px";
		var  t=this.getTransformation();
		t.origin.x = width / 2;
		t.origin.y = height / 2;
		this.setTransformation(t);
		this.vismoCanvas.resize(width,height);

		this.clear();

	}
	,getProjection: function(args){
		return this.settings.projection;
	}
	,setProjection: function(args){
	    var projection = arguments[0];
		this.settings.projection = projection;

	}
	,clear: function(args){ /* does this work in IE? */
		var deleteMemory = arguments[0];
		this.vismoCanvas.clear(deleteMemory);
	},
	
	drawFromGeojson: function(args){
      var geojson = arguments[0];
      var autosize = arguments[1];
			if(typeof geojson == 'string'){
				geojson = eval('(' +geojson+ ')');
			}
							
			this._lastgeojson = geojson;
			if(autosize){
			 	var t = VismoMapUtils.fitgeojsontocanvas(geojson,this.wrapper);

				var p =this.getProjection();
				if(p && p.name == "GLOBE") {
					t.translate = {x:0,y:0};
				}
					
				this.controller.setTransformation(t);
			}
		
			var type =geojson.type.toLowerCase();		
	 
			if(type == "featurecollection"){
				var features = geojson.features;
				this.drawGeoJsonFeatures(features);
			}  else if(type =='feature') {
				this.drawGeoJsonFeature(geojson);
			} else {
				console.log("only feature collections currently supported");
			}
 
			this.render();
			
	},
	add: function(feature){
	    this.drawGeoJsonFeature(feature,feature.properties);
	    //console.log("add feature");
	    this.render();
	}
	,drawFromGeojsonFile: function(args){
	    var file = arguments[0];
		var that = this;
		var callback = function(status,params,responseText,url,xhr){
		
			that.drawFromGeojson(responseText);
		};
		VismoFileUtils.loadRemoteFile(file,callback);
	}

	,getTransformation: function(args){
		if(!this.transformation){
			return false;
		}
		else
			return this.transformation;
	}
	,setTransformation: function(args){
	    var transformation = arguments[0];
		if(typeof transformation.translate.x != 'number'||typeof transformation.translate.y != 'number') throw "bad transformation translate given ";
		if(typeof transformation.scale.x != 'number'||typeof transformation.scale.y != 'number') throw "bad transformation scale given ";
		
		this.controller.setTransformation(transformation);
	}
	,moveTo: function(args){
	    var longitude= arguments[0];
	    var latitude = arguments[1];
	    var zoom = arguments[2];
		var newt = {translate:{},scale:{}};
		var transformation =this.getTransformation();
		
		var newxy={};
		newxy.x = parseFloat(longitude);
		newxy.y = parseFloat(latitude);
		
		if(this.settings.projection){
		 	newxy = this.settings.projection.xy(newxy.x,newxy.y,transformation);
		}
		newt.translate.x = - newxy.x;
		newt.translate.y = newxy.y;
		
		if(!zoom){
			zoom =transformation.scale.x;
		}
		else{
			zoom = parseFloat(zoom);
		}
		newt.scale.x = zoom;
		newt.scale.y = zoom;
		this.controller.setTransformation(newt)
		
	}

	,redraw: function(args){
    //console.log("do redraw");
    this.render();	

	    //alert("average VML render"+ VismoVector.rstats);
	    //alert("total average VML render time"+ VismoVector.rstats * VismoVector.rnum);
	},
		
	transform: function(args){
    var transformation = arguments[0];
    //console.log(arguments);
    var w =parseInt(this.wrapper.style.width);
    var h = parseInt(this.wrapper.style.height);
    var t =transformation.translate;
    var s = transformation.scale;

    this.transformation = transformation;
    /*if(!transformation.origin){
    	this.transformation.origin = {};
    	var origin = this.transformation.origin;
    	origin.x =w / 2;
    	origin.y =h / 2;
    }*/

    if(s.x < 0.5) s.x = 0.5;
    if(s.y < 0.5) s.y = 0.5;

    if(t.x > 180) t.x = 180; //t.x=Math.min(t.x, 180)
    if(t.x < -180) t.x = -180;

    if(t.y > 85.0511) t.y = 85.0511;
    if(t.y < -85.0511) t.y = -85.0511;

    if(!this.transformation.rotate){
    		this.transformation.rotate = {x:0,y:0,z:0};
    }
	

    var that = this;

    that.vismoCanvas.setTransformation(that.transformation);
    that.redraw();


	},


	/*onmouseup and ove are functions with following parameters:
		e,shape,mouse,longitude_latitude,feature
		
	*/
	mouse: function(args){
 	    if(!args){
	        return {up: this.onmouseup, down: this.onmousedown, move: this.onmousemove, dblclick: this.ondblclick,keypress:this.onkeypress};
	    }
			if(args.move)this.onmousemove =args.move;
			if(args.up)this.onmouseup = args.up;
			if(args.down)this.onmouseup = args.down;
			if(args.keypress) this.onkeypress = args.keypress;
			if(args.dblclick) this.ondblClick = args.dblclick;
	}

	,_hijackMouseFunctions: function(args){
	        var eMap = this;
	        var getParameters = function(e){
			var result = {};
			var code;
			if (e.which) code =e.which;
			else if (e.keyCode) code = e.keyCode;
			var character;
			if(code) character = String.fromCharCode(code);	
			var t = VismoClickingUtils.resolveTargetWithVismo(e);
			if(t && t.getAttribute("class") == 'vismoControl') return false;
			var shape = eMap.vismoCanvas.getShapeAtClick(e);
			if(shape) {
				result.shape = shape;
				result.feature = eMap.geofeatures[eMap.vismoCanvas.getMemoryID(shape)];
			}
		
			
			var pos = VismoClickingUtils.getMouseFromEvent(e);
			var x =pos.x;
			var y = pos.y;
			result.mouse = pos;
			result.longitude_latitude = VismoMapUtils.getLongLatFromMouse(x,y,eMap);
			result.event = e;
			result.keypressed = character;
			return result;
			
		};
		
		 var md = function(e,s){
	                var r = getParameters(e);
	                if(eMap.onmousedown) eMap.onmousedown(e,s,r.mouse,r.longitude_latitude,r.feature,r.key,eMap);
	        };
	        
	        var mu = function(e,s){
	                var r = getParameters(e);
	                if(eMap.onmouseup) eMap.onmouseup(e,s,r.mouse,r.longitude_latitude,r.feature,r.key,eMap);
	        };
	        var mm = function(e,s){
	            
	                var r = getParameters(e);
	                if(eMap.onmousemove) eMap.onmousemove(e,s,r.mouse,r.longitude_latitude,r.feature,r.key,eMap);	                
	        };
	        var dbl = function(e,s){
	                var r = getParameters(e);
        	        if(eMap.ondblClick) eMap.ondblClick(e,s,r.mouse,r.longitude_latitude,r.feature,r.key,eMap);
	        };
	        var key = function(e,s){
	                var r = getParameters(e);
                        if(eMap.onkeypress) eMap.onkeypress(e,s,r.mouse,r.longtitude_latitude,r.feature,r.key,eMap);
	        }
	        this.vismoCanvas.mouse({mousedown:md,mouseup:mu,mousemove:mm,dblclick:dbl,keypress:key});
	}

	,render: function(args){
	    var d1 = new Date();
	    var flag = arguments[0];
		var tran =this.transformation;

		var that = this;
		this.vismoCanvas.render(this.settings.projection);
		if(this.settings.afterRender) {
			this.settings.afterRender(tran);
			
		}
		var t = document.getElementById(that.wrapper.id + "_statustext");
		if(t) {
			t.parentNode.removeChild(t);	
		}
		var d2 = new Date();
		var id="mapRender";
		if(!VismoTimer[id]) VismoTimer[id] = 0;
		VismoTimer[id] += (d2 - d1);
		
		
		
	
	},
	
	getFeatures: function(args){
	       if(arguments[0] && this.features[arguments[0]]) return this.features[arguments[0]];
	       return this.features;
	}
	,drawGeoJsonFeature: function(args){
	    var featuredata = arguments[0];
	    var props = arguments[1];
		var feature = new VismoMap.Feature(featuredata,props);		
		var s = feature.getVismoShapes();		
		for(var i=0; i < s.length; i++){
			this.vismoCanvas.add(s[i]);
			//this.geofeatures[this.vismoCanvas.getMemoryID(s[i])] = feature;
		}	
         this.features.push(feature);
	},
	drawGeoJsonFeatures: function(args){
	    var features = arguments[0];
			var avg1 = 0;
				
			for(var i=0; i < features.length; i++){
			
				this.drawGeoJsonFeature(features[i],{featureid:i});
			}

	}
	,getVismoCanvas: function(args){
	        return this.vismoCanvas;
	}
	,paint: function(resolver){ /* a helper for chloropleth maps*/
	  /* 
	  the resolver is one of 2 things
	  1) a json is in the form "shape name": "color" where shape name represents the property value name shape in the map 
	 2) a function function(shape name){returns color};
	  */
	  var isFunction = eval(typeof(resolver) == 'function');
	  var shapes = this.getVismoShapes();
    for(var i=0; i < shapes.length; i++){
      var prop = shapes[i].properties;
      var name = prop["name"];
      var newfill;
      if(isFunction) newfill=resolver(name);
	    else newfill= data[name];
	    prop.fill = newfill;
	  }
	  this.redraw();
	}
};


VismoMap.Feature = function(feature,props){
	this.init(feature,props);
};

VismoMap.Feature.prototype = {
	init: function(args){
    var feature = arguments[0];
	  if(arguments[1])extra_properties = arguments[1];
	  else extra_properties = {};
		this.properties = feature.properties;
		this.geometry = feature.geometry;
		this.outers = [];
		this.vismoShapes = [];
		var geometry = this.geometry;
		var type =geometry.type.toLowerCase();

		if(type == 'multipolygon'){
			this._drawGeoJsonMultiPolygonFeature(feature.geometry.coordinates,feature);
		}
		else if(type =='linestring'){
		    this._drawGeoJsonLineStringFeature(feature);
		}
		else if(type=='multilinestring' || type == 'multipoint' || type=='geometrycollection'){
			console.log(type + " not supported yet");
		}

		else if(type == 'polygon'){
			this._drawGeoJsonPolygonFeature(feature.geometry.coordinates,feature);
		}
		else if(type == 'point'){
			this._drawGeoJsonPointFeature(feature.geometry.coordinates,feature);				
		}
		else {	
			//console.log("unsupported geojson geometry type " + geometry.type);
		}		
        var x = this.getVismoShapes();
        var f;
  
        for(f in extra_properties){
    
             for(var i=0; i < x.length; i++){
                x[i].setProperty(f,extra_properties[f]);
            }
        }
	}
	
	,addOuterVismoShape: function(args){
		var shape = arguments[0];
		this.outers.push(shape);
	}
	,getOuterVismoShapes: function(args){
		return this.outers;
	}
	,addVismoShape: function(args){
	    var vismoShape = arguments[0];
		this.vismoShapes.push(vismoShape);
	}
	,getVismoShapes: function(args){
		return this.vismoShapes;
	}
	,_drawGeoJsonLineStringFeature: function(args){
	    var feature = arguments[0];
	    var coordinates = feature.geometry.coordinates;
	    var p = feature.properties;
	    if(!p) p = {};
	    p.shape = "path";
	    p.coordinates = [];
	    //console.log(feature,":)");
	    for(var i=0; i < coordinates.length;i++){
	        var xy =coordinates[i];
	        p.coordinates.push(xy[0]);
	        p.coordinates.push(-xy[1]);
	        
	    } 
	    var s = new VismoShape(p);
	    this.addVismoShape(s);
	    return s;
	    
	}
	,_drawGeoJsonMultiPolygonFeature: function(args){
	    var coordinates=  arguments[0];
	    var feature = arguments[1];
		var outer;
		
		for(var i=0; i < coordinates.length; i++){ //it's a list of polygons!
			var s = this._drawGeoJsonPolygonFeature(coordinates[i],feature,i);
			
		}
		
	},	
	_drawGeoJsonPolygonFeature: function(args){
        var coordinates=  arguments[0];
	    var feature = arguments[1];
	    var featureid = arguments[2];
		var p = feature.properties;
		p.shape = 'polygon';
		//console.log(coordinates[0]);
		
		var outer = false;
		for(var j=0; j< coordinates.length; j++){//identify and create each polygon
			var coords =coordinates[j];	
			coords = VismoUtils.invertYCoordinates(coords);
			var s = new VismoShape(p,coords);
			s.properties.geometryid = featureid;
			s.properties.geometryid2 = j;
			this.addVismoShape(s);
		}
		return outer;		
		
	},
	_drawGeoJsonPointFeature: function(args){
	    var coordinates=  arguments[0];
	    var feature = arguments[1];

		var p = feature.properties;
		p.shape = 'point';
		coordinates[1] = -coordinates[1];
		var s = new VismoShape(p,coordinates);
		this.addVismoShape(s);
	}
	,setProperty: function(args){
	    var id = arguments[0];
	    var val = arguments[1];
	    var shapes = this.getVismoShapes();
	    for(var i=0; i < shapes.length;i++){
	        shapes[i].setProperty(id,val);
	    }
	}
};

jQuery.fn.chloromap = function(options){
  
  var result = [];
  var themedata = options.themedata;
  var themes = themedata.themes;
  /*
  theme looks like this
  "id":{
    "name": "the theme name",
    "values":{"Status Changed":"rgb(255,0,0)","New Site":"rgb(0,255,0)", "Window Changed": "rgb(0,0,255)"}
  }
  */
  
  var range = {};
  var newformat = {};
  var lookupcolor = {};
  for(var i in themes){
    /*
    for some reason I previously defined a theme as 
    "theme name":{
      "id": "1",
      "values":{"Status Changed":"rgb(255,0,0)","New Site":"rgb(0,255,0)", "Window Changed": "rgb(0,0,255)"}
    }
    the following code deals with this old format.
    */
    var theme = themes[i];
    var themeid =theme.id;
    if(themeid){
      newformat[themeid] = {name:i,values:theme.values}
    }
    else{
      newformat[i] = themes[i];
    }
    
    /* deal with range data */
    var data = themedata.data;
    if(newformat[i].rangetype){
      if(!range[i]) range[i] = {};
      for(var j in data){
        var value = parseInt(data[j][i]);
        if(!isNaN(value)){
        
          if(value){
            if(!range[i].from || value < range[i].from) range[i].from = value;
            if(!range[i].to || value > range[i].to) range[i].to = value;
          }
        }
      }
      //now have a range to work from.
      lookupcolor[i] = {};
      var range_for_i = range[i].to- range[i].from;
      for(var j in data){
      var str =data[j][i];
        var value = parseInt(str);
        if(!isNaN(value)){
          var colorValue =255 * (value - range[i].from)/range_for_i;
          lookupcolor[i][j] =  parseInt(colorValue);
        }
        
      }
      
      
      
      //signal that when painting should use value as colour.
      
    }
  }

  if(!options.nodatacolor)options.nodatacolor = "#ffffff";
  themedata.themes = newformat;
  themes = newformat;
  function createKey(place,themeid){
      jQuery(place).html("");
      jQuery(place).css({display:""});
      var createKeyValue = function(keycolor,keylabel,className){
        if(!keycolor || !keylabel){return;}
        if(!className){ className = "";}else {className = " "+className;}
        var html = ["<div class='keyvaluepair'><div class='keyColor",className,"' style='background-color:",keycolor,"'>&nbsp</div><div class='keyLabel"+className+"'>",keylabel,"</div></div>"].join("");
        jQuery(key).append(html);                 
      };
      createKeyValue(options.nodatacolor,"No data","hideable") ;
      if(themeid){
        jQuery(key).css({display:""});
        var index;   
        var theme = themes[themeid];
        for(index in theme.values){
          var text = "" +index;  
          createKeyValue(theme.values[index],text);
        }
      }
  }
  
  if(!options.text)options.text = {};
  if(!options.text.pleaseselect)options.text.pleaseselect = "-- please select a theme --";

  /*create theme selector */
  var dropdownhtml = "<select name='theme_name'><option value=''>"+options.text.pleaseselect+"</option>";
  
  for(var id in themes){
    dropdownhtml += '<option value="'+id+'">'+themes[id].name+'</option>';
  }
  dropdownhtml +="</select>";
  
  var data = themedata.data;

  /*data looks like this: 
  {
  shapename:{themeid:themevalue}
  }
  */

  for(var i=0; i < this.length;i++){
    var holder = this[i];
    jQuery(holder).html("<div class='vthemes'>dropdown here</div><div class='vmap'></div><div class='vmapkey'></div>");
    
    var vmap =new VismoMap(jQuery(".vmap",holder)[0],options);
    var key = jQuery(".vmapkey",holder)[0];
    var changetheme = function(e){
      if(!e || !e.target)return;
      var themeid = e.target.value;
      var getcolor = function(shapename){
        var theme = themedata.themes[themeid];
        if(theme.values){
          var values = theme.values;
          if(data[shapename])return values[data[shapename][themeid]];
          else return options.nodatacolor;
        }
        else{
          var amount  =lookupcolor[themeid][shapename];
          //console.log(amount);
          if(amount)return theme.basecolor.replace("X",amount)
        }
      }
      vmap.paint(getcolor);
      createKey(key,themeid);
      
    }
    jQuery(".vthemes",holder).html(dropdownhtml).change(changetheme);
    result.push(vmap);
  }
  return result;
  
};

/*
Some common utils used throughout package 
*/
var VismoMapUtils = {
	googlelocalsearchurl: "http://ajax.googleapis.com/ajax/services/search/local?v=1.0&q="
	
	,optimiseForIE6: function(geojson){
      	var newf = [];
        for(var i=0; i < geojson.features.length;i++){
            var f = geojson.features[i];
            var coordinates = f.geometry.coordinates;


            var newc = [];
            
            var good = false;
            
            if(coordinates.length <2){
                good = true;
            }
            for(var j=0; j < coordinates.length; j++){
                var c1 = coordinates[j];
                
            }
            
            var bb = f.geometry.bbox;
            if(bb){
                var dx = bb[2] - bb[0]; var dy= bb[3]- bb[1]; if(dy<0)dy =-dy;if(dx<0)dx =-dx;
                if(dx < 1 || dy < 1){
                    good =false;
                }
            }
            
            if(good){
                newf.push(f);
            }
        }
        geojson.features= newf;
        return geojson;
	
	}
	,addBoundingBoxes: function(geojson){ //currently MultiPolygon only..
		var geojsonbb = geojson;
		for(var i=0; i < geojson.features.length; i++){
			var f = geojson.features[i];

			var g = f.geometry;
			var c = g.coordinates;

			
			if(g.type.toLowerCase() == 'multipolygon'){
				var x1,y1,x2,y2;
				
				var horizontal = {belowzero:0,abovezero:0};
				var vertical = {belowzero:0,abovezero:0};
			
				for(var j=0; j < c.length; j++){
					for(var k=0; k < c[j].length; k++){
						
						for(var l=0; l < c[j][k].length; l++){
							var x = c[j][k][l][0];
							var y = c[j][k][l][1];
							/*if(x < 0 && horizontal.abovezero > horizontal.belowzero){
								x = 180;
							}
							else if(x > 0 && horizontal.abovezero < horizontal.belowzero){
								x = -180;
							}*/
							if(!x1) x1= x;
							if(!x2) x2 =x;
							if(!y1) y1 = y;
							if(!y2) y2 = y;
							if(y > y2) y2 = y;
							if(y < y1) y1 = y;
							if(x < x1) x1 = x;
							if(x > x2) x2= x;
							
							if(x > 0){
								horizontal.abovezero +=1;
							}
							else{
								horizontal.belowzero +=1;
							}
							
							if(y > 0){
								vertical.abovezero +=1;
							}
							else{
								vertical.belowzero +=1;
							}
							
									
										
						}
					}
				}
				
				//if(f.properties.name == "RUSSIAN FEDERATION")
				//console.log(x1,x2);
	
				g.bbox = [];
				g.bbox.push(x1);
				g.bbox.push(y1);
				g.bbox.push(x2);
				g.bbox.push(y2);
				x1 = false; x2=false;y1=false;y2=false;
			}
			
		}
		return geojsonbb;
	}
	 ,tile2long: function(x,z) {
	  	return (x/Math.pow(2,z)*360-180);
	 }
	 ,tile2lat: function(y,z) {
	  	var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
	  	return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
	 }
	,getLongLatAtXY: function(x,y,eMap){
		
		var res = VismoMapUtils.getLongLatFromMouse(x,y,eMap);
	
		
		return res;
	}
	,getSlippyTileNumber: function(lo,la,zoomL,eMap){
		var n = Math.pow(2,zoomL);
		var x = lo;

		var tilex = ((lo + 180)/360) *n;

		tilex = Math.floor(tilex);
		tiley =(Math.floor((1-Math.log(Math.tan(la*Math.PI/180) + 1/Math.cos(la*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoomL)));		
		return {x: tilex, y:tiley};
	}
	,getLocationsFromQuery: function(query,callback){
		var that = this;
		var fileloadedcallback = function(status,params,responseText,url,xhr){
				var response = eval("("+responseText+")");

				if(response.responseStatus == 200){
					var results = response.responseData.results;
					callback(results);
					
					return;
				}

		};
			
	
		VismoFileUtils.loadRemoteFile(that.googlelocalsearchurl+query,fileloadedcallback);
	}
	,getLongLatFromMouse: function(x,y,vismoMap){
		var t =vismoMap.getTransformation();
		var pos = VismoClickingUtils.undotransformation(x,y,t);	
		
		if(vismoMap.settings.projection) {
			pos = vismoMap.settings.projection.inversexy(pos.x,pos.y,t);
		}

		var lo = pos.x;
		var la = -pos.y;
		
		
		/*if(la > 85.0511) la = -la%85.0511;
		if(la < -85.0511) la = -la%85.0511;
		if(lo < -180) lo = -lo%180;
		if(lo > 180) lo = - lo%180;
		*/
		return {latitude: la, longitude: lo};
	}
	,_radToDeg: function(rad){
		return rad / (Math.PI /180);
	},
	_degToRad: function(deg) {
		//return ((deg + 180)/360) ;
		
		return (deg * Math.PI) / 180.0;
	},
	fitgeojsontocanvas: function(json,canvas){ /*canvas must have style width and height properties, returns an VismoTransformation*/
		var view ={};
		var f =json.features;
		for(var i=0; i < f.length; i++){
			var c = f[i].geometry.coordinates;
											
			for(var j=0; j < c.length; j++ ){
				for(var k=0; k < c[j].length; k++){
					

					for(var l=0; l < c[j][k].length;l++){
						
		
						var x =c[j][k][l][0];
						var y = c[j][k][l][1];
						if(!view.x1 || x <view.x1) {
							view.x1 = x;
						}
						else if(!view.x2 || x >view.x2) {
							view.x2 = x;
						}
						
						if(!view.y1 || y <view.y1) {
							view.y1 = y;
						}
						else if(!view.y2 || y >view.y2) {
							view.y2 = y;
						}
						

					}
						
				}
				
			}
		}
		if(!json.transform) json.transform ={};
		if(!json.transform.scale) json.transform.scale = {x:1, y:1};
		if(!json.transform.translate) json.transform.translate = {x:0,y:0};
		
		var canvasx =		parseFloat(canvas.style.width);
		var canvasy =parseFloat(canvas.style.height);
		view.center = {};
		view.width = (view.x2 - view.x1);
		view.height = (view.y2 - view.y1)
		view.center.x = view.x2 - (view.width/2);
		view.center.y = view.y2 - (view.height/2);
		//console.log(view.center.y, view.height);
		var scale = 1,temp;
		var tempx = parseFloat(canvasx/view.width);
		var tempy = parseFloat(canvasy/view.height);

		if(tempx < tempy) temp = tempx; else temp = tempy;
		
		var transform = {scale:{},translate:{}};
		transform.scale.x = temp;
		transform.scale.y = temp;

		transform.boundingBox = view;

		transform.translate.x = -view.center.x;
		transform.translate.y = view.center.y;//view.center.y;	
		return transform;
	},
	/*does not yet support undoing rotating */
	_testCanvas: function(ctx){
		ctx.beginPath();
		ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
		ctx.moveTo(110,75);
		ctx.arc(75,75,35,0,Math.PI,false);   // Mouth (clockwise)
		ctx.moveTo(65,65);
		ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
		ctx.moveTo(95,65);
		ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
		ctx.stroke();

	},	
	_undospherify: function (x,y,transformation,radius){
		var pos= this._spherifycoordinate(x,y,transformation);
		var latitude = Math.asin(y / radius);
		var longitude = Math.asin(parseFloat(x / radius) / Math.cos(latitude));

				
	
		//if(transformation.rotate.z && longitude != 'NaN')longitude -= transformation.rotate.z;
		//longitude = longitude % (6.28318531);
		//if(longitude < 0) longitude = longitude 

		if(transformation.rotate) {
			var r =transformation.rotate.z;
			//console.log("from",longitude);
			longitude +=r;
		
			//longitude =longitude% (6.28318531);
			
		}
		var lon = VismoMapUtils._radToDeg(longitude);
		var lat = VismoMapUtils._radToDeg(latitude);
		//console.log("to",longitude,r,lon);
		return {x:lon,y:lat};
	},
	_spherifycoordinate: function(lon,lat,transformation,radius){
		//http://board.flashkit.com/board/archive/index.php/t-666832.html
		var utils = VismoMapUtils;
		var res = {};
		
		var longitude = VismoMapUtils._degToRad(lon);
		var latitude = VismoMapUtils._degToRad(lat);
 		var wraplat = false;
 		// assume rotate values given in radians
		if(transformation && transformation.rotate){
			//latitude += transformation.rotate.x;
			
			var rotation =transformation.rotate.z;
			//rotation = transformation.translate.x;
			if(rotation){
				var r =parseFloat(rotation);
			
				var newl =parseFloat(longitude+r);
			
				//console.log(longitude,"->",newl,longitude,r,transformation.rotate.z);
			
				longitude +=r;
			}
			if(transformation.rotate.y){
				latitude += parseFloat(transformation.rotate.y);
				/*var limit =VismoMapUtils._degToRad(85);
				if(latitude <-limit){
					latitude += (2 * limit);
					res.movedNorth = true;
					
				}
				
				if(latitude > limit){
					latitude -= (2 * limit);
					res.movedSouth = true;
					
					
				}
				*/	
				
				//latitude = latitude % 6.28318531;
				
			} 
		}
		// latitude is 90-theta, where theta is the polar angle in spherical coordinates
		// cos(90-theta) = sin(theta)
		// sin(90-theta) = cos(theta)
		// to transform from spherical to cartesian, we would normally use radius*Math.cos(theta)
		//   hence in this case we use radius*Math.sin(latitude)
		// similarly longitude is phi-180, where phi is the azimuthal angle
		// cos(phi-180) = -cos(phi)
		// sin(phi-180) = -sin(phi)
		// to transform from spherical to cartesian, we would normally use radius*Math.sin(theta)*Math.cos(phi)
		//   we must exchange for theta as above, but because of the circular symmetry
		//   it does not matter whether we multiply by sin or cos of longitude	
	
		longitude = longitude % 6.28318531; //360 degrees		
	
		
		
		
		res.y = (radius) * Math.sin(latitude);	
		//console.log(latitude);
		//if(wraplat) res.y = ["M",res.y];
		/*
		
		if(latitude > 85.0511){
			res.y = (-radius) * Math.sin(latitude);	
		}
		else{
		res.y = (radius) * Math.sin(latitude);		
		}
		*/
		
		//if(latitude > 85.0511)
		
		
		if(longitude < 1.57079633 || longitude > 4.71238898){//0-90 (right) or 270-360 (left) then on other side 
			res.x = (radius) * Math.cos(latitude) * Math.sin(longitude);		
		}
		else{
			//console.log(longitude,"bad",transformation.rotate.z);
			res.x = false;
		}
	
		return res;
	}

};var VismoOptimisations = {
    minradius:5,
  packCoordinates: function(coordlist){
    var res = [];
    for(var i=0; i < coordlist.length-1; i+=2){
      res.push([coordlist[i],coordlist[i+1]]);
    }
    
    return res;
  }
  ,unpackCoordinates: function(coordlist){
    var res = [];
    for(var i=0; i < coordlist.length; i+=1){
      res.push(coordlist[i][0]);
      res.push(coordlist[i][1]);
    }
    return res;  
  }
  //coords in form [[x1,y1],[x2,y2]]
  ,douglasPeucker: function(coords,tolerance, start,end){
    var results = [];

    if(!start) start = 0;
    if(!end) end = coords.length - 1;
    if(start >= coords.length || end >= coords.length || start == end -1){
      return [];
    }  
    var midpoint = {};
  
  
    midpoint.x = (coords[end][0] + coords[start][0]) /2;
    midpoint.y = (coords[end][1] + coords[start][1]) /2;
    
    var bestPoint = {distance:-1, index:-1};
    for(var i=start+1; i < end; i++){
      var x = coords[i][0];
      var y = coords[i][1];
      var deltax = midpoint.x - x;
      var deltay= midpoint.y - y;
      
      var perpendicular_d = Math.sqrt((deltax * deltax ) + (deltay *deltay)); //this is not perpendicular distancd.. i think!
      if(perpendicular_d > bestPoint.distance){
        bestPoint.index = i;
        bestPoint.distance = perpendicular_d;
      }
    }
  
    if(bestPoint.index ==-1 || bestPoint.distance<tolerance){
      var res = [];
      res.push(coords[start]);
      //res.push(coords[end])
      return res; //none of these points are interesting except last
    }
    else{
      results.push(coords[start]);
      var ref = bestPoint.index;
      var splice1 = VismoOptimisations.douglasPeucker(coords,tolerance,start+1,ref);
      var splice2 = VismoOptimisations.douglasPeucker(coords,tolerance,ref,end);
      results = results.concat(splice1);
      results = results.concat(splice2);
      results.push(coords[end]);
      return results;
    }
    
  }
  ,inVisibleArea: function(el,x,y,transformation){
        var left = 0,top = 0;
        
        var right =  jQuery(el).width(); 
      var bottom = jQuery(el).height();
    
      var topleft =  VismoClickingUtils.undotransformation(left,top,transformation);
      var bottomright =  VismoClickingUtils.undotransformation(right,bottom,transformation);        
          if(x < bottomright.x && x > topleft.x && y < bottomright.y && y > topleft.y){
              
              return true;
          }
          else{
              console.log("bad",el,x,y,transformation,topleft,bottomright);
              return false;
          }
  }
  ,vismoShapeIsInVisibleArea: function(vismoShape,canvas,transformation,projection){
    var left = 0,top = 0;
    var right =  parseInt(canvas.width) + left; 
    var bottom = parseInt(canvas.height) + top;
    var topleft =  VismoClickingUtils.undotransformation(left,top,transformation);
    var bottomright =  VismoClickingUtils.undotransformation(right,bottom,transformation);    
    if(projection){
        topleft = projection.xy(topleft);  
        bottomright = projection.xy(bottomright);  
    }
    var frame = {};
    frame.top = topleft.y;
    frame.bottom = bottomright.y;
    frame.right = bottomright.x;
    frame.left = topleft.x;

    var g = vismoShape.getBoundingBox();
           
    if(g.x2 < frame.left) {
      return false;}
    if(g.y2 < frame.top) {
      return false;}
    if(g.x1 > frame.right){
      return false;
    }
    if(g.y1 > frame.bottom){
      return false;  
    }
    
    return true;
  }
  
  ,vismoShapeIsTooSmall: function(vismoShape,transformation){
      
      VismoTimer.start("VismoOptimisations.vismoShapeIsTooSmall");

    if(!transformation ||!transformation.scale) {
        VismoTimer.end("VismoOptimisations.vismoShapeIsTooSmall");
        return false;
    }
    var g = vismoShape.getBoundingBox();
    var s = transformation.scale;
    var t1 = (g.width) * s.x;
    var t2 =(g.height) * s.y;

       
    if(t2 < this.minradius&& t1 < this.minradius) 
      {
        VismoTimer.end("VismoOptimisations.vismoShapeIsTooSmall");
                    return true;}//too small
    else{
       VismoTimer.end("VismoOptimisations.vismoShapeIsTooSmall");
      return false;
    }
    VismoTimer.end("VismoOptimisations.vismoShapeIsTooSmall");
  }

};
Array.prototype.contains = function(item)
{
  return this.indexOf(item) != -1;
};
Array.prototype.clone = function () {var a = new Array(); for (var property in this) {a[property] = typeof (this[property]) == 'object' ? this[property].clone() : this[property]} return a};

if(!Array.indexOf) {
  Array.prototype.indexOf = function(item,from)
  {
    if(!from)
      from = 0;
    for(var i=from; i<this.length; i++) {
      if(this[i] === item)
        return i; 
    }
    return -1;
  };
}

var VismoShapeUtils ={
    randomColor: function(alpha){
       var r = parseInt(Math.random() * 255);
       var g = parseInt(Math.random() * 255);
       var b = parseInt(Math.random() * 255);
       var a;
       if(alpha) var a = parseInt(Math.random() * 255);
       else a = 1;
       return "rgba("+r+","+g+","+b+","+a+")";
    }
    ,_isCoordinate: function(c){
        if(c == "M" || c == "q" || c== 'c') return false;
        else {
            if(typeof(c)== 'number') return true;
        }
    }
    
    ,toHex: function(rgba){
        if(rgba.indexOf("rgba") == 0){
            rgba = rgba.replace("rgba(","");
            rgba = rgba.replace(")","");
        }
        else if(rgba.indexOf("rgb")==0){
             rgba = rgba.replace("rgb(","");
        }
        
        rgba = rgba.replace(")","");
        rgba = rgba.split(",");
        return "#"+this._tohexadecimal(rgba[0])+this._tohexadecimal(rgba[1]) +this._tohexadecimal(rgba[2]);
    }
    ,_tohexadecimal: function(N){
        if (N==null) return "00";
        N=parseInt(N); if (N==0 || isNaN(N)) return "00";
        N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
        return ["0123456789ABCDEF".charAt((N-N%16)/16),"0123456789ABCDEF".charAt(N%16)].join("");
        
    }
    ,opacityFrom: function(rgba){
 
        var rgbcode = rgba.replace("rgba(","");
      rgbcode = rgbcode.replace(")","");
      rgbcode = rgbcode.split(",");
      var opvalue = 0;
      if(rgbcode.length < 4) opvalue = 1;
      else opvalue =rgbcode[3];
      
      return opvalue;
    }
    ,toRgb: function(hex_rgba,opacity){
        var rgb = {};
        if(hex_rgba.indexOf("#") == 0 && hex_rgba.indexOf(",") == -1){ //hex code argument
            var hex = hex_rgba;
      var hexcode = hex.substring(1);
      rgb.red = this._hexToR(hexcode);
      rgb.blue = this._hexToB(hexcode);
      rgb.green = this._hexToG(hexcode);
    }
    else if(hex_rgba.indexOf("rgba") != -1){
        var rgbcode = hex_rgba.replace("rgba(","");
        rgbcode = rgbcode.replace(")","");
        rgbcode = rgbcode.split(",");
        rgb.red =rgbcode[0];
        rgb.green =rgbcode[1];
        rgb.blue =rgbcode[2];
        opacity = rgbcode[3];
    }
    return {rgb:"rgb("+rgb.red+","+ rgb.green +","+ rgb.blue+")",opacity:opacity};
  }    
    ,toRgba: function(hex,opacity){
        var rgb = {};
        if(hex.indexOf("#") == 0 && hex.indexOf(",") == -1){ //hex code argument
      var hexcode = hex.substring(1);
      rgb.red = this._hexToR(hexcode);
      rgb.blue = this._hexToB(hexcode);
      rgb.green = this._hexToG(hexcode);
    }
    if(!opacity) opacity = "1.0";
    return "rgba("+rgb.red+","+ rgb.green +","+ rgb.blue+"," + opacity+")";
    }
  /* thank you http://www.javascripter.net/faq/hextorgb.htm*/
  ,_cutHex: function(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
  ,_hexToR:function(h){return parseInt((this._cutHex(h)).substring(0,2),16)}
  ,_hexToG: function (h) {return parseInt((this._cutHex(h)).substring(2,4),16)}
  ,_hexToB:function(h) {return parseInt((this._cutHex(h)).substring(4,6),16)}

};
var VismoUtils = {
  canvasSupport: false
  ,userAgent: navigator.userAgent.toLowerCase()
  ,clone: function(obj){

        if(!obj) return obj;
        if(obj.appendChild) return obj;
      if(obj == null || typeof(obj) != 'object')return obj;

      var temp = new obj.constructor(); // changed (twice)

      for(var key in obj){
          //console.log(key);
          temp[key] = VismoUtils.clone(obj[key]);
          //console.log(temp[key])
      }

      return temp;

  }
  ,invertYCoordinates: function(coords){
    var res = [];
    for(var i=0; i < coords.length; i++){
      var x = coords[i][0];
      var y = coords[i][1];
      res.push([x,-y]);
    }
    return res;
  },
  scrubNode: function(e)
    {
      if(!VismoUtils.browser.isIE)
        return;
      var att = e.attributes;
      if(att) {
        for(var t=0; t<att.length; t++) {
          var n = att[t].name;
          if(n !== "style" && (typeof e[n] === "function" || (typeof e[n] === "object" && e[n] != null))) {
            try {
              e[n] = null;
            } catch(ex) {
            }
          }
        }
      }
      var c = e.firstChild;
      while(c) {
         VismoUtils.scrubNode(c);
        c = c.nextSibling;
      }
      e.parentNode.removeChild(e);
    }
    
  ,mergejsons: function(prop1,prop2){    
    var res = {};
    var i;
    for(i in prop1){
        res[i] = prop1[i];
    }
    for(i in prop2){
        res[i] = prop1[i];
    }
    return res;    
  }
  ,init: function(){
    var canvas = document.createElement("canvas");
    if(canvas.getContext) {        
        VismoUtils.canvasSupport = true;
    }
    
  }
};
VismoUtils.init();
  
VismoUtils.browser= {
    isIE: VismoUtils.userAgent.indexOf("msie") != -1 && VismoUtils.userAgent.indexOf("opera") == -1,
    isGecko: VismoUtils.userAgent.indexOf("gecko") != -1,
    ieVersion: /MSIE (\d.\d)/i.exec(VismoUtils.userAgent), // config.browser.ieVersion[1], if it exists, will be the IE version string, eg "6.0"
    isSafari: VismoUtils.userAgent.indexOf("applewebkit") != -1,
    isBadSafari: !((new RegExp("[\u0150\u0170]","g")).test("\u0150")),
    firefoxDate: /gecko\/(\d{8})/i.exec(VismoUtils.userAgent), // config.browser.firefoxDate[1], if it exists, will be Firefox release date as "YYYYMMDD"
    isOpera: VismoUtils.userAgent.indexOf("opera") != -1,
    isLinux: VismoUtils.userAgent.indexOf("linux") != -1,
    isUnix: VismoUtils.userAgent.indexOf("x11") != -1,
    isMac: VismoUtils.userAgent.indexOf("mac") != -1,
    isWindows: VismoUtils.userAgent.indexOf("win") != -1
  };

if(VismoUtils.browser.isIE && VismoUtils.browser.ieVersion[1] == "6.0"){
VismoUtils.browser.isIE6 = true;

}

if(VismoUtils.browser.isIE){
  if (!document.namespaces['vismoShapeVml_']) {
          document.namespaces.add('vismoShapeVml_', 'urn:schemas-microsoft-com:vml'/*,"#default#VML"*/);
          
  }
  document.namespaces.add('xmlns', 'http://www.w3.org/1999/xhtml');
  document.namespaces.add('svg', 'http://www.w3.org/2000/svg');
  document.namespaces.add('xlink', 'http://www.w3.org/1999/xlink');

    // Setup default CSS.  Only add one style sheet per document
   if (!document.styleSheets['vismoShape']) {
          var ss = document.createStyleSheet();
          ss.owningElement.id = 'vismoShape';
          ss.cssText = 'canvas{display:inline;overflow:hidden;' +
              'text-align:left;}' +
              'vismoShapeVml_\\: * {behavior:url(#default#VML);}';
  }
}
VismoUtils.svgSupport = function(){
        if(VismoUtils.browser.isIE){
                try {
                 var asv = new ActiveXObject("Adobe.SVGCtl");
                 return true;
                }
                catch(e){ }
        }
        else if(document.implementation) {
                if(VismoUtils.browser.isSafari) return true;
                return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.0");
        }



        return true;
};
/* 
Creates primitive shapes that can be rendered across most browsers
I am not very happy with the code that follows. It is not of the best standard and needs much improvement
coordinates are a string consisting of floats and move commands (M)
*/

var VismoShape = function(properties,coordinates){
    this._isVismoShape = true;
    this._iemultiplier = 1000;
    this.options = {};
    if(!coordinates) {
        coordinates = properties.coordinates;
        delete properties["coordinates"];
    }
    this._optimise_cache = {};
    
  this.coordinates = {
    projected: false,
    normal: [],
    optimised: {},
    optimisedandprojected:{}
  };
  this.grid = {};
  this.width = 0;
  this.height =0;
  this.properties = {};
  this.setProperties(properties);
  //if(!this.properties.lineWidth)this.properties.lineWidth = "0.2";
  if(coordinates[0] && coordinates[0].length == 2){
    coordinates = VismoOptimisations.unpackCoordinates(coordinates);  
  }
  
  this._construct(properties,coordinates);
  this.browser =false;
  this.currentResolution = false;
  this.vml = false;
  this.unique_id = [Math.random(),"_",this.properties.id].join("");
  this._scale = {x:1,y:1};
};



VismoShape.prototype={
    _commands: {"M":true,"c":true,"q":true,"XE":true}
    ,isCommand: function(i){
        return this._commands[i];

    }
    ,clone: function(){
                var coords = this.getCoordinates("normal");
                var props = this.getProperties();
                var p = VismoUtils.clone(props);
                p.coordinates = coords;
                try{
                    //console.log(p);
                    return new VismoShape(p);
                }
                catch(e){
                    throw e;
                }
    }
    ,translate: function(x,y){
        var c = this.getCoordinates("normal");

        var newc = [];
        for(var i=0; i < c.length; i+=2){
             if(this.isCommand(c[i])) i+=1;
             var newx,newy;

            newx = c[i] + x;
            newy = c[i+1] + y;
            newc.push(newx);
            newc.push(newy);
        }

        this.setCoordinates(newc);
      }

    ,scale: function(x,y){
        this._scale.x = x;
        this._scale.y = y;
        var c = this.getCoordinates("normal");

        var newc = [];
        for(var i=0; i < c.length; i+=2){
            if(this.isCommand(c[i])) i+=1;
            var newx,newy;

            newx = c[i] * x;
            newy = c[i+1] * y;
            newc.push(newx);
            newc.push(newy);
        }

        this.setCoordinates(newc);
        return true;
    }
  ,resize: function(x,y){
      var bb = this.getBoundingBox();
      var newWidth = x *bb.width;
      var newHeight = y * bb.height;
      var offsetx = (bb.center.x * x) - bb.center.x;
      var offsety = (bb.center.y * y)- bb.center.y;
      this._scale.x = x;
      this._scale.y = y;
      var c = this.getCoordinates("normal");

      var newc = [];
      for(var i=0; i < c.length; i+=2){
          var newx,newy;
          
          newx = c[i] * x;
          newy = c[i+1] * y;
          newx -= offsetx;
          newy -= offsety;
          newc.push(newx);
          newc.push(newy);
      }
    
      this.setCoordinates(newc);
      return true;
  }
  ,_validDomElements: {"image":true,"domElement":true}
  ,_path: {"path":true}
  ,_pathbased:{"polygon":true,"path":true}
  ,_arcbased: {"circle":true,"point":true}
  ,_isDomElement: function(shapetype){
    return this._validDomElements[shapetype];
  }
  ,_isPath: function(shapetype){
    return this._path[shapetype];
  }
  ,_isPathBased: function(shapetype){
    return this._pathbased[shapetype];
  }
  ,_isArcBased: function(shapetype){
    return this._arcbased[shapetype];
  }
  ,moveTo: function(x,y){
      var st = this.properties.shape;
      var dim = this.getDimensions();
   
      if(this._isArcBased(st)){
          this.setCoordinates([x,y,dim.width/2, dim.height/2]);
      }
      else if(this._isPathBased(st)){
          var bb = this.getBoundingBox();
          var movex = x - bb.center.x;
          var movey = y - bb.center.y;
          
          var c = this.getCoordinates("normal");
          var newc = [];
          for(var i=0; i < c.length; i+=2){
              if(this.isCommand(c[i])) i +=1;
              newc.push(c[i]+movex);
              newc.push(c[i+1]+movey);
          }
          this.setCoordinates(newc);
      }
  }
  ,getShape: function(){
    return this.getProperty("shape");
  }
  ,setProperties: function(properties){
      var newprops = VismoUtils.clone(properties);
    var i;
    for(i in newprops){
            this.setProperty(i,newprops[i]);
    }
    if(!newprops["z-index"]){
        this.setProperty("z-index","0");
    }
    if(!newprops.stroke){
      this.setProperty("stroke",'#000000');    
    }
    
  }
  ,getBoundingBox: function(){ /* returns untransformed bounding box */
      return this.grid;
  }
  ,render: function(canvas,transformation,projection,optimisations, unused,dimensions){
    VismoTimer.start("VismoShape.render");
    if(projection) {this._applyProjection(projection,transformation);}
    if(VismoUtils.canvasSupport){
      this.render_canvas(canvas,transformation,projection,optimisations);   
    }
    else{
      this.render_ie(canvas,transformation,projection,optimisations, unused,dimensions);  
    }
    VismoTimer.end("VismoShape.render");
  }
  ,render_ie: function(canvas,transformation,projection,optimisations, unused,dimensions){
      VismoTimer.start("VismoShape.render_ie");
      var vml = this.vml;
      if(this.properties.hidden){
          if(vml)vml.clear();
          return;
      }
      if(vml===false){ //not created
          vml = new VismoVector(this,canvas,dimensions);
          this.donevml = true;
      }
      vml.render(canvas,transformation,projection);
      this.vml = vml;
      VismoTimer.end("VismoShape.render_ie");
      return;
  }
  ,render_canvas: function(canvas,transformation,projection,optimisations){
    VismoTimer.start("VismoShape.render_canvas");
    var c;
    if(this.properties.hidden){
      return;
    }
    var vismoShape = this;
    var ctx = canvas.getContext('2d');
    if(!ctx) return;
    vismoShape.ctx = ctx;
    ctx.save();
    if(transformation){
      var o = transformation.origin;
      var tr = transformation.translate;
      var s = transformation.scale;
      var r = transformation.rotate;
      if(o)ctx.translate(o.x,o.y);
      if(s)ctx.scale(s.x,s.y);
      if(tr)ctx.translate(tr.x,tr.y);
      if(r && r.x)ctx.rotate(r.x);
    }
    VismoCanvasRenderer.renderShape(canvas,vismoShape);
    ctx.restore();
    VismoTimer.end("VismoShape.render_canvas");
  }
  ,getTransformation: function(){
      var transform= this.getProperty("transformation");
     
      if(!transform) transform = {translate:false,scale:false};
       if(!transform.translate)transform.translate = {x:0,y:0};
       if(!transform.translate.x)transform.translate.x = 0;
       if(!transform.translate.y)transform.translate.y = 0;
       if(!transform.scale)transform.scale= {x:1,y:1};
       if(!transform.scale.x)transform.scale.x = 1;
       if(!transform.scale.y)transform.scale.y = 1;
         
         return transform;
  }
  
  ,setTransformation: function(transformation){
      this.setProperty("transformation",transformation);
      this._calculateBounds();
  }
  ,setCoordinates: function(coordinates,type){
    VismoTimer.start("VismoShape.setCoordinates");
    var prop = this.properties;
    var stored_c = this.coordinates;
    var shapetype = prop.shape;
    var stored_c_normal = stored_c.normal;
    if(shapetype == 'circle' || shapetype == 'point'){
        if(coordinates.length == 2 && stored_c_normal){
            coordinates.push(stored_c_normal[2]);
            coordinates.push(stored_c_normal[3]);
        }
    }          
    var good = [];
    var clen = coordinates.length;
    for(var i=0; i < clen; i++){
      var c =coordinates[i];
        if(!this.isCommand(c)){
          c = parseFloat(c);
        }
        {good.push(c);}
    }

    if(good.length < 2) {
      throw "cannot set coordinates for VismoShape not enough good coordinates given (coordinates may contain non-number elements)" + coordinates.toString();
    }
    coordinates = good;
                            
    if(type == 'projected'){stored_c.projected = coordinates;this._calculateBounds(coordinates);return;}
    this.coordinates.normal = coordinates;
    var vml = this.vml;
    if(vml)vml.coordinatesHaveChanged();
    this.coordinates.projected= false;
    var i;
    for(i in this.coordinates_optimised){
      delete this.coordinates_optimised[i];
    }
    var j;
    for(j in this.coordinates.optimisedandprojected){
      delete this.coordinates.optimisedandprojected[j];
    }    
    this.grid = {}; //an enclosing grid
    
    if(vml) vml.path = false; //reset path so recalculation will occur
    var st = this.getShape();
    if(this._isArcBased(st)){
        this.setRadius(coordinates[2],coordinates[3]);
    }
    this._calculateBounds();
    VismoTimer.end("VismoShape.setCoordinates");
  }
  ,getCoordinates: function(type){
    VismoTimer.start("VismoShape.getCoordinates");
      if(!type){
          if(this.coordinates.projected){
              VismoTimer.end("VismoShape.getCoordinates");
              return this.coordinates.projected;
          }
          else {
            VismoTimer.end("VismoShape.getCoordinates");
            return this.coordinates.normal;
          }
      }
    if(type == 'normal') {
      VismoTimer.end("VismoShape.getCoordinates");
      return this.coordinates.normal;
    } 
    if(type == 'projected'){
      VismoTimer.end("VismoShape.getCoordinates");
      return this.coordinates.projected;
    }
    var resolution = this.currentResolution;
    if(this.coordinates.projected) {
      if(this.browser != 'ie' && resolution){
        var simplified = this._simplifyCoordinates(resolution,this.coordinates.projected);
        VismoTimer.end("VismoShape.getCoordinates");
        return simplified;
      }    
      VismoTimer.end("VismoShape.getCoordinates");
      return this.coordinates.projected;
    }
    else{
      if(this.browser != 'ie' && resolution){
        var opt=this.coordinates.optimised;
        if(!opt[resolution]) opt[resolution] =  this._simplifyCoordinates(resolution,this.coordinates.normal);
        VismoTimer.end("VismoShape.getCoordinates");
        return opt[resolution];
      }  
      VismoTimer.end("VismoShape.getCoordinates");
      return this.coordinates.normal;
    }
    
  }
  ,getProperties: function(){
      return this.properties;
  }
  ,getRenderMode: function(canvas){
    return VismoUtils.canvasSupport;
  }
  
  ,setProperty: function(name,value){
    if(name =='fill'){
      if(!value || typeof(value)!= 'string')value = "#ffffff";
    }
    
    this.properties[name] = value;
    //console.log("Reset",name,this);
    if(this.vml) {
      this.vml.nochange = false;
    }
    if(name == 'z-index'){ //organise a re-sort for the z-index property to kick in
      if(Vismo.store.Canvas[this._canvasref]){
        Vismo.store.Canvas[this._canvasref].needsSort = true;
      }
    }
    
  }
  ,getProperty: function(name){
    return this.properties[name];
  }

  ,_calculateBounds: function(coords){
    VismoTimer.start("VismoShapes._calculateBounds");
    var that = this;
    var st = this.getShape();
    var transform = this.getTransformation();
    
    if(this._isPath(st)){
      this.grid = {x1:0,x2:1,y1:0,y2:1,center:{x:0,y:0}};
      return;
    }
    else if(this._isPathBased(st)){
      if(!coords) coords = this.getCoordinates();
      var clen = coords.length;
      if(clen < 2) return;
      var x1 = coords[0];
      var y1 = coords[1];
      var x2 = coords[0];
      var y2 = coords[1];
      var lastX, lastY;
      var index = 0;
      lastX = coords[0];
      lastY = coords[1];
      for(var i=0; i < clen-1; i+=2){
        var xPos = coords[i]
        var yPos = coords[i+1]; //lat
        if(xPos < x1) x1 = xPos;
        if(yPos < y1) y1 = yPos;  
        if(xPos > x2) x2 = xPos;
        if(yPos > y2) y2 = yPos;
        lastX = xPos;
        lastY = yPos;
      }
      var width = (x2 - x1);
      var height = (y2 - y1);
      var cx = (x2 - x1) / 2 + x1;
      var cy = (y2 - y1) / 2 + y1;
      //recalculate based on scaling
      width *= transform.scale.x;
      height *= transform.scale.y;
      cx += transform.translate.x;
      cy += transform.translate.y;
      var halfw = width / 2;
      var halfh = height /2;
      x1 = cx - halfw;
      x2 = cx + halfw;
      y1 = cy - halfh;
      y2 = cy + halfh;
      this.grid = {x1:x1,x2:x2,y1:y1,y2:y2,center:{x:cx,y:cy},width:width,height:height};
    }
    else if(this._isArcBased(st)| this._isDomElement(st)){
        var coords = this.getCoordinates("normal").clone();
        var x = coords[0]; var y = coords[1]; 
        var dim = this.getDimensions();
        var center = {x: x,y:y};
        if(transform){
          if(transform.translate){
            var tran_x = transform.translate.x;
            var tran_y =  transform.translate.y;
  
            center.x += tran_x;
            center.y += tran_y;
          }
          if(transform.scale){
            dim.width *= transform.scale.x;
            dim.height *= transform.scale.y;
          }
        }
        var radiusw = dim.width / 2;
        var radiush = dim.height / 2;
        this.grid ={x1: x -radiusw ,x2: x + radiusw, y1: y - radiush, y2: y + radiush,center:center,width: dim.width,height:dim.height};  
    }
    VismoTimer.end("VismoShapes._calculateBounds"); 
  }
  ,getCanvas: function(){
      return this.vismoCanvas;
  }
  ,setRadius: function(rx,ry){
    if(!ry) ry = rx;
    this.setDimensions(rx*2,ry*2);
  }
  ,getRadius: function(){
    if(this.width) return this.width /2;
      else{
          var bb = this.getBoundingBox();
        return bb.width / 2;
    }
    
  }
  ,setDimensions: function(width,height){
    VismoTimer.start("VismoShapes.setDimensions");
    this.width = width;
    this.height = height;
    if(this.properties.shape=='circle'){
        for(var j in this.coordinates){
            var c = this.coordinates[j];
            if(c){
                c[2] = width/2;
            }
        }
    }
    if(this.vml) this.vml.path = false;
    this._calculateBounds();
    VismoTimer.end("VismoShapes.setDimensions");
  }
  ,getDimensions: function(){
    return {width: this.width, height: this.height};
  }
  
  ,_construct: function(properties, coordinates){
    VismoTimer.start("VismoShapes._construct");
    var shapetype =properties.shape; 
    if(!shapetype) shapetype = 'polygon';
    if(this._isPathBased(shapetype))
    {
      this.setCoordinates(coordinates);
    }
    else if(this._isArcBased(shapetype)){
      var radiusw,radiush;
      if(coordinates[2]) radiusw = coordinates[2];
      else radiusw = 2.5;

      if(coordinates[3]) radiush= coordinates[3];
      else radiush = radiusw;

      this.setDimensions(radiusw*2,radiush*2);
      this.setCoordinates([coordinates[0],coordinates[1],radiusw,radiush]);
    }
    else if(this._isDomElement(shapetype)){                 
            var w = jQuery(this.getProperty("element")).width(); 
            var h = jQuery(this.getProperty("element")).height(); 
            this.setDimensions(w,h);
            this.setCoordinates(coordinates);
    }
    else if(shapetype == 'image'){
      var src = this.getProperty("src");
      if(!src) throw "all images must carry a property src at minimum";
      var image = new Image();
      image.src= src;
      this.image = image;
      var vismoShape = this;
      var w = vismoShape.getProperty("width"); h=  vismoShape.getProperty("height");
      if(coordinates.length > 2){
        w = coordinates[2]; h = coordinates[3];
      }
      image.onload = function(){
        if(!w && !h){
          vismoShape.setDimensions(w,h);
          vismoShape.setCoordinates([coordinates[0],coordinates[1]]);
        }
        vismoShape.ready = true;
      };
      if(image.complete)vismoShape.ready = true;
    
      vismoShape.setDimensions(w,h);
      vismoShape.setCoordinates([coordinates[0],coordinates[1]]);  
      
    }
    else{
      console.log("don't know how to construct basic shape " + properties.shape);
    }    
    VismoTimer.end("VismoShapes._construct");  
    
  }  

  ,_applyProjection: function(projection,transformation){
    //console.log("apply projection to",this.properties.shape);
    VismoTimer.start("VismoShapes._applyProjection");
    var c = this.getCoordinates('normal');
  
    if(!projection || !projection.xy) return c;
  
    if(projection.init) projection.init();
    var newc = [];
    for(var i=0; i < c.length-1; i+=2){
      var moved = false;
      if(!VismoShapeUtils._isCoordinate(c[i])){
        i+= 1;
      }
      var x = parseFloat(c[i]);
      var y = parseFloat(c[i+1]);
      var newx,newy;
      var projectedCoordinate = projection.xy(c[i],c[i+1],transformation);
      if(projectedCoordinate.x && projectedCoordinate.y){
        newx= projectedCoordinate.x;
        newy= projectedCoordinate.y;
      
        if(projectedCoordinate.move){
          moved  =true;
        }
      
        cok = true;
        //check we haven't wrapped around world (For flat projections sss)
        if(!projection.nowrap){
          var diff;
          if(newx > x) diff = newx - x;
          if(x > newx) diff = x - newx;
          if(diff > 100) cok = false; //too extreme change
        }
      
        if(cok){
          if(VismoShapeUtils._isCoordinate(x) && VismoShapeUtils._isCoordinate(y)){
            if(moved){
              newc.push("M");
            }
            newc.push(newx);
            newc.push(newy);
          }

        }
      }  
    }  
    if(newc.length < 2) return;
    this.setCoordinates(newc,"projected");
    this._calculateBounds(newc);
    
    VismoTimer.end("VismoShapes._applyProjection");
    return newc;
  }


  
  ,optimise: function(canvas,transformation,projection,justcompute){
      
      VismoTimer.start("VismoShapes.optimise");
      var ocache = this._optimise_cache;
      var cid,cid2;
      if(transformation["cache"]){
        cid = transformation["cache"]["id1"];
        cid2 =transformation["cache"]["id2"];
      }      
      else{
        var scale = transformation.scale;
        var translation = transformation.translate;
        cid = [translation.x,",",translation.y].join("");
        cid2 = [scale.x,",",scale.y].join("");
      }

      
      if(this._scale.x > 1){
          var newx,newy;
          newx = this._scale.x  * transformation.scale.x;
          newy = this._scale.y  * transformation.scale.y;
          cid = newx + ","+newy;
      }
      if(!ocache[cid]) ocache[cid] = {};
      
        if(typeof(ocache[cid][cid2]) != "undefined"){
          return ocache[cid][cid2];
        }
      
      var shapetype = this.properties.shape;
      if(shapetype == "path") {
          ocache[cid][cid2] = true;
          VismoTimer.end("VismoShapes.optimise");
          return true;
    }
    if(transformation && transformation.scale) {
        this.currentResolution = Math.min(transformation.scale.x, transformation.scale.y);
    }
    
    
    if(shapetype != 'point' && shapetype != 'path' && shapetype !="domElement"){ //check if worth drawing        
      if(VismoOptimisations.vismoShapeIsTooSmall(this,transformation)) {
        if(!justcompute && this.vml)this.vml.clear();
        ocache[cid][cid2] = false;
        VismoTimer.end("VismoShapes.optimise");
        return false;  
      }  
    }
    
    if(!VismoOptimisations.vismoShapeIsInVisibleArea(this,canvas,transformation,projection)){
      if(!justcompute && this.vml)this.vml.clear();
      ocache[cid][cid2] = false;
      VismoTimer.end("VismoShapes.optimise");
      return false;  
    }
    ocache[cid][cid2] = true;
    VismoTimer.end("VismoShapes.optimise");
    return true;
  }
  ,optimise_ie: function(canvas,transformation,projection){  
      VismoTimer.start("VismoShape.optimise_ie");
      var ocache = this._optimise_cache;
      var cid = transformation["cache"]["id1"];
        if(typeof(ocache[cid]) != "undefined"){
          return ocache[cid];
        }
        VismoOptimisations.minradius = 6;
      var sh = this.properties.shape;
    if(sh == 'path' || sh == 'point') {
            ocache[cid] =true;
               return true;
        }
        
    if(VismoOptimisations.vismoShapeIsTooSmall(this,transformation)) {
        if(this.vml)this.vml.clear();
                VismoTimer.end("VismoShape.optimise_ie");
        ocache[cid] =false;
        return false;    
    }
        ocache[cid] =true;
        VismoTimer.end("VismoShape.optimise_ie");
    return true;
  }
  ,_simplifyCoordinates: function(scaleFactor,coordinates){// **
    VismoTimer.start("VismoShapes._simplifyCoordinates");
    if(this.getProperty("shape") == 'path') return coordinates;
    /*will use http://www.jarno.demon.nl/polygon.htm#ref2 */
    if(!coordinates) throw "give me some coordinates!";
    var originals =coordinates;
    var tolerance;
    var bb = this.getBoundingBox();
    
    var d;
    if(bb.width < bb.height) d = bb.width;
    else d = bb.height;
    tolerance = (d/4) / scaleFactor;
    
    coordinates = VismoOptimisations.packCoordinates(coordinates);
    coordinates = VismoOptimisations.douglasPeucker(coordinates,tolerance);
    coordinates = VismoOptimisations.unpackCoordinates(coordinates);  
    
    var diff = originals.length - coordinates.length;
    
    VismoTimer.end("VismoShapes._simplifyCoordinates");
    if(diff < 10) return originals;
    else 
    return coordinates;  
  }


};
var VismoCanvasRenderer = {
  renderShape: function(canvas,vismoShape){
    VismoTimer.start("VismoCanvasRenderer.renderShape");
    
    var ctx = vismoShape.ctx || canvas.getContext('2d');
    var properties =vismoShape.properties 
    var shapetype =properties.shape;
    var lw = properties["lineWidth"];
    var fill = properties['fill'];
    var stroke = properties["stroke"];
    if(lw){
      ctx.lineWidth = lw;
    }
    //ctx.save();           
    ctx.beginPath();
    if(shapetype == 'point' || shapetype =='circle'){
      this.renderPoint(ctx,vismoShape);
    }
    else if(shapetype =='image'){
      this.renderImage(ctx,vismoShape);
    }
    else if(shapetype == "path"){
      this.renderPath(ctx,vismoShape);
    }
    else{  
      this.renderPath(ctx,vismoShape,true);  
      ctx.closePath();       
    }
    VismoTimer.start("VismoCanvasRenderer.renderShape1");

    if(stroke){
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
    //if(shapetype != 'path') {
    
    if(fill){  
      ctx.fillStyle = fill;
      ctx.fill();
    }
    VismoTimer.end("VismoCanvasRenderer.renderShape1");
    //ctx.restore();            
    VismoTimer.end("VismoCanvasRenderer.renderShape");
  }
  ,renderPath: function(ctx,vismoShape,join){
    VismoTimer.start("VismoCanvasRenderer.renderPath");
    var move = true,quadraticCurve = false,bezierCurve = false;
    var c = vismoShape.getCoordinates();
    var t =vismoShape.getProperty("transformation");
    if(!t) t= {};
    //ctx.save(); //issue with this in safari..
    if(!t.translate)t.translate = {x:0,y:0};
    if(!t.scale) t.scale = {x:1,y:1};
        

    //ctx.scale(t.scale.x,t.scale.y);
    if(!t.translate.y) t.translate.y = 0;
    if(!t.translate.x) t.translate.x = 0;
    if(!t.scale.x) t.scale.x = 1;
    if(!t.scale.y) t.scale.y = 1;
        
    var bb = vismoShape.grid;
    if(bb.center){
        ctx.translate(bb.center.x-(bb.center.x*t.scale.x),bb.center.y-(bb.center.y*t.scale.y));
            ctx.scale(t.scale.x,t.scale.y);  
            ctx.translate(t.translate.x,t.translate.y);
        }
    var bb = vismoShape.grid;
    for(var i=0; i < c.length-1; i+=2){
            var isCoord =VismoShapeUtils._isCoordinate(c[i]);
      if(!isCoord){

        if(c[i] == "M"){
            move=true;
          }
          else if(c[i] == "q"){
              quadraticCurve = true;
          }
          else if(c[i] == "c"){
              bezierCurve = true;
          }
          i+=1;
      }
      var x = parseFloat(c[i]);
      var y = parseFloat(c[i+1]);  
      
      if(move){ 
        ctx.moveTo(x,y);
      
        move = false;
      }
      else if(quadraticCurve){
          var x2 = parseFloat(c[i+2]);
          var y2 = parseFloat(c[i+3]);

          i+= 2;
          ctx.quadraticCurveTo(x,y,x2,y2);
      }
      else if(bezierCurve){
          var x2 = parseFloat(c[i+2]);
          var y2 = parseFloat(c[i+3]);
                var x3 = parseFloat(c[i+4]);
                var y3 = parseFloat(c[i+5]);
          i+= 4;
          ctx.bezierCurveTo(x,y,x2,y2,x3,y3);          
      }
      else{
             
        ctx.lineTo(x,y);
      }      
        
        
    }
    VismoTimer.end("VismoCanvasRenderer.renderPath");
    //ctx.restore(); //issue with this in safari..
  }
  ,renderPoint: function(ctx,vismoShape){
    VismoTimer.start("VismoCanvasRenderer.renderPoint");
    var bb =vismoShape.getBoundingBox();
    var dim =vismoShape.getDimensions();
    var radiusx = dim.width / 2;
    var radiusy = dim.height/2;
    
    var transform = vismoShape.getTransformation();
    if(transform && transform.scale) radiusx*= transform.scale.x;
    var pt =vismoShape.properties.pointType;
    var c = vismoShape.getCoordinates();
    
    ctx.arc(c[0],c[1], radiusx, 0, Math.PI*2,true);
    VismoTimer.end("VismoCanvasRenderer.renderPoint");
  }
  ,renderImage: function(ctx,vismoShape){
    var c = vismoShape.getCoordinates();
    var bb = vismoShape.getBoundingBox();
    var draw = function(){
            if(vismoShape.ready)ctx.drawImage(vismoShape.image,bb.x1,bb.y1,bb.width,bb.height);
            else window.setTimeout(draw,100);
    };
                draw();

  }
};


var VismoTransformations= {
	clone: function(transformation){
	
		var t = {};
		t.translate = {x:0,y:0};
		t.scale = {x:1,y:1};

		if(transformation.translate && transformation.translate.x){
			t.translate.x = transformation.translate.x;
			t.translate.y = transformation.translate.y;
		}
		
		if(transformation.scale && transformation.scale.x){
			t.scale.x = transformation.scale.x;
			t.scale.y = transformation.scale.y;		
		}
		
		return t;
	}
	,applyTransformation: function(x,y,t){

		var res= {};
		res.x = x;
		res.y = y;



		if(t.translate){
			res.x +=  t.translate.x;
			res.y += t.translate.y;
		}
		if(t.scale){
			res.x *= t.scale.x;
			res.y *= t.scale.y;
		}

		if(t.origin){
			res.x += t.origin.x;
			res.y += t.origin.y;
		}
		return res;
		
	}
	,mergeTransformations: function(a,b){
		if(!b) return a;
		if(!a) return b;
		
		var result = {};
		var i;
		for(i in a){
			result[i] = a[i];
		}
		
		for(i in b){
			if(result[i]){
				var oldt = result[i];
				var newt = b[i];
				
				result[i].x = oldt.x + newt.x;
				result[i].y = oldt.y + newt.y;
			}
			else{
				result[i] = b[i];
			}
		}
		return result;
	}
	,undoTransformation: function(x,y,transformation){ 
	/*transforms a pixel position relative to the center of the visualisation into the corresponding x,y in the visualisation axis equivalent*/ 
		VismoTimer.start("VismoTransformations.undoTransformation");
		var pos = {};
		var t =transformation;
		var tr =t.translate;
		var s = t.scale;
		var o = t.origin;
		if(s ===false || o ===false || tr ===false) return false;
		
		if(x ===false || y ===false)return false;
		pos.x = x - o.x;
		pos.y = y -o.y;

		//pos.x -= x;
		//pos.y += y;
		
		if(pos.x !== 0)
			pos.x /= s.x;
		
		if(pos.y !== 0)
			pos.y /= s.y;
			
		pos.x -= tr.x;
		pos.y -= tr.y;	
		VismoTimer.end("VismoTransformations.undoTransformation");		
		return pos;	
	}
	,getXY: function(e,t){
		var pos =VismoClickingUtils.getMouseFromEvent(e);
		return this.undoTransformation(pos.x,pos.y,t);
	}
	,create: function(options){
	    var transformation= {};
	    var i;
	    for(i in options){
	        transformation[i] = options[i];
	    }
	    var s = transformation.scale;
	    var t = transformation.translate;
	    transformation["cache"] = {id1:[s.x,",",s.y].join(""),id2:[t.x,",",t.y].join("")};
	    
	    return transformation;
	    
	}
};var VismoGraph = function(properties){
    this._nodes = {};
    this._children = {};
    this._parents = {};
    this._orphans = {};
    this._spouses = {};

	if(properties.nodes){
    	for(var i=0; i < properties.nodes.length; i++){
    	    this.addNode(properties.nodes[i]);
    	}
	}
	if(properties.edges){
	    var edges = properties.edges;
	    for(var i=0; i < edges.length; i++){
	        var a = edges[i][0];
	        var b = edges[i][1]; 
    	    this.addEdge(a,b);
    	}
	}
};

VismoGraph.prototype = {
    eachEdge: function(node,f){
        var edges = this.getEdges(node.id);
        for(var i=0; i < edges.length; i++){
            f(edges[i]);
        }
    }
	
    ,eachNode: function(f){
        var nodes = this.getNodes();

        for(var i=0; i < nodes.length;i++){
     
                f(nodes[i]);
            
        }
    }
    ,getNode: function(id){
        return this._nodes[id];
    }
    ,depth: function(id,depthsofar){
       if(!depthsofar && depthsofar !== 0)depthsofar =0;
       var kids = this.getChildren(id);
       if(kids.length == 0) return depthsofar;
       
       var maxdepth = 0;
       for(var i=0; i < kids.length;i++){
           var depth = this.depth(kids[i],depthsofar+1)
           if(depth > maxdepth) maxdepth = depth;
       }
       return maxdepth;
    }
    /* a spouse shares the same children as another node*/
    ,isSpouse: function(id1,id2){
        if(id1 == id2) return false;
        var childrenX = this.getChildren(id1);
        var childrenY = this.getChildren(id2);
        var allchildren = childrenX.concat(childrenY);
        for(var i=0; i < allchildren.length; i++){
            // if the child also has y as a parent..
            var child = allchildren[0];
            if(this._parents[child].indexOf(id2) != -1 && this._parents[child].indexOf(id1) != -1) return true;
        }
        return false;
    }
    ,getSpouses: function(id){
        var n = this.getNodes();
        var spouses = [];
        for(var i=0; i < n.length;i++){
            
            if(this.isSpouse(id,n[i].id)){
                spouses.push(n[i].id);
            }
        }
        return spouses;
    }
    ,getNodes: function(){
        var nodes = [];
        for(var i in this._nodes){
            nodes.push(this._nodes[i]);
        }
        return nodes;
    }
    /* returns  a list of edges (parents and children) containing id [fromNode,toNode]*/
    ,getEdges: function(id){
        var c = this.getChildren(id);
        var p = this.getParents(id);
        
        var edges = [];
        var node = this.getNode(id);
        
        for(var i=0; i < c.length; i++){
            edges.push([node,this.getNode(c[i])]);
        }
        for(var i=0; i < p.length; i++){
            edges.push([this.getNode(p[i]),node]);
        }
        return edges;    
        
    }
    ,getChildren: function(id){
        if(typeof(id) != 'string'){
	        var done = {};
	        var allchildren = [];
	        for(var i=0; i < id.length;i++){
	            var parentid = id[i];
	            var children = this.getChildren(parentid);
	            for(var j=0; j < children.length;j++){
	                var childid = children[j];
	                if(!done[childid]){
	                    allchildren.push(childid);
	                    done[childid] = true;
	                }
	            }
	        }
	        return allchildren;
	        
	        
	    }
	    
        var children = this._children[id];

        if(!children){
            return [];
        }
        else {
            return children;
        }
    }
    ,isOrphan: function(id){
        if(!this._parents[id] || this._parents[id].length == 0){
            return true;
        }
        else{
            return false;
        }
    }
    ,getParents: function(id){
        var p = this._parents[id];

        if(!p){
            return [];
        }
        else {
            return p;
        }
    }
    ,getOrphans: function(){ 
        var orphans = [];
       var nodes = this.getNodes();
       for(var i=0; i < nodes.length; i++){
           var id = nodes[i].id;
           if(this.isOrphan(id)){
               orphans.push(id);
            }
        }
    
        return orphans;
    } 
    ,addNode: function(nodejson){
        var id = nodejson.id;
        if(!id) throw "error in addNode: node must have id to addNode to graph.";
        if(!nodejson.properties){
            nodejson.properties = {};
        }
        this._nodes[id] = nodejson;
        this._orphans[id] = true;
    }
    ,addEdge: function(a,b){
        //not working properly with new lines
        //console.log(a,"to",b);
        if(typeof(a) !="string"||typeof(b) != "string") return;
        a = a.replace(/\n/,"");
        b= b.replace(/\n/,"");
        if(a == b) return;
        if(!a || !b ||(a && a.length == 0) || (b && b.length==0)) {
        
            return;
        
        }
        /* cannot set a as a parent of b if b is a parent of a */
        if(this._parents[a] && this._parents[a].indexOf(b) > -1){
            //doens't work for tree algorithm
            //console.log("aahhahah cycle");
            return; //can't do this! this would create nasty loop
        }
        //console.log("ok");
        var p = this.getNode(a);
        var c = this.getNode(b);
        if(!p) this.addNode({id:a,properties:{name:a}});
        if(!c) this.addNode({id:b,properties:{name:b}});

        if(!this._children[a]) this._children[a] = [];
        if(!this._parents[b]) this._parents[b] = [];
        
        this._children[a].push(b);
        this._parents[b].push(a);
        
        if(!this._orphans[a])this._orphans[a] = true;
        this._orphans[b] = false;
        
    }
};

/* options 
algorithm: name of an algorithm defined in VismoGraphAlgorithms

*/
var VismoGraphRenderer = function(place,options){
    if(!options.nodeShape){
        options.nodeShape="point";
    }
    if(!options.lineColor){
        options.lineColor = "rgb(0,0,0)";
    }
    if(!options.defaultNodeColor){
        options.defaultNodeColor = "#ffffff";
    }
    if(!options.lineWidth){
        options.lineWidth = "2";
    }
    if(!options.lineType){
        options.lineType = 'normal';
    }
    if(options["algorithm"]){
        options.algorithm = VismoGraphAlgorithms[options["algorithm"]];
    }
    
    if(!options.algorithm){
        throw "GraphRenderer requires an option called algorithm which is a function. This will take two parameters graph and root and should set XPosition and YPosition on every node.";
    }

    if(!options.plotNode){
       options.plotNode = function(el,shape){
          jQuery(el).text(shape.properties.id);  
        };
    }
    if(!options.nodeWidth) options.nodeWidth= 5;
    if(!options.nodeHeight) options.nodeHeight = 5; 
    
    this.options = options;
    this._edgeShapeCoordinates = [];
    this._graph = options.graph;
    
    var canvasopts;
    if(!options.vismoCanvas) canvasopts = {};
    else canvasopts = options.vismoCanvas;
    
    if(!options.vismoController){
        canvasopts.vismoController = {};
    } 
    else{
        canvasopts.vismoController = options.vismoController;
    }
    var for_canvas = ["move","dbclick","mouseup","mousedown","pointsize","pointType","lineWidth"];
    var arg;
    for(arg in options){
        if(for_canvas.indexOf(arg) != -1) canvasopts[arg] =options[arg];
    }
    canvasopts.scaleXY = true;

    this._canvas = new VismoCanvas(place,canvasopts);
    this.options.canvas_width = this._canvas.width();
    this.options.canvas_height = this._canvas.height(); 
    if(options.root){
        this.compute(options.root,this.options); 
        
    }
    if(options.centerOn){
        this.centerOn(options.centerOn);
    }
     
};

VismoGraphRenderer.prototype = {
    algorithm: function(id){
        if(id){
            var newalg = VismoGraphAlgorithms[id];
            if(newalg){
                this.options.algorithm = newalg;
            }
            else{
                throw "algorithm "+ id + " does not exist!";
            }
            
        }
    }
    ,clear: function(){
        this._canvas.clear(true);
        this._edgeShapeCoordinates = [];
    }
    ,reset: function(){
        var nodes = this._graph.getNodes();
        for(var i=0; i < nodes.length;i++){
            var node = nodes[i];
            node.XPosition = false;
            node.YPosition = false;
        }
    }
    ,graph: function(){
        return this._graph;
    }
    ,compute: function(root){
         
         this.reset();
        
        if(!root) root = this.options.root;
        var graph = this._graph;
        if(this.options.root != root) this.clear();
        if(root)this.options.root = root;
        //console.log("aboute to compute",this.options);
        this.options.algorithm.compute(graph,this.options);
        //console.log("dome compute");
        this.plot(root);
        
        if(this._edgeShapeCoordinates.length > 0){
            var edge = new VismoShape({"z-index":"-1",shape:"path",stroke:this.options.lineColor,coordinates:this._edgeShapeCoordinates});
            this._canvas.add(edge);
        }
        this._canvas.render();

        var node = graph.getNode(root);
        var half_height = this._canvas.height() /2;
        //this._canvas.centerOn(node.XPosition,node.YPosition + half_height);
        //console.log("computed")
    }
    ,centerOn: function(id,animate){
        var node = this._graph.getNode(id);
        var finishAt = {x:-node.XPosition,y:-node.YPosition};
        this._canvas.centerOn(finishAt.x,finishAt.y,animate);
        
    }
    ,_plotted: {}
    ,plot: function(id){
        this._plot(id);
        var i;
        for(i in this._plotted){
            delete this._plotted[i];
        }
    }
    ,_plot: function(id){
        if(this._plotted[id]) {
            //console.log("cant plot",id);
            return false;
        }
        this._plotted[id] = true;
        
        var lineType = this.options.lineType;
        var node = this._graph.getNode(id);
        var y = -node.YPosition;
        var x = node.XPosition;
        var shape = this.plotNode(id,{x:x,y:y});
        
        var children = this._graph.getChildren(id);
        //console.log(id,"has children",children.length);
        for(var i=0; i < children.length; i++){
            //console.log(id,"plotting child",i);
            var parentpos = {x:x,y:y};
            var ch =children[i];
            var child_shape = this._plot(ch);
            if(!child_shape) child_shape = this._canvas.getShapeWithID(ch);
            if(child_shape){            
                var bb = child_shape.getBoundingBox();
                var childxy = {x:bb.center.x,y:bb.center.y};
                if(parentpos && childxy){
                 
                    if(shape.properties.hidden){
                        //do nowt
                    }
                    else if(lineType == 'quadratic'){
                        this._edgeShapeCoordinates=this._edgeShapeCoordinates.concat(["M",parentpos.x,parentpos.y,"q",childxy.x,parentpos.y,childxy.x,childxy.y]);                    
                    }
                    else if(lineType == 'normal'){
                        this._edgeShapeCoordinates=this._edgeShapeCoordinates.concat(["M",parentpos.x,parentpos.y,childxy.x,childxy.y]);                    
                    }
                    else if(lineType =='bezier'){
                        var hdistance = parentpos.x - childxy.x;
                        var vdistance = parentpos.y - childxy.y;
                        var b1,b2;
                        b2 = -vdistance/2;
                        b1 = -hdistance/10;
                   
                        if(hdistance == 0){
                            b1 = 0;
                            b2 = 0;
                        }
                    
                    
                        var coords = ["M",parentpos.x,parentpos.y,"c",parentpos.x +b1, parentpos.y, childxy.x, childxy.y-b2,childxy.x,childxy.y];
                        this._edgeShapeCoordinates=this._edgeShapeCoordinates.concat(coords);
                    }
                }   
            }
            
        }
        //console.log("done plotting");
        
        return shape;
    }
    
    ,plotNode: function(id,pos){
        var exists = this._canvas.getShapeWithID(id);
        var options = this.options;
        if(!exists){
            var st,coords;
            st= options.nodeShape;
            var hr = this.options.nodeWidth /2;
            var vr=this.options.nodeHeight /2;
            if(options.nodeShape != "point" && options.nodeShape != "circle"){
                coords = [pos.x-hr,pos.y-vr,pos.x+hr,pos.y-vr,pos.x+hr,pos.y+vr,pos.x-hr,pos.y+vr];
            }
            else{
                coords = [pos.x,pos.y,hr];
            }
            var node= this._graph.getNode(id);
            node.properties.shape = st;
            node.properties.staticSize = true;
            node.properties.coordinates = coords;
            node.properties.id = id;
            if(!node.properties.fill)node.properties.fill = this.options.defaultNodeColor;
            var shape= new VismoShape(node.properties);
            this._canvas.add(shape);   
            if(!node.properties.hidden)this.plotLabel(node,{x:pos.x,y:pos.y},shape);       
        }
        else{
            shape = exists;
        } 
       
        return shape;
        
    }

    ,plotLabel: function(node,pos,vismoShape){
        
        //if(!VismoOptimisations.inVisibleArea(this._canvas.getDomElement(),pos.x,pos.y,this._canvas.transformation)) return;
        
        var el = document.createElement("div");
        var props = node.properties;
        if(props.hover){
            jQuery(el).hover(function(e){this.innerHTML = props.hover;},function(e){this.innerHTML = props.label;});
           
        }
        
       
        if(typeof("node._depth") != 'undefined'){
            var fromroot = node._depth;
            if(fromroot < 0) fromroot = - fromroot;
            jQuery(el).addClass("fromRoot"+fromroot);
        }
        jQuery(el).hover(function(e){jQuery(this).addClass("hoverNode");},function(e){jQuery(this).removeClass("hoverNode");});
        
        if(this.options.plotNode){
            this.options.plotNode(el,vismoShape)
        }
        this._canvas.addLabel(el,pos.x,pos.y,vismoShape);
    }
 };var VismoVector = function(vismoShape,canvas,dimensions){
  VismoTimer.start("VismoVector.init");
  this._iemultiplier = 100; //since vml doesn't accept floats you have to define the precision of your points 100 means you can get float coordinates 0.01 and 0.04 but not 0.015 and 0.042 etc..
  this.vismoShape=  vismoShape;

  this.cache = {};
  this.maxResolution_id_x = 1;
  this._oldproperties = {};
  if(!dimensions)dimensions = {width:jQuery(canvas).width(),height:jQuery(canvas).height()};
  this.initShape(vismoShape,canvas,dimensions);
  vismoShape.vml = this;
  VismoTimer.end("VismoVector.init");    
};

VismoVector.prototype = {
  scrub: function(){
       VismoTimer.start("VismoVector.scrub");
       if(this.el){
      this.el.parentNode.removeChild(this.el);
      this.el = false;
      }
      VismoTimer.end("VismoVector.scrub");
  }
  ,initShape: function(vismoShape,canvas,dimensions){
      VismoTimer.start("VismoVector.initShape");
      this.coordinatesHaveChanged();
      this.el = false;
      var isVML;
      var shapetype =vismoShape.properties.shape;       
        this.initialshapetype= shapetype;
        
    if(shapetype == 'point' || shapetype == 'circle'){
        this._initArc(vismoShape,canvas);
        isVML = false;
      }
      else if(shapetype == 'image'){
        this._initImage(vismoShape,canvas);
      }
      else if(shapetype == 'domElement'){
              //this.haveAppended = true;
              this.el = vismoShape.getProperty("element");
              this.el.style.position = "absolute";
              
         
              
              return;
      }
      else{
        this._initPoly(vismoShape,canvas,dimensions);
        isVML = true;
      }
      var el = this.el;
      if(isVML && canvas){
          var w,h;
          if(!canvas){
              throw " i need a canvas to do my magic!";
          }
          if(canvas.width){
              w= canvas.width;
          } 
          else{
              w = jQuery(canvas).width();
              canvas.width = w;
          }
          if(canvas.height){
              h= canvas.height;
          } 
          else{
              h = jQuery(canvas).height();
              canvas.height= h;
          }
          
          

              el.coordsize = this._getCoordSize(w,h);
      }
            if(this.vismoShape && el){
                //this.el.vismoShape = this.vismoShape;
              var nclass= "vismoShape";      
              if(shapetype == 'path'){ nclass= "vismoShapePath";}
              el.setAttribute("class", nclass);
              this.style();
      }
      var that= this;
      //jQuery(window).bind("unload", function(){that.el= null;});
     VismoTimer.end("VismoVector.initShape");
  }
  ,_getCoordSize: function(w,h){
    var m =this._iemultiplier;
    var xspace = parseInt(w);
    xspace *=m;
    var yspace =parseInt(h);
    yspace *= m;
    var cs = [xspace,",",yspace].join("");
    
    return cs;
  }
  ,_initImage: function(vismoShape,canvas){

    var that = this;
    var dim = vismoShape.getDimensions();
    var setup = function(){
      var shape = document.createElement("img");
      
      that.el = shape;
      shape.src = vismoShape.getProperty("src");  
      
      jQuery(shape).css({"height": dim.height, "width": dim.width,"position":"absolute","z-index":4});    

    };

    var image = new Image();
    image.src = vismoShape.getProperty("src");
    image.onload = function(e){
      setup();
    };
    if(image.complete){
      setup();
    }
    
  }
  ,_initArc: function(vismoShape,canvas){
    var shape = document.createElement("vismoShapeVml_:arc");
    shape.startAngle = 0;
    shape.endAngle = 360;
    var bb = vismoShape.getBoundingBox();
    this.el = shape;  
    var that = this;
    jQuery(window).unload(function(){that.el = null;})
    var diameterx = bb.width;
    var radiusx = bb.width/ 2;
    var diametery =  bb.height;
    var radiusy= bb.height/  2;
    
    jQuery(shape).css({"height": diametery, left:bb.center.x-radiusx, top: bb.center.y-radiusy,"width":diametery,"position":"absolute","z-index":4});      
  }
  ,_initPoly: function(vismoShape,canvas,dimensions){
    VismoTimer.start("VismoVector._initPoly");
    var shape = document.createElement("vismoShapeVml_:shape");
    var prop = vismoShape.properties;
    //shape.id = ["_",prop.id].join("");
    shape.name=prop.name;
    var w =dimensions.width;// css.width;
    var h = dimensions.height;//css.height;

    var css = ["height:",h,"px; width:",w,"px; position:absolute;z-index:4;"].join("")
    shape.style.cssText = css;

    //jQuery(this.el).css({"height": h,"width": w,"position":"absolute","z-index":4});
    
    var that = this;
    this.el = shape;
    
    jQuery(window).unload(function(){that.el = null;})
    VismoTimer.end("VismoVector._initPoly");
  }
  ,getVMLElement: function(){
    return this.el;
  }
  ,_createvmlpathstring: function(transformation,projection){ //mr bottleneck
    
    var multiplier = this._iemultiplier;
    VismoTimer.start("VismoVector.createvmlpathstring");
    var vml = this.el;
    cindex = "1,1";
    var cache = this.cache;
    if(!cache[cindex]){ this.cache[cindex] = {};}
    var vshape = this.vismoShape;
    var vprop = vshape.properties;
    if(!cache[cindex]["pathstring"]){
      var path;
      var buffer = [];
      var c =vshape.getCoordinates("normal");
      if(projection){
        c = vshape._applyProjection(projection,transformation);
      }
      var clen = c.length;
      if(clen < 2) return;
      var x,y;
      var startAtIndex = 0;
      if(vshape.isCommand(c[0])){
          startAtIndex = 1;
      }
      x = c[startAtIndex];
      y =c[startAtIndex+1];
      x = Math.round(x * multiplier);
      y = Math.round(y* multiplier);
      buffer.push(["M",x,",",y].join(""))
      var lineTo = false,quadraticCurveTo = false,bezierCurveTo = false;
      for(var i =startAtIndex+2; i < clen; i+=2){
        var cval = c[i];
        if(vshape.isCommand(cval)){
          switch(cval){
            case 'M':
              buffer.push(" M");
              lineTo = false;
              i+=1;
              break;
            case 'z':
              buffer.push(" XE");
              break;
            case 'q':
              quadraticCurveTo = true;
              i += 1;
              break;
            case 'c':
              bezierCurveTo = true;
              i+=1;
              break;
          }
        }
        if(lineTo){
          buffer.push(" ");
        }
        else{
          buffer.push(" L");
        }
        var x =Math.round(c[i] * multiplier);
        var y =Math.round(c[i+1] * multiplier);      
        if(quadraticCurveTo){
            var x2 =parseInt(c[i+2] * multiplier);
            var y2 =parseInt(c[i+3] * multiplier);
            buffer.push([" c ",x,",",y,",",x2,",",y2,",",x2,",",y2,""].join(""));
            i += 2;
            quadraticCurveTo = false;
        }
        else if(bezierCurveTo){
            var x2 =parseInt(c[i+2] * multiplier);
            var y2 =parseInt(c[i+3] * multiplier);
            var x3 = parseInt(c[i+4] * multiplier);
            var y3 = parseInt(c[i+5] * multiplier);
            buffer.push([" c ",x,",",y,",",x2,",",y2,",",x3,",",y3,""].join(""));
            i += 4;
            bezierCurveTo = false;
        }
        else{
            buffer.push([x,",",y].join(""));
        }
      }
        
      if(vprop.shape != "path"){buffer.push(" XE");}
      this.cache[cindex]["pathstring"] = buffer.join("");
    }
    VismoTimer.end("VismoVector.createvmlpathstring");
    return cache[cindex]["pathstring"];
  }

  ,transformDomElement: function(transformation,projection){
    VismoTimer.start("VismoVector.transformDomElement");
    /*var o = transformation.origin, t = transformation.translate,s = transformation.scale;
    */
    var shape = this.vismoShape;
    var el = this.el;
    var top,left,width,height;
    var bb = shape.getBoundingBox();
    dx = bb.x1;
    dy = bb.y1;
    jQuery(this.el).css({left:dx,top:dy});
    VismoTimer.end("VismoVector.transformDomElement");
  }
  
  ,coordinatesHaveChanged: function(){
      this.coordinatesChanged = true;
  
  }
  
  ,_cacheStyle: function(t,s,o){
    VismoTimer.start("VismoVector._cacheStyle");
    var vml = this.el;
    if(!this.initialStyle) { //remember original placement
      var vstyle = vml.style;
      var initTop = parseInt(vstyle.top);
      if(!initTop) initTop = 0;
      var initLeft = parseInt(vstyle.left);
      if(!initLeft) initLeft = 0;
      var w =parseInt(vstyle.width);
      var h = parseInt(vstyle.height)
      this.initialStyle = {width: w, height: h};
    }
    var initialStyle= this.initialStyle;
    var newwidth = initialStyle.width * s.x;
    var newheight = initialStyle.height * s.y;   
    VismoTimer.end("VismoVector._cacheStyle");
    return { width:[newwidth,"px"].join(""),height:[newheight,"px"].join("")};
  }
  ,_cssTransform: function(transformation,projection){    
    VismoTimer.start("VismoVector._cssTransform");
    var vml = this.el;
    var vshape = this.vismoShape;
    var st = this.vismoShapeProperties.shape;  
    
    if(vshape._isArcBased(st) || vshape._isDomElement(st)){
      this.transformDomElement(transformation,projection);
      VismoTimer.end("VismoVector._cssTransform");
      return;
    }
    if(!transformation) return;
    var ckey_1, ckey_2;
    if(transformation.cache){
        ckey_1 = transformation.cache.id1;
        ckey_2 = transformation.cache.id2;
    }
    else{
        ckey_1 = "1,1";
        ckey_2 = "0,0";
    }
    if(!this.cache[ckey_1]) this.cache[ckey_1] = {};
    var s =  transformation.scale;
    if(!this.cache[ckey_1][ckey_2]){
      var o = transformation.origin, t = transformation.translate;
      this.cache[ckey_1][ckey_2] = this._cacheStyle(t,s,o);
    }
    VismoTimer.end("VismoVector._cssTransform");
  }
  ,clear: function(){
      VismoTimer.start("VismoVector.clear");
      var el = this.el;
      try{
        if(el)jQuery(el).css({display:"none"});
      }
      catch(e){};
      VismoTimer.end("VismoVector.clear");
  }
  ,render: function(canvas,transformation,projection){
      VismoTimer.start("VismoVector.render");
        var that = this;
        var shape = this.el;
        this.vismoShapeProperties = this.vismoShape.properties;
        if(!shape){ //try again later
                return;
        }
        if(!this.haveAppended){ //append element to dom
        shape._vismoClickingID = this.vismoShapeProperties.id;
    }
  
    if(this.coordinatesChanged) {
      this._cssTransform(transformation,projection);          
      shape.path = this._createvmlpathstring(transformation,projection);//causes slow down..    
      this.coordinatesChanged = false;
    }
    var shtype= this.vismoShapeProperties.shape;
    if(this.initialshapetype != shtype){ //shape type has changed force restart
       this.scrub();
       this.initShape(this.vismoShape,canvas);
       this.haveAppended = false;
    }
    if(shtype!="domElement")shape.style.display = "";
    if(!this.haveAppended){ //append element to dom
      if(transformation)this._cssTransform(transformation,projection);
      jQuery(canvas).append(shape);
      if(shtype == 'domElement'){
        var vismoShape = this.vismoShape;
        var c = vismoShape.getCoordinates();
        var rw = jQuery(el).width()/2;
        var rh = jQuery(el).height()/2;

        jQuery(el).css({position:"absolute",left:c[0],top:c[1]-rh});                   
      }
      this.haveAppended = true;
    }
    this.style();
    VismoTimer.end("VismoVector.render");
  }
  ,_styleStroke: function(shape,vp){
    VismoTimer.start("VismoVector._styleStroke");
    if(vp.lineWidth) {
      shape.strokeweight =[vp.lineWidth,"em"].join("");
    }
    else {
      shape.strokeweight = "1em";
    }  
    var strokergba = vp.stroke;
    if(strokergba == this._lastStroke) return;
    if(!shape.stroked)shape.stroked = "t";

    if(strokergba.indexOf("#") == 0 || strokergba.indexOf("rgb(") == 0){
      shape.strokecolor = strokergba;
    }
    else{
      if(!this.vmlstroke){
        var vmlstroke =document.createElement("vismoShapeVml_:stroke");
        shape.appendChild(vmlstroke);
        this.vmlstroke = vmlstroke; 
      }      
      var vmlstroke = this.vmlstroke;
      if(strokergba){
        var stroke;
        if(strokergba.indexOf("rgba") != -1 &&strokergba.match(/rgba\([0-9]*,[0-9]*,[0-9]*,(.*)\)/)){
          var match =strokergba.match(/(rgb)a(\([0-9]*,[0-9]*,[0-9]*),(.*)\)/);
          if(match[3]){
            stroke = match[1] + match[2] +")";
            vmlstroke.opacity = match[3];
          }
        }
        else{
          stroke = strokergba;
        }
        vmlstroke.color = stroke;
      }
      else{
        vmlstroke.color = "rgb(0,0,0)";
      }
    }
    this._lastStroke = strokergba;
    VismoTimer.end("VismoVector._styleStroke");
  }
  ,_styleFill: function(shape,vp){
    VismoTimer.start("VismoVector._styleFill");
    var shapetype = vp.shape;
    if(!vp.fill || shapetype == 'path'){
      shape.filled = "f";
      VismoTimer.end("VismoVector.style");
      return;
    } 
    var fill = vp["fill"];
    shape.filled = "t";
    if(fill.indexOf("#") == 0 || fill.indexOf("rgb(") == 0){
      shape.fillcolor = vp.fill;  
    }
    else{
      if(!this.vmlfill && shape){
        var vmlfill =document.createElement("vismoShapeVml_:fill");
        shape.appendChild(vmlfill); 
        this.vmlfill = vmlfill;
        var that = this;
        jQuery(window).unload(function(){that.vmlfill = null;})
      } 
      var vmlfill  = this.vmlfill; 
      if(fill.indexOf("rgba") != -1 &&fill.match(/rgba\([0-9]*,[0-9]*,[0-9]*,(.*)\)/)){
        var match =fill.match(/(rgb)a(\([0-9]*,[0-9]*,[0-9]*),(.*)\)/);
        if(match[3]){
          fill = match[1] + match[2] +")";
          vmlfill.opacity = match[3];
        }
      }
      vmlfill.color = fill;
    }
    VismoTimer.end("VismoVector._styleFill");
  }
  ,style: function(){
    VismoTimer.start("VismoVector.style");
    var shape = this.el;
    var vp = this.vismoShape.properties;
    if(vp.hidden){
        jQuery(shape).css({display:"none"});
    }
    if(this.nochange){
      VismoTimer.end("VismoVector.style");
      return;
    }
    this.nochange = true; 
    var shapetype = vp.shape;
    var shape_style = shape.style;
    if(shape_style.display == 'none') shape_style.display =""
    if(vp["z-index"]){
        shape_style.zIndex = vp["z-index"];
    }
    this._styleStroke(shape,vp)     
    this._styleFill(shape,vp)
    this._oldproperties = VismoUtils.clone(vp);
    this.nochange = true;
    VismoTimer.end("VismoVector.style");
  }
};


var VismoTimer = {
    startsAt:{},
    timed: {},
    timelast: {},
    clear: function(){
     
     var i;
     for(i in this.timed){
         this.timed[i] = 0;
     }   
    },
    on: function(){
      VismoTimer.start =function(id){
          if(!this.timed[id]) this.timed[id] = 0;
          this.startsAt[id] = new Date();
      }
      VismoTimer.end= function(id){
          var d = new Date();
          this.timed[id] += (d-this.startsAt[id]);
          
      }
    }
    ,start: function(){}
    ,end: function(){}
    ,summarise: function(selector){
        var text ="";
        for(i in this.timed){
          var diffstr = "";
          if(VismoTimer.timelast[i]){
            var diff = this.timed[i] - this.timelast[i];
            diffstr = " (+ n"+diff+")";   
          }
          text += i +": " + this.timed[i].toString() +diffstr+"\n";
          VismoTimer.timelast[i]= VismoTimer.timed[i];
        }
        if(selector)jQuery(selector).html(text);
        else return text;
    }
    ,blankf: function(){}
};
