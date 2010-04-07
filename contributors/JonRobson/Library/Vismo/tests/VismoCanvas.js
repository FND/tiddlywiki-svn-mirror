module("VISMO VismoCanvas");
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
