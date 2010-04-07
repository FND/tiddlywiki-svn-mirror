
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
    var lw = this.properties.lineWidth;
    if(projection) {this._applyProjection(projection,transformation);}
    var mode = this.getRenderMode(canvas);
    if(VismoUtils.canvasSupport){
      this.render_canvas(canvas,transformation,projection,optimisations);   
    }
    else{
      this.render_ie(canvas,transformation,projection,optimisations, unused,dimensions);  
    }
    this.properties.lineWidth = lw;
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
    this.width = width;
    this.height = height;
    if(this.properties.shape=='circle'){
        for(var j in this.coordinates){
            var c = this.coordinates[j];
            if(c){
                c[2] = width/2;
            }
        }
        //console.log(this);
    }
    else{
        
    }
    if(this.vml) this.vml.path = false;
    
    this._calculateBounds();
      
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