VismoTests.add("VismoCanvas", {
        _inPoly: function(){
             var poly = new VismoShape({coordinates:[0,0,100,0,100,100,0,100],shape:"polygon",id:"big"});
            var cc = VismoTests.Mocks.canvas();
              var val = cc._inPoly(20,20,poly);
                return VismoTests.assertEqual(val,true);
                return true;
        },
        _inPolyZoomedIn: function(){
          var poly = new VismoShape({coordinates:[0,0,100,0,100,100,0,100],shape:"polygon",id:"big"});
            
              var cc = VismoTests.Mocks.canvas({shapes:[poly],vismoController:{}});
              cc.vismoController.zoom(16,16);
             
             var val = cc._inPoly(60,69,poly);

             return VismoTests.assertEqual(val,true);
        }
        ,_inCircle: function(){
            var cc = VismoTests.Mocks.canvas();
            var val = cc._inCircle(60,69,new VismoShape({coordinates:[50,50,20],shape:"circle"}));
            return VismoTests.assertEqual(val,true);
            
        }
        ,_inCircleZoomedIn: function(){
                var circle = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"circle","z-index":"3"});
                
                  var cc = VismoTests.Mocks.canvas({shapes:[circle],vismoController:{}});
                  cc.vismoController.zoom(16,16);
                  var t= cc.getTransformation();
                 var val = cc._inCircle(52,52,circle);

                 return VismoTests.assertEqual(val,true);
        }
        ,_inCircle_Point: function(){
               var point= new VismoShape({coordinates:[5,5],shape:"point",id:"jon","z-index":"3"});
                var cc = VismoTests.Mocks.canvas({pointsize:3,shapes:[point],vismoController:{}});
                var t =cc.getShapeWithID("jon");
                var val = cc._inCircle(7,7,t); //circumference ends at 6.5,6.5
                var val2 = cc._inCircle(6,6,t);
                 var bb = t.getBoundingBox();
                  var d= t.getDimensions();
                 return VismoTests.assertAllEqual([[t.options.pointsize,3],[bb.width,3],[bb.height,3],[bb.x1,3.5],[d.width,3],[d.height,3],[val2,true],[val,false]]);
        }
        
        ,_inCircle_Point2: function(){
               var point= new VismoShape({coordinates:[100,100],shape:"point",id:"testpoint","z-index":"3"});
                var cc = VismoTests.Mocks.canvas({pointsize:2,shapes:[point],vismoController:{}});
                var spoint =cc.getShapeWithID("testpoint")
                var val = cc._inCircle(103,103,spoint);
                var bb = spoint.getBoundingBox();
                 return VismoTests.assertAllEqual([[bb.width,2],[val,false]]);
        }
        
        ,_inCircle2: function(){
               var cc = VismoTests.Mocks.canvas();
                var val = cc._inCircle(100,100,new VismoShape({coordinates:[50,50,20],shape:"circle"}));
                return VismoTests.assertEqual(val,false);
        }
        ,getShapeAtPosition:  function(){
             var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small","z-index":"3"});
             var bigshape = new VismoShape({coordinates:[50,50,100],shape:"circle",id:"big","z-index":"1"});
            
              var cc = VismoTests.Mocks.canvas({shapes:[smallshape,bigshape]});
             var val = cc.getShapeAtPosition(60,69);

             return VismoTests.assertEqual(val.getProperty("id"),"small");
                
        }
        ,getShapeAtPosition_unclickableproperty:  function(){
             var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small",unclickable:true,"z-index":"3"});
             var bigshape = new VismoShape({coordinates:[50,50,100],shape:"circle",id:"big","z-index":"1"});
            
              var cc = VismoTests.Mocks.canvas({shapes:[smallshape,bigshape]});
             var val = cc.getShapeAtPosition(60,69);

             return VismoTests.assertEqual(val.getProperty("id"),"big");
                
        }
        ,getShapeAtPositionTriangle: function(){
            var tri = new VismoShape({id:"tri",coordinates:[0,0,200,0,200,200], shape:"polygon"});
            var cc = VismoTests.Mocks.canvas({shapes:[tri]});
             var val = cc.getShapeAtPosition(20,190);
             var val2 = cc.getShapeAtPosition(199,190);
             return VismoTests.assertAllEqual([[val,false],[val2.getProperty("id"),"tri"]]);
        }
        ,getShapeAtPositionZoomedIn:  function(){
             var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small","z-index":"3"});
             var bigshape = new VismoShape({coordinates:[50,50,100],shape:"circle",id:"big","z-index":"1"});
            
              var cc = VismoTests.Mocks.canvas({shapes:[smallshape,bigshape],vismoController:{}});
              cc.vismoController.zoom(16,16)
        
             var val = cc.getShapeAtPosition(60,69);
             var bb = smallshape.getBoundingBox();
             return VismoTests.assertAllEqual([[val.getProperty("id"),"small"]]);
                
        }
        
        
        ,getShapeAtPosition2:  function(){
            //big above small
             var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small","z-index":"1"});
             var bigshape = new VismoShape({coordinates:[50,50,100],shape:"circle",id:"big","z-index":"3"});
            
              var cc = VismoTests.Mocks.canvas({shapes:[smallshape,bigshape]});
             var val = cc.getShapeAtPosition(30,39);

             return VismoTests.assertEqual(val.getProperty("id"),"big");          
        }
        
        ,getShapeAtPosition3:  function(){
            //big above small
             var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small","z-index":"1"});
             var bigshape = new VismoShape({coordinates:[50,50,100],shape:"circle",id:"big"});
            
              var cc = VismoTests.Mocks.canvas({shapes:[smallshape,bigshape]});
             var val = cc.getShapeAtPosition(60,69);

             return VismoTests.assertEqual(val.getProperty("id"),"small");          
        }
        ,getShapeAtPositionCircleVsPoly:  function(){
            //big above small
             var smallshape = new VismoShape({coordinates:[50,50,20],shape:"circle",id:"small","z-index":"1"});
             var bigshape = new VismoShape({coordinates:[0,0,100,0,100,100,0,100],shape:"polygon",id:"big"});
            
              var cc = VismoTests.Mocks.canvas({shapes:[smallshape,bigshape]});
             var val = cc.getShapeAtPosition(50,50);

             return VismoTests.assertEqual(val.getProperty("id"),"small");          
        }
        
        /*,isOverlap: function(){
            var shape1=  new VismoShape({id:"tri1",coordinates:[0,0,200,0,200,200], shape:"polygon"});
            var shape2=  new VismoShape({id:"tri2",coordinates:[50,0,300,0,300,300], shape:"polygon"});
            var shape3=  new VismoShape({id:"tri3",coordinates:[0,300,300,300,600,600], shape:"polygon"});
            
            var cc = VismoTests.Mocks.canvas({shapes:[shape1,shape2,shape3]});
            var res1 = cc.isOverlap(shape1,shape2);
            var res2 =  cc.isOverlap(shape1,shape3);
        }*/
        

    }
);