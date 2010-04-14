module("VISMO VismoCanvas");
test("getMemory",function(){
  var shapes =[new VismoShape({coordinates:[50,50,20],shape:"circle",id:"circle","z-index":"3"}),new VismoShape({coordinates:[23,12,20],shape:"circle",id:"circle","z-index":"3"})];
  var cc = config.extensions.VismoMocks.canvas({shapes:shapes});
  var cshapes = cc.getMemory();
  same(cshapes.length,2,"testing shape property in options passed to vismoCanvas");
});

test("width and height",function(){
	var cc = config.extensions.VismoMocks.canvas({pointsize:10},{width:130,height:180});
	same(cc.width(),130);
	same(cc.height(),180);
})

test("point size as you zoom in",function(){
  var cc = config.extensions.VismoMocks.canvas();
  var shape = new VismoShape({coordinates:[50,50,20],id:"x",shape:"circle"});
  var tran = {translate:{x:0,y:0},scale:{x:1,y:1}};
  cc.setTransformation(tran);
  
  //same(cc.getShapeWithID("x").width(),20)
  
})
test("getPointsGridRef",function(){
             var cc = config.extensions.VismoMocks.canvas({pointsize:10},{width:100,height:100});
             cc.setTransformation({translate:{x:0,y:0},scale:{x:1,y:1}});
             same(cc.width(),100,"checking width");
             console.log("ok..");
             same([cc.topLeftGrid.x,cc.topLeftGrid.y] ,[-50,-50],"Checking topLeftGrid attribute set")
             var shape,actual;
             //-50|{1}-40|{2}-30|{3}-20|{4}-10|{5}00|{6}10|{7}20|{8}30|{9}40|{10}50|
             shape = new VismoShape({coordinates:[-50,-49],shape:"point"});
              
             actual = cc.getGridReference(shape);
             same(actual,[false,1],"lookup grid reference very top left");             
             shape = new VismoShape({coordinates:[50,50],shape:"point"});
             actual = cc.getGridReference(shape);
             same(actual,[10,10],"lookup grid reference very bottom right");
             
            shape = new VismoShape({coordinates:[0,50],shape:"point"});
            actual = cc.getGridReference(shape);
            same(actual,[5,10],"middle far right");
            
            shape = new VismoShape({coordinates:[-22,-26],shape:"point"});
            actual = cc.getGridReference(shape);
            same(actual,[3,3],"lookup grid reference above left of axis");
             
            shape = new VismoShape({coordinates:[10,10],shape:"point"});
            actual = cc.getGridReference(shape);
            same(actual,[6,6],"lookup grid reference above right axis");
             
            shape = new VismoShape({coordinates:[200,10],shape:"point"});
            actual = cc.getGridReference(shape);
            same(actual,[false,6],"lookup grid reference out of range");
            
            cc.setTransformation({translate:{x:300,y:100},scale:{x:1,y:1}});
            /*
             the top left corner normally -50,-50 becomes -50-300,-50-100 = -350,-150 (undoing transformation to see what it is equivalent to)
            */
            
            shape = new VismoShape({coordinates:[-349,-149],shape:"point"});
            actual = cc.getGridReference(shape);
            same(actual,[1,1],"testing translated grid");
            
        
            shape = new VismoShape({coordinates:[350,-150],shape:"point"});
            actual = cc.getGridReference(shape);
            same(actual,[false,false],"testing it is indeed outside the translated grid");
            
            cc.setTransformation({translate:{x:0,y:0},scale:{x:2,y:2}});
             /*
             The center is still 0,0 however having zoomed in the width/height is now 50
             so the top left corner is -25,-25 and top right corner 25,-25
             grid shrinks as well to cover 5px each time
            */
            shape = new VismoShape({coordinates:[-10,-21],shape:"point"});
            actual = cc.getGridReference(shape);
            
            same(actual,[3,1],"testing scaled grid");
            
            
             cc.setTransformation({translate:{x:10,y:5},scale:{x:2,y:2}});
            /*
              -35,-30 is new top left (-25 - 10)
              -35|(1)-30|(2)-25|(3)-20|(4)-15|(5)-10|(6)-5|(7)0|(8)5|(9)10|(10)15|
            */
            
              shape = new VismoShape({coordinates:[-34,-23],shape:"point"});
              actual = cc.getGridReference(shape);
              same(actual,[1,2],"testing scaled and translated grid");
              
              
              shape = new VismoShape({coordinates:[4,8],shape:"point"});
              actual = cc.getGridReference(shape);
              same(actual,[8,8],"testing scaled and translated grid");

              shape = new VismoShape({coordinates:[9,17],shape:"point"});
              actual = cc.getGridReference(shape);
              same(actual,[9,10],"testing scaled and translated grid");                
});
test("MarkOnGrid",function(){
    var cc = config.extensions.VismoMocks.canvas({pointsize:10},{width:100,height:100});
    cc.markGrid([1,5]);
    cc.markGrid([9,4]);
    
    same(cc.isMarkedGrid([9,4]),true," now marked");
    same(cc.isMarkedGrid([2,6]),false," not marked");
    
    cc.cleanGrid();
    same(cc.isMarkedGrid([9,4]),false," no longer marked");
    
});

test("_inPoly",function(){
             var poly = new VismoShape({coordinates:[0,0,100,0,100,100,0,100],shape:"polygon",id:"big"});
             var cc = config.extensions.VismoMocks.canvas();
             var val = cc._inPoly(20,20,poly);
             same(val,true,"able to detect in polygon");
});
test("_inPolyZoomedIn", function(){
          var poly = new VismoShape({coordinates:[0,0,100,0,100,100,0,100],shape:"polygon",id:"big"});
            
              var cc = config.extensions.VismoMocks.canvas({shapes:[poly],vismoController:{}});
              cc.vismoController.zoom(16,16);
             
             var val = cc._inPoly(60,69,poly);

             same(val,true,"in poly");
        });
test("_inCircle", function(){
            var cc = config.extensions.VismoMocks.canvas();
            var val = cc._inCircle(60,69,new VismoShape({coordinates:[50,50,20],shape:"circle"}));
            //radius =10;
            same(val,false,"not in circle");
            
        });
test("_inCircleZoomedIn", function(){
                var circle = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"circle","z-index":"3"});
                
                  var cc = config.extensions.VismoMocks.canvas({shapes:[circle],vismoController:{}});
                  cc.vismoController.zoom(16,16);
                  var t= cc.getTransformation();
                 var val = cc._inCircle(52,52,circle);

                 same(val,true,"in circle yes");
        });
test("_inCircle_Point", function(){
            
               var point= new VismoShape({coordinates:[5,5],shape:"point",id:"jon","z-index":"3"});
                var cc = config.extensions.VismoMocks.canvas({pointsize:3,shapes:[point],vismoController:{}});
                var t =cc.getShapeWithID("jon");
              
               var val = cc._inCircle(7,7,t); //circumference ends at 6.5,6.5
       
                 var val2 = cc._inCircle(6,6,t);
                 var bb = t.getBoundingBox();
                  var d= t.getDimensions();
            
                 same([bb.width,bb.height],[3,3],"dimensions correct in bounding box");
                 same(bb.x1,3.5,"smallest x value as expected");
                 same([d.width,d.height],[3,3],"dimensions correct")
                 same([val,val2],[false,true],"results of getBoundingBox as expected");
        });
test("_inCircle_Point2", function(){
               var point= new VismoShape({coordinates:[100,100],shape:"point",id:"testpoint","z-index":"3"});
                var cc = config.extensions.VismoMocks.canvas({pointsize:2,shapes:[point],vismoController:{}});
                var spoint =cc.getShapeWithID("testpoint")
                var val = cc._inCircle(103,103,spoint);
                var bb = spoint.getBoundingBox();
                same(bb.width,2,"bounding box width correct");
                same(val,false," and not in bounding box");
        });
        
test("_inCircle2", function(){
               var cc = config.extensions.VismoMocks.canvas();
                var val = cc._inCircle(100,100,new VismoShape({coordinates:[50,50,20],shape:"circle"}));
                same(val,false,"not in circle");
        });
        test("getShapeAtPosition",  function(){
             var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small","z-index":"3"});
             var bigshape = new VismoShape({coordinates:[50,50,100],shape:"circle",id:"big","z-index":"1"});
            
              var cc = config.extensions.VismoMocks.canvas({shapes:[smallshape,bigshape]});
             var val = cc.getShapeAtPosition(60,59);

             same(val.getProperty("id"),"small","correct shape at position found");
                
        });
        test("getShapeAtPosition_unclickableproperty",  function(){
             var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small",unclickable:true,"z-index":"3"});
             var bigshape = new VismoShape({coordinates:[50,50,100],shape:"circle",id:"big","z-index":"1"});
            
              var cc = config.extensions.VismoMocks.canvas({shapes:[smallshape,bigshape]});
             var val = cc.getShapeAtPosition(60,69);

             same(val.getProperty("id"),"big","shapes with unclickable property are not returns in getShapeAtPosition");
                
        });
        test("getShapeAtPositionTriangle", function(){
            var tri = new VismoShape({id:"tri",coordinates:[0,0,200,0,200,200], shape:"polygon"});
            var cc = config.extensions.VismoMocks.canvas({shapes:[tri]});
             var val = cc.getShapeAtPosition(20,190);
             var val2 = cc.getShapeAtPosition(199,190);
             same(val,false,"didn't find a shape");
             same(val2.getProperty("id"),"tri","found the right triangle shape");
        });
        test("getShapeAtPositionZoomedIn",  function(){
             var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small","z-index":"3"});
             var bigshape = new VismoShape({coordinates:[50,50,100],shape:"circle",id:"big","z-index":"1"});
            
              var cc = config.extensions.VismoMocks.canvas({shapes:[smallshape,bigshape],vismoController:{}});
              cc.vismoController.zoom(16,16)
        
             var val = cc.getShapeAtPosition(60,59);
             var bb = smallshape.getBoundingBox();
             same(val.getProperty("id"),"small","zoomed in, clicked and found the right shape");
                
        });
        
        test("getShapeAtPosition2", function(){
            //big above small
             var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small","z-index":"1"});
             var bigshape = new VismoShape({coordinates:[50,50,100],shape:"circle",id:"big","z-index":"3"});
            
              var cc = config.extensions.VismoMocks.canvas({shapes:[smallshape,bigshape]});
             var val = cc.getShapeAtPosition(30,39);

             same(val.getProperty("id"),"big","found the right shape");          
        });
        
        test("getShapeAtPosition3",  function(){
            //big above small
             var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small","z-index":"1"});
             var bigshape = new VismoShape({coordinates:[50,50,100],shape:"circle",id:"big"});
            
              var cc = config.extensions.VismoMocks.canvas({shapes:[smallshape,bigshape]});
             var val = cc.getShapeAtPosition(60,59);

             same(val.getProperty("id"),"small","found the right shape");          
        });
        test("getShapeAtPositionCircleVsPoly",  function(){
            //big above small
             var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small","z-index":"1"});
             var bigshape = new VismoShape({coordinates:[0,0,100,0,100,100,0,100],shape:"polygon",id:"big"});
            
              var cc = config.extensions.VismoMocks.canvas({shapes:[smallshape,bigshape]});
             var val = cc.getShapeAtPosition(50,50);

             same(val.getProperty("id"),"small","found the right shape");          
        });
        test("zIndexChanging", function(){
           var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small","z-index":"0"});
           var bigshape = new VismoShape({coordinates:[0,0,100,0,100,100,0,100],shape:"polygon",id:"big","z-index":"2"});
            var cc = config.extensions.VismoMocks.canvas({shapes:[smallshape,bigshape]});
            
            //run
            cc.render();
           var mem = cc.getMemory();
           var firstdrawn = mem[0].getProperty("id");
         
           //change z-indexes
           mem[0].setProperty("z-index","500");
           
           //run again
           cc.render();

           mem = cc.getMemory();
          var firstdrawntwo = mem[0].getProperty("id");
           same([firstdrawn,firstdrawntwo],["small","big"],"shapes drawn in correct order");
                
        });
test("getShapeWithID", function(){
            var s1 = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"a","z-index":"0"});
            var s2 = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"b","z-index":"0"});
            var cc = config.extensions.VismoMocks.canvas({shapes:[s1,s2]});
            
            var theshape = cc.getShapeWithID("b");
            same(theshape,s2,"got right shape");
        });
test("clear", function(){
            var s1 = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"a","z-index":"0"});
            var s2 = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"b","z-index":"0"});
            var cc = config.extensions.VismoMocks.canvas({shapes:[s1,s2]});
            
            var theshape = cc.getShapeWithID("b");
            
            cc.clear(true);
            var theshapeafter = cc.getShapeWithID("b");
            same([theshape,theshapeafter],[s2,false],"the shape disappeared and therefore can no longer be found");
        });
