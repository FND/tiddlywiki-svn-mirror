var VismoVector = function(vismoShape,canvas,dimensions){
  
  VismoTimer.start("VismoVector.init");
  this._iemultiplier = 100; //since vml doesn't accept floats you have to define the precision of your points 100 means you can get float coordinates 0.01 and 0.04 but not 0.015 and 0.042 etc..
  this.vismoShape=  vismoShape;

  this.cache = {};
  this.maxResolution_id_x = 1;
  this._oldproperties = {};
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
