module("VISMO: VismoVector");
test("_createvmlpathstring",function(){
  var s=  new VismoShape({coordinates:[3,3,3,130,120,110,320,30]});
  var c = config.extensions.VismoMocks.div();
  var vector = new VismoVector(s,c);
  var path = vector._createvmlpathstring({});
  same(vector._iemultiplier,100,"ie multiplier assumed to be 100 to allow us to deal with floats");
  same(path,"M300,300 L300,13000 L12000,11000 L32000,3000 XE")
});

test("shapehasfillpropertychanged", function() {
         var originalFill = "rgb(255,0,0)";
             var s=  new VismoShape({coordinates:[0,0,0,100,100,100,100,0],fill:originalFill});
             var c = config.extensions.VismoMocks.div();
             var vector = new VismoVector(s,c);
             vector.render(c);
             
             var actualFill = vector.el.fillcolor;
            
            //setup second test
             var secondfill = "rgb(0,255,0)";       
             //console.log("xxx");      
             vector.vismoShape.setProperty("fill",secondfill);
             //run second test
             vector.render(c);
           
             var actualFill2 = vector.el.fillcolor;
             
             //check results
             same([actualFill,actualFill2],[originalFill,secondfill],"changing fill property on shape is propagated to vector");
});
test("changepropertyhidden", function(){
         var s = new VismoShape({coordinates: [10,10,20,10,20,30],shape:"polygon",hidden:true});
         var d = config.extensions.VismoMocks.div();
         var v = config.extensions.VismoMocks.vector(s,d);
         v.render(d,config.extensions.VismoMocks.transformation());
          var display1 = v.getVMLElement().style.display;
          
          v.vismoShape.setProperty("hidden",false);
          v.render(d);
          var display2 = v.getVMLElement().style.display;
         same([display1,display2],["none",""],"property hidden propogates to dom element");
});
test("moveCircle", function(){
            var s = new VismoShape({coordinates: [10,20,52],shape:"circle"});
            var d = config.extensions.VismoMocks.div();
            var v = config.extensions.VismoMocks.vector(s,d);
            var t = config.extensions.VismoMocks.transformation();
            v.render(d,t);
            var el1 = v.getVMLElement();
            var top1 = el1.style.top;
            var left1 = el1.style.left;
            
            s.moveTo(3,300);
            v.render(d,t);
            var el2 = v.getVMLElement();
            var top2 = el2.style.top;
            var left2=el2.style.left;
            
            same([top1,left1,left2,top2],["-32px","-42px","-49px","248px"],"correct top and left positions");
});
     
test("movePolygon", function(){
            var s = new VismoShape({coordinates: [10,10,20,10,20,30],shape:"polygon"});
            var d = config.extensions.VismoMocks.div();
            var v = config.extensions.VismoMocks.vector(s,d);
            var t = config.extensions.VismoMocks.transformation();
            v.render(d,t);
            var el1 = v.getVMLElement();
            var top1 = el1.style.top;
            var left1 = el1.style.left;
            
            s.moveTo(20,100);
            same(v.coordinatesChanged,true,"coordinates changed flag was set correctly")
            v.render(d,t);
            /*
            //this could make some performance improvements
            var el2 = v.getVMLElement();
            var top2 = el2.style.top;
            var left2=el2.style.left;
            
            same([top1,left1,left2,top2],["","","20px","100px"], " the new location of the shape has been picked up by the vector on the next render");
            */ 
});
     